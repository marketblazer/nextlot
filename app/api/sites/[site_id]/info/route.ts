export async function GET(req: Request, ctx: { params: { site_id: string } }) {
  const base = process.env.NEXTLOT_BASE_URL || 'https://enter-base-url-here'
  const targetUrl = `${base}/sites/${ctx.params.site_id}/info`
  const headers: Record<string, string> = { accept: 'application/json' }
  const auth = req.headers.get('authorization')
  if (auth) headers['authorization'] = auth
  try {
    const resp = await fetch(targetUrl, { headers })
    const body = await resp.text()
    const isJson = (resp.headers.get('content-type') || '').includes('application/json')
    return new Response(isJson ? body : JSON.stringify({ data: body }), { status: resp.status, headers: { 'content-type': 'application/json' } })
  } catch (e: any) {
    return Response.json({ error: 'Bad Gateway', detail: String(e) }, { status: 502 })
  }
}