export async function GET(req: Request, context: { params: Promise<{ site_id: string }> }) {
  const { site_id } = await context.params
  const base = process.env.PROXY_TARGET || 'https://api-backend.nextlot.net/api/backend/v1';
  const targetUrl = `${base}/sites/${site_id}/auctions`
  const headers: Record<string, string> = { accept: 'application/json' }
  const token = req.headers.get('Nextlot-Server-Token') || process.env.NEXTLOT_SERVER_TOKEN || ''
  if (token) headers['Nextlot-Server-Token'] = token
  
  try {
    const resp = await fetch(targetUrl, { headers })
    const body = await resp.text()
    const isJson = (resp.headers.get('content-type') || '').includes('application/json')
    
    let data: any
    try {
      data = isJson ? JSON.parse(body) : body
    } catch {
      data = body
    }
    
    // Return Zapier-like structured JSON
    return Response.json({
      success: resp.status >= 200 && resp.status < 300,
      data: data,
      meta: {
        status: resp.status,
        statusText: resp.statusText,
        siteId: site_id,
        endpoint: 'auctions_list',
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
        endpoint: 'auctions_list',
        timestamp: new Date().toISOString()
      }
    }, { status: 502 })
  }
}

export async function POST(req: Request, context: { params: Promise<{ site_id: string }> }) {
  const { site_id } = await context.params
  const base = process.env.PROXY_TARGET || 'https://api-backend.nextlot.net/api/backend/v1';
  const targetUrl = `${base}/sites/${site_id}/auctions`
  const headers: Record<string, string> = { accept: 'application/json', 'content-type': 'application/json' }
  const token = req.headers.get('Nextlot-Server-Token') || process.env.NEXTLOT_SERVER_TOKEN || ''
  if (token) headers['Nextlot-Server-Token'] = token
  const body = await req.text()
  
  try {
    const resp = await fetch(targetUrl, { method: 'POST', headers, body })
    const text = await resp.text()
    const isJson = (resp.headers.get('content-type') || '').includes('application/json')
    
    let data: any
    try {
      data = isJson ? JSON.parse(text) : text
    } catch {
      data = text
    }
    
    // Return Zapier-like structured JSON
    return Response.json({
      success: resp.status >= 200 && resp.status < 300,
      data: data,
      meta: {
        status: resp.status,
        statusText: resp.statusText,
        siteId: site_id,
        endpoint: 'auctions_create',
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
        endpoint: 'auctions_create',
        timestamp: new Date().toISOString()
      }
    }, { status: 502 })
  }
}