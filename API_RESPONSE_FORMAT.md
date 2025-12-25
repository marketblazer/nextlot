# API Response Format Standards

This document outlines the standardized JSON response format used across all Next.js API route handlers, following Zapier's webhook response patterns.

## Response Format Structure

All API responses now follow a consistent Zapier-like JSON format with three main fields:

```json
{
  "success": boolean,
  "data": any,
  "meta": object
}
```

### Field Descriptions

- **`success`** (boolean): Indicates whether the request was successful
  - `true` for successful responses (2xx status codes)
  - `false` for error responses (4xx, 5xx status codes)

- **`data`** (any): Contains the actual response data
  - For successful requests: the requested data from the backend service
  - For error requests: may be omitted or contain partial data

- **`meta`** (object): Contains metadata about the request/response
  - Common fields include:
    - `status`: HTTP status code
    - `statusText`: HTTP status text
    - `endpoint`: Name of the endpoint (e.g., 'site_info', 'auctions_list')
    - `timestamp`: ISO timestamp of the response
    - `siteId`, `auctionId`: Context-specific identifiers
    - `version`: API version (where applicable)

## Error Response Format

For error responses, the format includes an additional `error` field:

```json
{
  "success": false,
  "error": {
    "type": "error_type",
    "message": "Human-readable error message",
    "detail": "Additional error details"
  },
  "meta": {
    "timestamp": "2025-12-18T13:08:20.289Z",
    "endpoint": "endpoint_name"
  }
}
```

## Examples

### Successful Health Check
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-12-18T13:08:20.289Z",
    "service": "nextlot-api-proxy"
  },
  "meta": {
    "version": "1.0.0",
    "environment": "production"
  }
}
```

### Site Info Response
```json
{
  "success": true,
  "data": {
    "site_id": "123",
    "name": "Example Site",
    "description": "Site description"
  },
  "meta": {
    "status": 200,
    "statusText": "OK",
    "siteId": "123",
    "endpoint": "site_info",
    "timestamp": "2025-12-18T13:08:20.289Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "type": "bad_gateway",
    "message": "Failed to connect to backend service",
    "detail": "Connection timeout"
  },
  "meta": {
    "siteId": "123",
    "endpoint": "site_info",
    "timestamp": "2025-12-18T13:08:20.289Z"
  }
}
```

## Updated Endpoints

The following endpoints have been updated to use this format:

1. **Health Check** - `GET /api/health`
2. **Site Information** - `GET /api/sites/[site_id]/info`
3. **Auctions List/Create** - `GET/POST /api/sites/[site_id]/auctions`
4. **Lots List** - `GET /api/sites/[site_id]/auctions/[auction_id]/lots`

## Benefits

- **Consistency**: All endpoints return data in the same predictable format
- **Webhook-Friendly**: Compatible with Zapier and similar integration platforms
- **Error Handling**: Clear error information with structured error objects
- **Metadata**: Rich context information for debugging and monitoring
- **Type Safety**: Predictable structure for TypeScript consumers