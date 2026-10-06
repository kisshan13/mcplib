project:
  package_manager: pnpm
  validation:
    - pnpm run typecheck
    - pnpm run build

conventions:
  api:
    root: apps/api/src
    route_files: [index.ts, controller.ts, validator.ts, factory.ts]
    controller_prefix: controller
    handler: requestHandler
    response: ApiResponse
    database: "@packages/prisma via src/lib/prisma.ts"
    logger: pino
    dto: apps/api/src/dto/<route>.dto.ts
    openapi: apps/api/src/openapi/document.ts
  web:
    root: apps/web/src
    framework: TanStack Start
    routes: routes
    api_client: core-api
    queries: hooks/query
    provider: query-provider.tsx
  builds:
    api: esbuild_without_bundling
    web: vite
  api_openapi:
    endpoint: /openapi.json
    source_of_truth: zod_validators_and_route_dtos
    requirement: update_dto_and_openapi_for_every_endpoint_change

skills:
  - .agents/skills/api-controller/SKILL.md
  - .agents/skills/api-route/SKILL.md
  - .agents/skills/api-middleware/SKILL.md
  - .agents/skills/web-query/SKILL.md