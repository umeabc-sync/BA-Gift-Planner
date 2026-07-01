import { Hono } from 'hono'

const app = new Hono()

app.get('/api/ping', (c) => {
  return c.json({ message: 'pong', status: 'ok', time: new Date().toISOString() })
})

// 讓所有非 API 的請求，直接去撈 Cloudflare 的靜態資產
app.get('*', async (c) => {
  // 如果找不到檔案，Cloudflare 會根據 wrangler.toml 的設定自動吐出 index.html
  return await c.env.ASSETS.fetch(c.req.raw)
})

export default app
