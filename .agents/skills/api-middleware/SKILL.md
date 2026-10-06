---
name: api-middleware
description: Create or update reusable Express middleware for apps/api.
---
skill:
  location: apps/api/src/middlewares
  rules:
    - export a default RequestHandler or middleware factory
    - call next() after successful processing
    - call next(error) for failures
    - use auth.middleware.ts for Better Auth session checks
    - use error.middleware.ts for final error responses
    - keep response formatting in ApiResponse or error middleware
