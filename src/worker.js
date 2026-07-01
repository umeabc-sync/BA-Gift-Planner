import { Hono } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'

const app = new Hono()

app.get('/api/ping', (c) => {
  return c.json({ message: 'pong', status: 'ok', time: new Date().toISOString() })
})

// === Google OAuth 登入流程 ===

// 1. 導向 Google 登入畫面
app.get('/api/auth/google/login', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  // 注意：這裡先寫死成本地 Vite 伺服器的網址。實際上線時需要判斷環境或改成正式網址。
  const redirectUri = 'http://localhost:5173/api/auth/google/callback'

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  })

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

// 2. Google 登入後的回呼 (Callback)
app.get('/api/auth/google/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.text('Missing code', 400)

  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET
  const redirectUri = 'http://localhost:5173/api/auth/google/callback'

  // 拿 Code 去換 Token
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

  // 從 Google 取得使用者資訊
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const userData = await userRes.json()

  if (!userData.id) return c.text('Failed to get user info', 400)

  // 寫入 D1 資料庫 (如果帳號已存在則更新最後登入時間)
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

  // 產生我們自己的 JWT Session (只把 ID 和 Name 塞進去)
  const sessionPayload = {
    id: userData.id,
    name: userData.name,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 天過期
  }
  const token = await sign(sessionPayload, c.env.JWT_SECRET, 'HS256')

  // 設定 HttpOnly Cookie，讓前端無法被 XSS 偷取
  setCookie(c, 'session', token, {
    path: '/',
    httpOnly: true,
    secure: false, // 本地開發先設為 false，上線時應設為 true
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'Lax',
  })

  // 登入成功，導向回前端首頁
  return c.redirect('/')
})

// 3. 取得目前登入狀態 (前端初始化時呼叫)
app.get('/api/auth/me', async (c) => {
  const token = getCookie(c, 'session')
  if (!token) return c.json({ user: null, debug: 'no_cookie' })

  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
    return c.json({ user: { id: payload.id, name: payload.name } })
  } catch (e) {
    // JWT 過期或偽造
    return c.json({ user: null, debug: 'verify_failed', error: e.message })
  }
})

// === 雲端存檔同步流程 ===

// 取得存檔
app.get('/api/sync/download', async (c) => {
  const token = getCookie(c, 'session')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  let payload
  try {
    payload = await verify(token, c.env.JWT_SECRET, 'HS256')
  } catch (e) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const result = await c.env.DB.prepare('SELECT state_payload FROM user_data WHERE user_id = ?')
    .bind(payload.id)
    .first()
  if (!result) return c.json({ payload: null })

  return c.json({ payload: result.state_payload })
})

// 上傳存檔
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

  await c.env.DB.prepare(
    `
    INSERT INTO user_data (user_id, state_payload, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET 
      state_payload = excluded.state_payload,
      updated_at = CURRENT_TIMESTAMP
  `
  )
    .bind(payload.id, body.payload)
    .run()

  return c.json({ success: true })
})

// 4. 登出
app.post('/api/auth/logout', (c) => {
  setCookie(c, 'session', '', { path: '/', maxAge: 0 })
  return c.json({ success: true })
})

export default app
