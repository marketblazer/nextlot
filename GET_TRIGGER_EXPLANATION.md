# GET Method Trigger Examples

## 🔄 How GET Triggers Work

### Direct API Endpoint Trigger
```
GET Request: /api/sites/123/info
├── Next.js Route: app/api/sites/[site_id]/info/route.ts
├── Function Called: export async function GET(req, context)
├── Parameters: { site_id: "123" }
├── Backend URL: https://api-backend.nextlot-beta.com/api/backend/v1/sites/123/info
└── Returns: Backend response
```

### Proxy Endpoint Trigger  
```
GET Request: /api/proxy/sites/123/info
├── Next.js Route: app/api/proxy/sites/[site_id]/info/route.ts
├── Function Called: export async function GET(req, context)
├── Parameters: { site_id: "123" }
├── Backend URL: https://api-backend.nextlot-beta.com/api/backend/v1/sites/123/info
└── Returns: Backend response (identical to direct API)
```

## 📋 Trigger Flow Comparison

| Step | Direct API | Proxy API |
|------|------------|-----------|
| 1. Request | `GET /api/sites/123/info` | `GET /api/proxy/sites/123/info` |
| 2. Route Match | `sites/[site_id]/info/route.ts` | `proxy/sites/[site_id]/info/route.ts` |
| 3. GET Trigger | `export function GET()` | `export function GET()` |
| 4. Parameter Extract | `site_id = "123"` | `site_id = "123"` |
| 5. Backend Forward | Same URL | Same URL |
| 6. Response | Identical | Identical |

## 🎯 Key Points

1. **Automatic Trigger**: Next.js automatically calls the `GET` function when a GET request matches the route
2. **Parameter Extraction**: `context.params` extracts URL parameters (like `site_id`)
3. **Header Forwarding**: Request headers (like `Authorization`) are automatically forwarded
4. **Backend Proxy**: The trigger fetches from the backend API and returns the response
5. **Identical Behavior**: Both direct and proxy endpoints work exactly the same way

## 🚀 Trigger Examples

### Health Check Trigger
```bash
# This triggers: app/api/health/route.ts
GET https://marketblazer-nextlot.vercel.app/api/health
# Calls: export async function GET()
# Returns: {"ok":true,"timestamp":"2025-12-11T22:16:58.381Z"}
```

### Site Info Trigger
```bash
# This triggers: app/api/sites/[site_id]/info/route.ts  
GET https://marketblazer-nextlot.vercel.app/api/sites/2226717/info
# Calls: export async function GET(req, {params: {site_id: "2226717"}})
# Forwards to: https://api-backend.nextlot-beta.com/api/backend/v1/sites/2226717/info
# Returns: Backend response
```

### Proxy Site Info Trigger
```bash
# This triggers: app/api/proxy/sites/[site_id]/info/route.ts
GET https://marketblazer-nextlot.vercel.app/api/proxy/sites/2226717/info
# Calls: export async function GET(req, {params: {site_id: "2226717"}})
# Forwards to: https://api-backend.nextlot-beta.com/api/backend/v1/sites/2226717/info
# Returns: Same backend response as direct API
```