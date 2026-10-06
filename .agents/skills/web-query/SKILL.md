---
name: web-query
description: Add a frontend API endpoint and React Query hook to apps/web.
---
skill:
  api_files:
    client: apps/web/src/core-api/api.ts
    endpoint: apps/web/src/core-api/<name>.api.ts
    types: apps/web/src/core-api/types.ts
  hook: apps/web/src/hooks/query/use-<name>-query.ts
  rules:
    - use the shared axios client
    - keep response types in core-api/types.ts
    - use a stable query key named after the endpoint
    - use the shared QueryProvider
    - keep API calls out of presentational components
