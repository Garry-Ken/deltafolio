import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

function yahooProxyPlugin(): Plugin {
  let cachedCookie = ''
  let cachedCrumb = ''
  let lastFetched = 0

  async function ensureCrumb() {
    if (cachedCrumb && Date.now() - lastFetched < 3600_000) return
    try {
      const fc = await fetch('https://fc.yahoo.com', { redirect: 'manual' })
      const setCookie = fc.headers.getSetCookie?.() ?? []
      cachedCookie = setCookie.map((cookie: string) => cookie.split(';')[0]).join('; ')
      const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
        headers: { Cookie: cachedCookie, 'User-Agent': 'Mozilla/5.0' },
      })
      cachedCrumb = await crumbRes.text()
      lastFetched = Date.now()
    } catch { /* will retry next call */ }
  }

  return {
    name: 'yahoo-proxy',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/yf/')) return next()
        await ensureCrumb()
        const path = req.url.replace(/^\/yf/, '')
        const sep = path.includes('?') ? '&' : '?'
        const url = `https://query2.finance.yahoo.com${path}${sep}crumb=${encodeURIComponent(cachedCrumb)}`
        try {
          const resp = await fetch(url, {
            headers: {
              Cookie: cachedCookie,
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            },
          })
          res.statusCode = resp.status
          res.setHeader('Content-Type', resp.headers.get('content-type') ?? 'application/json')
          res.end(Buffer.from(await resp.arrayBuffer()))
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'Yahoo proxy failed' }))
        }
      })
    },
  }
}

export default defineConfig({
  base: process.env.CI ? '/deltafolio/' : './',
  plugins: [react(), yahooProxyPlugin()],
  server: { port: 5183 },
  build: { outDir: 'dist' },
})
