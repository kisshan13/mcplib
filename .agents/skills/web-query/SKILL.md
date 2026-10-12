---
name: web-query
description: Add a frontend API endpoint and React Query hook to apps/web.
---

skill:
api_files:
client: apps/web/src/core-api/api.ts
resource_group: apps/web/src/core-api/<resource>.api.ts
types: apps/web/src/core-api/types/<resource>.ts
hook: apps/web/src/hooks/query/<resource>.query.ts
rules: - use the shared axios client - keep response types in the resource group's core-api types file - keep one core API file per resource group - keep one query hook file per resource group - colocate query and mutation hooks in the same resource-group file - every exported core API function must begin with api - provide an appropriate query hook for every read operation - provide a mutation hook for every write operation - hooks must call core API functions and must not duplicate request logic - group related resource operations together, including nested organization resources - do not create separate query and mutation files for one resource group - do not create endpoint-specific core API or hook fragments - use useWrappedMutation from apps/web/src/query-provider.tsx for mutations - use stable query keys named after the resource group - use the shared QueryProvider - keep API calls out of presentational components - preserve existing cache invalidation and dependent-query behavior - new features must follow this resource-group architecture
