---
name: api-route
description: Create an apps/api route using the required four-file structure and OpenAPI DTO.
---
skill:
  location: apps/api/src/routes/<name>
  files:
    index.ts: export the router
    controller.ts: define controller<Name> handlers
    validator.ts: define zod validators
    factory.ts: create and register the Express Router
    dto.ts: define the OpenAPI request and response schemas
  rules:
    - keep route wiring in factory.ts
    - keep validation in validator.ts
    - keep business work in controller.ts
    - import the router from routes/index.ts
    - register every endpoint in apps/api/src/dto/<name>.dto.ts
    - use the route validator as the DTO request schema
    - define the response envelope in the DTO
    - update the DTO and OpenAPI document for every endpoint change