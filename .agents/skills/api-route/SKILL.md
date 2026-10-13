---
name: api-route
description: Create an apps/api route using the project route, controller, factory, middleware, validator, and OpenAPI conventions.
---

skill:
location: apps/api/src/routes/<name>
files:
index.ts: create, register, and export the router
controller.ts: define controller<Name> handlers
validator.ts: define zod validators
factory.ts: contain route-specific database operations and core application logic; it must not register routes
apps/api/src/dto/<name>.dto.ts: define the OpenAPI request and response schemas
rules: - register every endpoint directly in index.ts - export the route registry directly from index.ts - import controllers and required middleware explicitly in index.ts - keep route registration separate from business logic - never use factory.ts as a route registry - keep validation in validator.ts - keep HTTP handling in controller.ts and delegate business work to factory.ts - use middleware for shared HTTP request-processing concerns - import the router from routes/index.ts - register every endpoint's request and response schemas in apps/api/src/dto/<name>.dto.ts - use the route validator as the DTO request schema - define the response envelope in the DTO - update the DTO and OpenAPI document for every endpoint change
