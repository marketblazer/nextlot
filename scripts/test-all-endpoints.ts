// Comprehensive test of all Next.js API endpoints with Zapier format
async function run() {
  const token = process.env.NEXTLOT_SERVER_TOKEN || '8accf323-3f49-45cc-82ca-0c26e4b2e765'
  const siteId = '2226717'
  const auctionId = 'testAuction'
  
  const authHeaders = { 
    'Nextlot-Server-Token': token, 
    'accept': 'application/json' 
  }

  console.log('🧪 Testing All Next.js API Endpoints')
  console.log('=====================================')
  console.log(`Token: ${token.substring(0, 8)}...`)
  console.log(`Site ID: ${siteId}`)
  console.log(`Auction ID: ${auctionId}`)
  console.log('')

  const endpoints = [
    { method: 'GET', path: '/api/health', description: 'Health Check' },
    { method: 'GET', path: `/api/sites/${siteId}/info`, description: 'Site Info' },
    { method: 'GET', path: `/api/sites/${siteId}/auctions`, description: 'List Auctions' },
    { method: 'POST', path: `/api/sites/${siteId}/auctions`, description: 'Create Auction', body: { name: 'Test Auction', description: 'Test' } },
    { method: 'GET', path: `/api/sites/${siteId}/auctions/${auctionId}/lots`, description: 'List Lots' },
    { method: 'GET', path: `/api/proxy/sites/${siteId}/info`, description: 'Proxy Site Info' },
    { method: 'GET', path: `/api/proxy/sites/${siteId}/auctions`, description: 'Proxy List Auctions' },
    { method: 'POST', path: `/api/proxy/sites/${siteId}/auctions`, description: 'Proxy Create Auction', body: { name: 'Test Auction', description: 'Test' } }
  ]

  for (const endpoint of endpoints) {
    console.log(`\n📍 Testing: ${endpoint.method} ${endpoint.path}`)
    console.log(`   Description: ${endpoint.description}`)
    
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: authHeaders
      }
      
      if (endpoint.body && endpoint.method === 'POST') {
        options.headers = { ...authHeaders, 'content-type': 'application/json' }
        options.body = JSON.stringify(endpoint.body)
      }
      
      const resp = await fetch(`https://api-backend.nextlot.net${endpoint.path}`, options)
      const text = await resp.text()
      let body: any
      try { body = JSON.parse(text) } catch { body = text }
      
      console.log(`   Status: ${resp.status} ${resp.statusText}`)
      
      // Check if response has Zapier format
      if (body && typeof body === 'object') {
        const hasSuccess = 'success' in body
        const hasData = 'data' in body
        const hasMeta = 'meta' in body
        
        if (hasSuccess && hasData && hasMeta) {
          console.log(`   ✅ Zapier Format: SUCCESS`)
          console.log(`   - Success: ${body.success} (${typeof body.success})`)
          console.log(`   - Data type: ${typeof body.data}`)
          console.log(`   - Meta type: ${typeof body.meta}`)
          if (body.meta && body.meta.endpoint) {
            console.log(`   - Endpoint: ${body.meta.endpoint}`)
          }
        } else {
          console.log(`   ⚠️  Raw Response (not Zapier format)`)
          console.log(`   - Response keys: ${Object.keys(body).join(', ')}`)
        }
      } else {
        console.log(`   📄 Raw Response: ${typeof body}`)
      }
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
  
  console.log('\n✅ All endpoint tests completed!')
}

run().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})