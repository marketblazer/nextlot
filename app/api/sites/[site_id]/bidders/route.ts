async function resolveToken(req: Request) {
  const direct = req.headers.get('Nextlot-Server-Token') || ''
  if (direct) return direct
  const envTok = process.env.NEXTLOT_SERVER_TOKEN || ''
  if (envTok) return envTok
  const resolverUrl = process.env.GHL_TOKEN_RESOLVER_URL || ''
  if (!resolverUrl) return ''
  const url = new URL(req.url)
  const locationId = req.headers.get('x-ghl-location-id') || req.headers.get('x-ghl-account-id') || url.searchParams.get('location_id') || url.searchParams.get('account_id') || ''
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const subdomain = (host || '').split('.')[0] || ''
  const params = new URLSearchParams()
  if (locationId) params.set('location_id', locationId)
  if (subdomain) params.set('subdomain', subdomain)
  const headers: Record<string, string> = { accept: 'application/json' }
  const serviceKey = process.env.GHL_SERVICE_API_KEY || ''
  if (serviceKey) headers['authorization'] = `Bearer ${serviceKey}`
  try {
    const resp = await fetch(`${resolverUrl}?${params.toString()}`, { headers })
    const json = await resp.json().catch(() => ({} as any))
    return json.token || ''
  } catch {
    return ''
  }
}

export async function POST(req: Request, context: { params: Promise<{ site_id: string }> }) {
  const { site_id } = await context.params
  const base = process.env.PROXY_TARGET || 'https://api-backend.nextlot.net/api/backend/v1'
  const targetUrl = `${base}/sites/${site_id}/bidders`
  const headers: Record<string, string> = { accept: 'application/json', 'content-type': 'application/json' }
  const token = await resolveToken(req)
  if (token) headers['Nextlot-Server-Token'] = token
  const body = await req.text()

  try {
    const resp = await fetch(targetUrl, { method: 'POST', headers, body })
    const text = await resp.text()
    const isJson = (resp.headers.get('content-type') || '').includes('application/json')
    let data: any
    try { data = isJson ? JSON.parse(text) : text } catch { data = text }
    return Response.json({
      success: resp.status >= 200 && resp.status < 300,
      data: data,
      meta: {
        status: resp.status,
        statusText: resp.statusText,
        siteId: site_id,
        endpoint: 'bidders_create',
        timestamp: new Date().toISOString()
      }
    })
  } catch (e: any) {
    return Response.json({
      success: false,
      error: {
        type: 'bad_gateway',
        message: 'Failed to connect to backend service',
        detail: String(e)
      },
      meta: {
        siteId: site_id,
        endpoint: 'bidders_create',
        timestamp: new Date().toISOString()
      }
    }, { status: 502 })
  }
}