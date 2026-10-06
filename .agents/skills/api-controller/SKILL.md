---
name: api-controller
description: Create or update an Express controller in apps/api using the project response, handler, and OpenAPI conventions.
---
skill:
  scope: apps/api/src/routes/*/controller.ts
  rules:
    - export a named function or constant beginning with controller
    - wrap the controller with requestHandler
    - validate request input with the route validator before using it
    - use lib/prisma.ts for database access
    - validate response data with the route DTO
    - return ApiResponse for successful responses
    - update the route DTO and OpenAPI registration when request or response behavior changes
    - pass failures to the request handler or throw them
  naming:
    get: controllerGet<Name>
    create: controllerCreate<Name>
    update: controllerUpdate<Name>
    delete: controllerDelete<Name>