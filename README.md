# Express TanStack Monorepo

A pnpm monorepo for reusable packages, an Express API service, and a TanStack Start web application.

## Requirements

- Node.js 20.19 or newer
- pnpm 10 or newer
- PostgreSQL for Prisma and Better Auth

## Repository layout

```text
.
├── apps/
│   ├── api/              Express API service
│   ├── example/          Workspace example app
│   └── web/              TanStack Start frontend
├── packages/
│   ├── config/            Shared TypeScript and esbuild configuration
│   ├── example/           Example workspace package
│   └── prisma/            Prisma 7 PostgreSQL package
├── scripts/
│   └── build-standalone.mjs
├── .agents/skills/        Project-specific agent skills
├── AGENTS.md              Repository conventions for agents
├── pnpm-workspace.yaml
└── package.json
```

The workspace includes `apps/*` and `packages/*` through [pnpm-workspace.yaml](pnpm-workspace.yaml).

## Install

```bash
pnpm install
```

Run all checks from the repository root:

```bash
pnpm run typecheck
pnpm run build
```

## Development

### API

Copy the environment template:

```bash
cp apps/api/.env.example apps/api/.env
```

Set `DATABASE_URL` to a PostgreSQL connection string, then start the API:

```bash
pnpm --filter @apps/api dev
```

The API runs on `http://localhost:3000` by default.

Available starter endpoints:

```text
GET /health
GET /api/v1/example
GET /api/v1/example?name=web
```

The API uses:

- Express
- Better Auth
- `@packages/prisma`
- Pino and `pino-http`
- Helmet and CORS
- Zod validation

### Web

Copy the frontend environment template:

```bash
cp apps/web/.env.example apps/web/.env
```

Start the TanStack Start app:

```bash
pnpm --filter @apps/web dev
```

The web app runs on `http://localhost:3001` and uses `VITE_API_URL` to locate the API. Start the API as well to see the example query succeed.

Other web commands:

```bash
pnpm --filter @apps/web build
pnpm --filter @apps/web preview
pnpm --filter @apps/web typecheck
```

Routes use TanStack Start file-based routing:

```text
apps/web/src/routes/
├── __root.tsx
├── index.tsx
└── example.tsx
```

API clients belong in `apps/web/src/core-api`, and React Query hooks belong in `apps/web/src/hooks/query`.

## Prisma

`@packages/prisma` uses Prisma 7 with the PostgreSQL driver adapter.

The schema is located at:

```text
packages/prisma/prisma/schema.prisma
```

The generated client is written to `src/generated/prisma` and re-exported from `src/index.ts`. Generated files are ignored by git.

To configure Prisma locally:

```bash
cp packages/prisma/.env.example packages/prisma/.env
pnpm --filter @packages/prisma generate
```

Useful Prisma commands:

```bash
pnpm --filter @packages/prisma generate
pnpm --filter @packages/prisma typecheck
pnpm --filter @packages/prisma build
```

Create and apply migrations only when a PostgreSQL database is available:

```bash
pnpm --filter @packages/prisma exec prisma migrate dev --name <migration-name>
```

## Build behavior

The API and Node-oriented packages use the shared esbuild configuration in `packages/config`.

- TypeScript files are emitted into `build/`.
- `bundle` is disabled.
- Source files remain separate in the output.
- Prisma generated files are emitted under `build/generated/prisma`.

The web app uses Vite through the TanStack Start plugin. Its production output is under `apps/web/dist`.

## Standalone deployment

Build the current standalone example service from the repository root:

```bash
pnpm run build:standalone
```

This builds the workspace and creates a portable artifact at:

```text
standalone/example/
├── build/
├── node_modules/
└── package.json
```

The generated `standalone/` directory is ignored by git. It can be used as a Docker build context:

```bash
docker build -f Dockerfile.example -t example-service .
docker run example-service
```

## API route convention

Every API route should use this structure:

```text
apps/api/src/routes/<route-name>/
├── index.ts
├── controller.ts
├── validator.ts
└── factory.ts
```

- `factory.ts` creates and registers the Express router.
- `validator.ts` contains Zod schemas.
- `controller.ts` contains request handling and uses `requestHandler`.
- `index.ts` exports the route router.

Controller names begin with `controller`, such as `controllerGetExample` or `controllerCreateUser`.

## Project skills

Project-specific agent skills are stored in `.agents/skills`:

- `api-controller`: controller naming and response conventions
- `api-route`: four-file API route scaffolding
- `api-middleware`: Express middleware conventions
- `web-query`: frontend API client and React Query hook conventions

Repository-wide conventions are in [AGENTS.md](AGENTS.md).

## Common commands

```bash
# Install dependencies
pnpm install

# Check every workspace project
pnpm run typecheck

# Build every workspace project
pnpm run build

# Run one project command
pnpm --filter @apps/api dev
pnpm --filter @apps/web dev
pnpm --filter @packages/prisma generate
```
