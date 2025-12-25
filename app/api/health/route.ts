export async function GET() {
  return Response.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "nextlot-api-proxy"
    },
    meta: {
      version: "1.0.0",
      environment: process.env.NODE_ENV || "production"
    }
  })
}