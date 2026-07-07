/* global HTMLRewriter */
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

// Helper function: Retrieves the redirected URL and handles header rewriting issues by Wrangler during local development
function getRedirectUri(c, reqUrl, phase) {
  if (c.env.ENVIRONMENT === 'production') {
    return `${reqUrl.origin}/api/auth/google/callback`
  }
  
  const host = c.req.header('x-forwarded-host') || c.req.header('host') || reqUrl.host
  const proto = c.req.header('x-forwarded-proto') || 'http'
  
  const uri = `${proto}://${host}/api/auth/google/callback`
  console.log(`[DEBUG] getRedirectUri (${phase}):`, uri, '| host:', host)
  return uri
}

// Redirecting to the Google login screen
app.get('/api/auth/google/login', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const url = new URL(c.req.url)
  const redirectUri = getRedirectUri(c, url, 'login')
  const isLocal = c.env.ENVIRONMENT !== 'production'

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
  const redirectUri = getRedirectUri(c, url, 'callback')
  const isLocal = c.env.ENVIRONMENT !== 'production'

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

// === Multilingual SEO Meta Injection ===

const SEO_CONFIG = {
  en: {
    title: 'Blue Archive Gift Planner | BA Gift Planner',
    description:
      'Calculate the most cost-effective gifts in Blue Archive. Features a bond calculator and inventory manager to find the optimal gift distribution and maximize bond levels.',
    lang: 'en',
  },
  'zh-tw': {
    title: '蔚藍檔案禮物規劃器 | BA Gift Planner',
    description:
      '快速規劃蔚藍檔案（Blue Archive）中最划算的送禮方案。同時支援羈絆目標測算與禮物合成管理，精確分配資源，輕鬆提升學生好感度！',
    lang: 'zh-Hant',
  },
  'zh-cn': {
    title: '蔚蓝档案礼物规划器 | BA Gift Planner',
    description:
      '快速规划蔚蓝档案（Blue Archive）中性价比最高的送礼方案。同时支持羁绊目标测算与礼物合成管理，精确分配资源，轻松提升学生好感度！',
    lang: 'zh-Hans',
  },
  ja: {
    title: 'ブルーアーカイブ ギフトプランナー | BA Gift Planner',
    description:
      'ブルーアーカイブ（ブルアカ）で最も効率の良い贈り物の組み合わせを計算。絆ランク目標のシミュレートや贈り物在庫の合成管理機能も搭載！',
    lang: 'ja',
  },
  ko: {
    title: '블루 아카이브 선물 플래너 | BA Gift Planner',
    description:
      '블루 아카이브에서 가장 가성비 좋은 선물 계획을 계산하고 제안합니다. 인연 목표 계산기 및 선물 제작(합성) 관리 기능으로 더욱 효율적으로 인연 랭크를 올려보세요.',
    lang: 'ko',
  },
}

app.all('*', async (c) => {
  const url = new URL(c.req.url)

  // If it is an API request but was not matched by previous routes, return 404
  if (url.pathname.startsWith('/api/')) {
    return c.json({ error: 'Not Found' }, 404)
  }

  // Serve index.html with dynamically rewritten SEO tags
  try {
    const htmlResponse = await c.env.ASSETS.fetch(new Request(url.origin))

    // Determine language (priority: ?lang= query param > Accept-Language header > default to 'en')
    let lang = url.searchParams.get('lang')?.toLowerCase() || ''
    const validLocales = ['en', 'ja', 'ko', 'zh-cn', 'zh-tw']

    if (!validLocales.includes(lang)) {
      const acceptLang = c.req.header('accept-language') || ''
      if (acceptLang.includes('zh-TW') || acceptLang.includes('zh-HK')) lang = 'zh-tw'
      else if (acceptLang.includes('zh')) lang = 'zh-cn'
      else if (acceptLang.includes('ja')) lang = 'ja'
      else if (acceptLang.includes('ko')) lang = 'ko'
      else lang = 'en'
    }

    const seo = SEO_CONFIG[lang] || SEO_CONFIG['en']

    // SEO Optimization: Since '/' redirects to '/gift-recommendation' in SPA,
    // we rewrite the canonical path for '/' to prevent search engines from indexing duplicate content.
    const normalizedPath = url.pathname === '/' ? '/gift-recommendation' : url.pathname
    const canonicalUrl = `${url.origin}${normalizedPath}?lang=${lang}`

    return new HTMLRewriter()
      .on('html', {
        element(el) {
          el.setAttribute('lang', seo.lang)
        },
      })
      .on('title', {
        element(el) {
          el.replace(`<title>${seo.title}</title>`, { html: true })
        },
      })
      .on('meta[name="description"]', {
        element(el) {
          el.setAttribute('content', seo.description)
        },
      })
      .on('meta[property="og:title"]', {
        element(el) {
          el.setAttribute('content', seo.title)
        },
      })
      .on('meta[property="og:description"]', {
        element(el) {
          el.setAttribute('content', seo.description)
        },
      })
      .on('meta[property="og:url"]', {
        element(el) {
          el.setAttribute('content', canonicalUrl)
        },
      })
      .on('meta[name="twitter:title"]', {
        element(el) {
          el.setAttribute('content', seo.title)
        },
      })
      .on('meta[name="twitter:description"]', {
        element(el) {
          el.setAttribute('content', seo.description)
        },
      })
      .on('head', {
        element(el) {
          // Canonical URL
          el.append(`<link rel="canonical" href="${canonicalUrl}" />`, { html: true })

          // Multi-language alternates (hreflang)
          for (const [key, config] of Object.entries(SEO_CONFIG)) {
            const alternateUrl = `${url.origin}${normalizedPath}?lang=${key}`
            el.append(`<link rel="alternate" hreflang="${config.lang}" href="${alternateUrl}" />`, { html: true })
          }
          // Default fallback
          el.append(`<link rel="alternate" hreflang="x-default" href="${url.origin}${normalizedPath}?lang=en" />`, {
            html: true,
          })
        },
      })
      .transform(htmlResponse)
  } catch (err) {
    return c.text(`Internal Server Error: ${err.message}\n${err.stack}`, 500)
  }
})

export default app
