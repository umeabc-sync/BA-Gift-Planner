import { Hono } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'

const SESSION_EXPIRES = 60 * 60 * 24 * 30 // 30 days
const SESSION_REFRESH_THRESHOLD = 60 * 60 * 24 * 15 // 15 days

const app = new Hono()

app.get('/api/ping', (c) => {
  return c.json({ message: 'pong', status: 'ok', time: new Date().toISOString() })
})

// === Google OAuth Login Process ===

// Redirecting to the Google login screen
app.get('/api/auth/google/login', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const url = new URL(c.req.url)
  const isLocal = c.env.ENVIRONMENT !== 'production'
  const redirectUri = isLocal
    ? 'http://localhost:5173/api/auth/google/callback'
    : `${url.origin}/api/auth/google/callback`

  const state = crypto.randomUUID()
  setCookie(c, 'oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: !isLocal,
    maxAge: 600,
    sameSite: 'Lax',
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state: state,
  })

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

// Google login callback
app.get('/api/auth/google/callback', async (c) => {
  const code = c.req.query('code')
  const returnedState = c.req.query('state')
  const savedState = getCookie(c, 'oauth_state')

  if (!code) return c.text('Missing code', 400)

  if (!returnedState || !savedState || returnedState !== savedState) {
    return c.text('Invalid state (CSRF detected)', 403)
  }

  setCookie(c, 'oauth_state', '', { path: '/', maxAge: 0 })

  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET

  const url = new URL(c.req.url)
  const isLocal = c.env.ENVIRONMENT !== 'production'
  const redirectUri = isLocal
    ? 'http://localhost:5173/api/auth/google/callback'
    : `${url.origin}/api/auth/google/callback`

  // Exchange Code for Token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    return c.text('Failed to get token from Google', 400)
  }

  // Obtaining user information from Google
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const userData = await userRes.json()

  if (!userData.id) return c.text('Failed to get user info', 400)

  // Write to the D1 database (update the last login time if the account already exists)
  await c.env.DB.prepare(
    `
    INSERT INTO users (id, provider, name, email) 
    VALUES (?, 'google', ?, ?) 
    ON CONFLICT(id) DO UPDATE SET 
      name = excluded.name, 
      last_login = CURRENT_TIMESTAMP
  `
  )
    .bind(userData.id, userData.name, userData.email)
    .run()

  // Generate JWT Session
  const sessionPayload = {
    id: userData.id,
    name: userData.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRES, // Expires in 30 days
  }
  const token = await sign(sessionPayload, c.env.JWT_SECRET, 'HS256')

  // Configure HttpOnly Cookie to prevent the front end from being stolen by XSS
  setCookie(c, 'session', token, {
    path: '/',
    httpOnly: true,
    secure: !isLocal, // Set to true (HTTPS) when deployed online, and false for local development
    maxAge: SESSION_EXPIRES,
    sameSite: 'Lax',
  })

  // Login successful, redirected back to the homepage.
  return c.redirect('/')
})

// Get the current login status (called during frontend initialization)
app.get('/api/auth/me', async (c) => {
  const token = getCookie(c, 'session')
  if (!token) return c.json({ user: null, debug: 'no_cookie' })

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')

    // --- Sliding Session Expiration ---
    const now = Math.floor(Date.now() / 1000)
    const timeRemaining = payload.exp - now

    // If the token expires in less than 15 days, issue a new one extending it back to 30 days
    if (timeRemaining < SESSION_REFRESH_THRESHOLD) {
      const newPayload = {
        id: payload.id,
        name: payload.name,
        exp: now + SESSION_EXPIRES, // 30 days from now
      }
      const newToken = await sign(newPayload, c.env.JWT_SECRET, 'HS256')

      const isLocal = c.env.ENVIRONMENT !== 'production'

      setCookie(c, 'session', newToken, {
        path: '/',
        httpOnly: true,
        secure: !isLocal,
        maxAge: SESSION_EXPIRES,
        sameSite: 'Lax',
      })
    }

    return c.json({ user: { id: payload.id, name: payload.name } })
  } catch (e) {
    // JWT expired or counterfeit
    return c.json({ user: null, debug: 'verify_failed', error: e.message })
  }
})

// === Cloud Archive Synchronization Process ===

// Get the archive
app.get('/api/sync/download', async (c) => {
  const token = getCookie(c, 'session')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  let payload
  try {
    payload = await verify(token, c.env.JWT_SECRET, 'HS256')
  } catch (e) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const lastKnownTimestamp = c.req.query('last_known_timestamp')

  const result = await c.env.DB.prepare('SELECT state_payload, updated_at FROM user_data WHERE user_id = ?')
    .bind(payload.id)
    .first()
  if (!result) return c.json({ payload: null })

  // 304 Optimization: return 304 if cloud matches client's last known timestamp
  if (lastKnownTimestamp && result.updated_at === lastKnownTimestamp) {
    return c.body(null, 304)
  }

  return c.json({
    payload: result.state_payload,
    updated_at: result.updated_at,
  })
})

// Upload archive
app.post('/api/sync/upload', async (c) => {
  const token = getCookie(c, 'session')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  let payload
  try {
    payload = await verify(token, c.env.JWT_SECRET, 'HS256')
  } catch (e) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json()
  if (!body.payload) return c.json({ error: 'Invalid payload' }, 400)

  const lastKnownTimestamp = body.last_known_timestamp

  // 1. Fetch current timestamp and state in the DB
  const current = await c.env.DB.prepare('SELECT updated_at, state_payload FROM user_data WHERE user_id = ?')
    .bind(payload.id)
    .first()

  // 2. Perform optimistic locking check
  if (current && lastKnownTimestamp && current.updated_at !== lastKnownTimestamp) {
    return c.json(
      {
        error: 'conflict',
        message: 'Cloud data has been updated by another device.',
        payload: current.state_payload,
        updated_at: current.updated_at,
      },
      409
    )
  }

  // 3. Insert or update the payload and return the new timestamp using RETURNING
  const updated = await c.env.DB.prepare(
    `
    INSERT INTO user_data (user_id, state_payload, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET 
      state_payload = excluded.state_payload,
      updated_at = CURRENT_TIMESTAMP
    RETURNING updated_at
  `
  )
    .bind(payload.id, body.payload)
    .first()

  return c.json({ success: true, updated_at: updated.updated_at })
})

// Logout
app.post('/api/auth/logout', (c) => {
  setCookie(c, 'session', '', { path: '/', maxAge: 0 })
  return c.json({ success: true })
})

export default app
