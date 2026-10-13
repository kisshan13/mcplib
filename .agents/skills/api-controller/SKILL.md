---
name: api-controller
description: Create or update an Express controller in apps/api using the project response, handler, factory, middleware, and OpenAPI conventions.
---

skill:
scope: apps/api/src/routes/*/controller.ts
rules: - export a named function or constant beginning with controller - wrap the controller with requestHandler - keep the controller responsible for HTTP request and response handling only - validate request input with the route validator before using it - delegate database operations and core business logic to the route factory - use shared middleware for authentication, authorization, validation, and other request-processing concerns - move reusable non-HTTP helper functions into dedicated utility files - do not access Prisma or implement core business rules directly in the controller - validate response data with the route DTO - return ApiResponse for successful responses - update the route DTO and OpenAPI registration when request or response behavior changes - preserve existing status codes, response structures, and error-handling behavior - pass failures to the request handler or throw them
naming:
get: controllerGet<Name>
create: controllerCreate<Name>
update: controllerUpdate<Name>
delete: controllerDelete<Name>
