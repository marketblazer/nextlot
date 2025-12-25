// Direct test of Next.js App Router endpoint
// This tests the Zapier-like JSON format directly

async function run() {
  const siteId = process.argv[2] || '2226717'
  const authHeaders = { 
    'Nextlot-Server-Token': process.env.NEXTLOT_SERVER_TOKEN || '8accf323-3f49-45cc-82ca-0c26e4b2e765', 
    'accept': 'application/json' 
  }

  console.log(`Testing Next.js App Router endpoint: http://localhost:3000/api/sites/${siteId}/info`)
  
  try {
    const resp = await fetch(`http://localhost:3000/api/sites/${siteId}/info`, { headers: authHeaders })
    const text = await resp.text()
    let body: any
    try { body = JSON.parse(text) } catch { body = text }
    
    console.log('\n✅ Next.js App Router API Test Results')
    console.log('=====================================')
    console.log('Status:', resp.status)
    console.log('Headers:', Object.fromEntries(resp.headers.entries()))
    console.log('Body (Zapier-like format):')
    console.log(JSON.stringify(body, null, 2))
    
    // Verify Zapier-like format
    if (body && typeof body === 'object') {
      console.log('\n✅ Format Validation:')
      console.log('- Has success field:', 'success' in body)
      console.log('- Has data field:', 'data' in body)
      console.log('- Has meta field:', 'meta' in body)
      if ('success' in body) console.log('- Success is boolean:', typeof body.success === 'boolean')
      if ('data' in body) console.log('- Data is object:', typeof body.data === 'object')
      if ('meta' in body) console.log('- Meta is object:', typeof body.meta === 'object')
      
      // Show expected vs actual format
      console.log('\n✅ Expected Zapier Format:')
      console.log(JSON.stringify({
        success: true,
        data: {
          site_name: "Government Auction.com",
          default_domain: "governmentauction.placebids.net"
        },
        meta: {
          status: 200,
          statusText: "OK",
          siteId: siteId,
          endpoint: "site_info",
          timestamp: "2025-12-25T12:31:42.000Z"
        }
      }, null, 2))
    }
  } catch (e: any) {
    console.error('Error:', String(e))
    console.log('\n💡 Make sure Next.js dev server is running with: npm run dev')
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})