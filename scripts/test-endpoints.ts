import { createApp } from '../server/app.ts'

async function run() {
  const app = createApp()
  const server = app.listen(0)
  await new Promise<void>(resolve => server.once('listening', resolve))
  const addr = server.address()
  const port = typeof addr === 'object' && addr ? addr.port : 0
  const base = `http://127.0.0.1:${port}`

  const authHeaders = { Authorization: 'Bearer nextlot', accept: 'application/json' }

  const results: any[] = []

  async function call(path: string, init?: RequestInit) {
    try {
      const resp = await fetch(`${base}${path}`, init)
      const text = await resp.text()
      let body: any
      try { body = JSON.parse(text) } catch { body = text }
      results.push({ path, status: resp.status, body })
    } catch (e: any) {
      results.push({ path, error: String(e) })
    }
  }

  await call('/health')
  await call('/sites/test/info', { headers: authHeaders })
  await call('/sites/test/auctions', { headers: authHeaders })
  await call('/sites/test/auctions/testAuction/lots', { headers: authHeaders })

  server.close()
  console.log(JSON.stringify({ base, results }, null, 2))
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})