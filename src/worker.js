import { Hono } from 'hono'

const app = new Hono()

app.get('/api/ping', (c) => {
  return c.json({ message: 'pong', status: 'ok', time: new Date().toISOString() })
})

export default app
