# MCPLib

MCPLib is open-source infrastructure for discovering, configuring, and accessing Model Context Protocol (MCP) servers.

It gives MCP users a simpler way to find tools and manage service connections, while giving developers reusable building blocks for agentic applications:

- MCP discovery through a central registry.
- Typed MCP metadata and tool descriptions.
- Platform and organization configuration scopes.
- A controlled `SecretProvider` boundary for third-party credentials.
- Express API routes for registry, configuration, organizations, and MCP access.
- A TanStack Start web workspace for browsing MCPs and managing account settings.
- Reusable MCP implementations built with shared TypeScript packages.

MCPLib keeps MCP protocol handling, platform authentication, provider credentials, and organization authorization as separate concerns.

> Project status: MCPLib is an evolving foundation. The registry, configuration model, web catalog, and core MCP packages are implemented, while some production OAuth lifecycle and organization-management workflows are still being developed.

## Why MCPLib?

Connecting an MCP server often requires finding a repository, installing dependencies, configuring environment variables, authorizing an external service, and repeating the same work for every integration.

MCPLib provides a shared platform layer for those concerns:

1. Discover registered MCP implementations and inspect their public metadata.
2. Determine what a selected MCP needs from a service provider.
3. Configure platform- or organization-scoped settings when required.
4. Keep runtime credentials behind `SecretProvider`.
5. Expose MCP tools through the platform API or integrate the shared packages into another application.

The platform's API authentication is separate from the authentication an MCP uses to call an external service. A user authenticates with MCPLib to access the platform; the MCP then requests only the service credential it is authorized to use.

## Current capabilities

### MCP registry

The API maintains a central in-memory registry of available MCP implementations. Each entry can expose safe public metadata, supported capabilities, authentication/configuration requirements, and tool descriptors.

The current registry includes:

- `example-mcp` — a small reference MCP with example tools.
- `github-mcp` — a GitHub-oriented MCP that declares OAuth configuration requirements.

Registry metadata never includes access tokens, refresh tokens, client secrets, or other runtime secret values.

### Typed MCP toolkit

`@packages/mcp-core` wraps the official MCP TypeScript SDK and provides:

- MCP metadata through `McpToolkit`.
- Zod input and output schemas for tools.
- Type inference for tool implementations.
- Public tool descriptors for catalog responses.
- An Express-compatible Streamable HTTP handler.
- Per-request runtime context and `SecretProvider` access.

### Secret-provider boundary

`@packages/mcplib-core` defines the shared credential abstractions used between the platform and MCP implementations.

An MCP does not read Prisma records or platform credential storage directly. It requests a credential through `SecretProvider`, which receives the MCP integration, secret identifier, user or organization context, and access purpose. The platform decides whether that request is allowed and what data can be returned.

MCPs declare their credential requirements with `SecretProviderConfiguration`. The configuration supports:

- `direct` credentials, where the MCP can use a supplied secret without a stored configuration profile.
- `configuration` credentials, where the platform or an organization must provide a configuration profile.

The declaration contains metadata only. It can include a Zod object schema converted to JSON Schema and optional OAuth metadata, but never the actual secret value.

### Configuration storage

The Prisma schema contains a dedicated `McpConfiguration` model for stored MCP configuration values.

Configurations are isolated by:

- MCP identifier.
- Scope: `platform` or `organization`.
- Scope key, with a database uniqueness constraint.

The API validates stored values against the MCP's declared configuration requirements and sanitizes secret fields before returning configuration responses.

### Web workspace

`@apps/web` provides the authenticated workspace, including:

- A workspace overview at `/app`.
- A data-driven MCP catalog at `/app/mcps`.
- MCP metadata, tools, configuration, and connection-status views.
- Account and MCP integration settings at `/app/settings`.
- Responsive, reusable UI components built with React and Tailwind CSS.

## Architecture

```text
                         ┌──────────────────────┐
                         │      Web client      │
                         │  TanStack Start UI   │
                         └──────────┬───────────┘
                                    │ core-api
                                    ▼
                         ┌──────────────────────┐
                         │       API app        │
                         │ Express + Better Auth│
                         └───────┬──────┬───────┘
                                 │      │
                      registry   │      │ Prisma
                                 │      ▼
                                 │  ┌──────────────┐
                                 │  │  PostgreSQL   │
                                 │  │ configs/users │
                                 │  └──────────────┘
                                 ▼
                         ┌──────────────────────┐
                         │   MCP implementations │
                         │ example-mcp, github  │
                         └──────────┬───────────┘
                                    │ SecretProvider
                                    ▼
                         ┌──────────────────────┐
                         │ External credentials │
                         │ OAuth, API keys, etc. │
                         └──────────────────────┘
```

The main package boundaries are:

| Area                   | Responsibility                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/api`             | HTTP API, Better Auth integration, authorization, registry integration, configuration access, and MCP routes |
| `apps/web`             | Authenticated workspace, MCP catalog, settings, API client, and React Query hooks                            |
| `packages/mcp-core`    | MCP toolkit, tool registration, metadata, request handling, and runtime integration                          |
| `packages/mcplib-core` | Shared `SecretProvider` and secret configuration abstractions                                                |
| `packages/prisma`      | Prisma schema, generated client, organizations, OAuth applications, tokens, and MCP configuration storage    |
| `packages/example-mcp` | Reference MCP implementation                                                                                 |
| `packages/github-mcp`  | GitHub MCP implementation                                                                                    |
| `packages/config`      | Shared TypeScript and esbuild configuration                                                                  |

For the detailed repository layout and the original workspace setup reference, see [project-structure.md](project-structure.md).

## Repository layout

```text
.
├── apps/
│   ├── api/                  Express API service
│   ├── example/              Standalone example service
│   └── web/                  TanStack Start frontend
├── packages/
│   ├── config/               Shared build and TypeScript configuration
│   ├── example/              Example workspace package
│   ├── example-mcp/          Reference MCP implementation
│   ├── github-mcp/           GitHub MCP implementation
│   ├── mcp-core/             MCP toolkit and runtime helpers
│   ├── mcplib-core/          Shared MCP abstractions
│   └── prisma/               Prisma schema and generated client
├── scripts/                  Build and packaging scripts
├── frontend-content.md       Landing-page content source
├── product.md                Product requirements
├── project-structure.md      Previous repository setup and conventions
├── AGENTS.md                 Repository development instructions
├── pnpm-workspace.yaml       pnpm workspace definition
└── package.json              Root scripts and development tooling
```

## Getting started

### Requirements

- Node.js 20.19 or newer.
- pnpm 10 or newer.
- PostgreSQL for Prisma and Better Auth.

### Install dependencies

```bash
pnpm install
```

### Configure the API

Copy the API environment template:

```bash
cp apps/api/.env.example apps/api/.env
```

Set `DATABASE_URL` to a PostgreSQL connection string. The template also contains:

- `PORT` — API port, default `3000`.
- `CORS_ORIGINS` — allowed web origins.
- `WEB_APP_URL` — frontend URL used after an OAuth callback.
- `MCPLIB_SECRET_ENCRYPTION_KEY` — a secret used to encrypt stored service tokens and OAuth state.
- `GITHUB_OAUTH_CLIENT_ID` — optional platform GitHub OAuth client ID.
- `GITHUB_OAUTH_CLIENT_SECRET` — optional platform GitHub OAuth client secret.
- `GITHUB_OAUTH_REDIRECT_URI` — configured redirect URI for the GitHub integration.

Do not commit real client secrets, access tokens, or refresh tokens.

Set `MCPLIB_SECRET_ENCRYPTION_KEY` to a stable secret before using MCP OAuth. For local
development, a 32-byte hexadecimal value can be generated with `openssl rand -hex 32`.

For the platform GitHub MCP connection, register this callback URL in the GitHub OAuth
application:

```text
http://localhost:3000/api/v1/mcps/github-mcp/oauth/callback
```

The current GitHub MCP requests the `read:user` and `user:email` scopes. The OAuth client
credentials are kept on the API server and are never sent to the web application.

### Configure the web app

Copy the web environment template:

```bash
cp apps/web/.env.example apps/web/.env
```

Set `VITE_API_URL` to the API URL. The default local value is:

```text
VITE_API_URL=http://localhost:3000
```

### Prepare Prisma

Copy the Prisma environment template when using Prisma commands directly:

```bash
cp packages/prisma/.env.example packages/prisma/.env
pnpm --filter @packages/prisma generate
```

When a PostgreSQL database is available, apply development migrations through Prisma:

```bash
pnpm --filter @packages/prisma exec prisma migrate dev --name <migration-name>
```

### Run locally

Start the API:

```bash
pnpm --filter @apps/api dev
```

The API runs at [http://localhost:3000](http://localhost:3000).

In another terminal, start the web application:

```bash
pnpm --filter @apps/web dev
```

The web app runs at [http://localhost:3001](http://localhost:3001).

## API surface

The API is an Express application mounted from `apps/api/src/index.ts`. OpenAPI is available at:

```text
GET /openapi.json
```

### Platform endpoints

| Method   | Endpoint                                                                        | Purpose                                                                        |
| -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `GET`    | `/health`                                                                       | Health check                                                                   |
| `GET`    | `/api/v1/mcps`                                                                  | List public MCP metadata                                                       |
| `GET`    | `/api/v1/mcps/:id`                                                              | Retrieve one registered MCP                                                    |
| `GET`    | `/api/v1/mcps/:id/tools`                                                        | List public tool descriptors for an MCP                                        |
| `GET`    | `/api/v1/mcps/configuration/status`                                             | List platform MCP connection/configuration statuses for the authenticated user |
| `GET`    | `/api/v1/mcps/:id/configuration?context=platform`                               | Retrieve platform-scoped MCP configuration                                     |
| `GET`    | `/api/v1/mcps/:id/configuration?context=organization&organizationId=<id>`       | Retrieve organization-scoped MCP configuration                                 |
| `PUT`    | `/api/v1/mcps/:id/configuration`                                                | Create or update scoped MCP configuration                                      |
| `GET`    | `/api/v1/organizations`                                                         | List organizations accessible to the authenticated user                        |
| `POST`   | `/api/v1/organizations`                                                         | Create an organization                                                         |
| `GET`    | `/api/v1/organizations/:id`                                                     | Retrieve an organization                                                       |
| `PATCH`  | `/api/v1/organizations/:id`                                                     | Update an organization                                                         |
| `GET`    | `/api/v1/organizations/:id/members`                                             | List organization member profiles                                              |
| `POST`   | `/api/v1/organizations/:id/members`                                             | Add an existing platform user to an organization                               |
| `PATCH`  | `/api/v1/organizations/:id/members/:memberId`                                   | Update a member role                                                           |
| `DELETE` | `/api/v1/organizations/:id/members/:memberId`                                   | Remove a member                                                                |
| `GET`    | `/api/v1/organizations/:organizationId/members/:userId/service-tokens`          | List a member's organization service tokens                                    |
| `POST`   | `/api/v1/organizations/:organizationId/members/:userId/service-tokens`          | Register or replace a member service token                                     |
| `DELETE` | `/api/v1/organizations/:organizationId/members/:userId/service-tokens/:tokenId` | Revoke a member service token                                                  |
| `ALL`    | `/api/v1/platform/mcp/:mcpId`                                                   | Platform MCP transport endpoint                                                |
| `ALL`    | `/api/v1/mcp/:organizationId/:mcpId`                                            | Organization MCP transport endpoint                                            |
| `ALL`    | `/api/v1/example/mcp`                                                           | Authenticated example MCP transport endpoint                                   |

API keys are managed through the authenticated `/api/v1/api-keys` endpoints. A key has either a
`platform` or `organization` scope and must be explicitly granted access to each MCP server. The
complete secret is returned only by `POST /api/v1/api-keys`; copy it immediately because only its
verifier and safe prefix are stored. Use it as `Authorization: Bearer mcpl_<prefix>_<secret>` or
`X-API-Key: mcpl_<prefix>_<secret>`. Platform transport requests use platform keys; organization
transport requests use organization keys whose organization ID matches the URL. Revoked and expired
keys fail authentication.

The key management endpoints are:

```text
POST   /api/v1/api-keys
GET    /api/v1/api-keys
GET    /api/v1/api-keys/:keyId
POST   /api/v1/api-keys/:keyId/revoke
GET    /api/v1/api-keys/:keyId/mcp-access
POST   /api/v1/api-keys/:keyId/mcp-access
DELETE /api/v1/api-keys/:keyId/mcp-access/:mcpId
```

MCP configuration endpoints use a typed context. Platform requests omit an organization ID; organization requests must provide one and are checked against the caller's membership.

Better Auth handles platform account authentication under:

```text
/api/auth/*
```

The exact authentication operations are provided by Better Auth rather than duplicated in the MCP registry.

### Configuration payload

The configuration update endpoint accepts a body shaped like:

```json
{
  "context": {
    "type": "platform"
  },
  "values": {
    "clientId": "public-client-id"
  }
}
```

For an organization scope:

```json
{
  "context": {
    "type": "organization",
    "id": "organization-id"
  },
  "values": {
    "clientId": "organization-client-id"
  }
}
```

The server validates values against the registered MCP's declared schema. Secret fields are not returned as plaintext in ordinary responses.

Organization service-token registration accepts a `secretId`, `integrationId`, authentication
method, and either an access token or a secure credential reference. Access and refresh tokens are
encrypted before persistence and are never returned by the service-token endpoints. Only an
organization owner or administrator can manage tokens for a member, and the target user must be an
active member of that organization.

## Building an MCP

An MCP package creates an `McpToolkit`, registers tools, and exports the toolkit registration.

A minimal example:

```ts
import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";

const mcp = new McpToolkit({
  id: "weather-mcp",
  name: "weather-mcp",
  displayName: "Weather MCP",
  version: "v1.0.0",
  description: "Expose weather tools through MCP.",
  serviceProvider: "weather",
  capabilities: ["tools"],
  secretProviderConfiguration: new SecretProviderConfiguration({
    type: "direct",
    secretId: "weather-api-key",
    inputSchema: z.object({
      apiKey: z.string().min(1).meta({ secret: true })
    })
  })
});

mcp.registerTool({
  name: "get-weather",
  description: "Get weather for a location.",
  inputSchema: z.object({
    location: z.string().min(1)
  }),
  outputSchema: z.object({
    temperature: z.number()
  }),
  async execute(input, context) {
    const secret = await context.secretProvider.getSecret({
      integrationId: "weather-mcp",
      secretId: "weather-api-key",
      userId: context.userId,
      organizationId: context.organizationId,
      operation: "use",
      purpose: "Call the weather provider."
    });

    return { temperature: await getTemperature(input.location, secret) };
  }
});

const register: McpToolkitRegister = mcp.asRegister();
export default register;
```

See the complete reference implementations:

- [Example MCP](packages/example-mcp/src/index.ts)
- [GitHub MCP](packages/github-mcp/src/index.ts)
- [MCP core documentation](packages/mcp-core/README.md)

## Authentication and configuration model

MCPLib uses several distinct layers:

1. **Platform authentication** — Better Auth authenticates the user to MCPLib.
2. **MCP access authentication** — platform and organization MCP transport routes have separate middleware boundaries.
3. **MCP service authentication** — an MCP can require OAuth, an API key, bearer token, or another provider credential.
4. **Secret access authorization** — `SecretProvider` decides whether a specific MCP request may use a specific credential.

A service credential request is scoped by information such as:

- MCP integration identifier.
- Secret identifier.
- Platform user.
- Organization.
- Requested operation.
- Access purpose.

This prevents an MCP implementation from receiving unrestricted access to every credential belonging to a user or organization.

### Configuration declaration

The configuration declaration is serializable public metadata:

```ts
new SecretProviderConfiguration({
  type: "configuration",
  secretId: "github-oauth",
  inputSchema: z.object({
    clientId: z.string().min(1),
    clientSecret: z.string().min(1).meta({ secret: true })
  }),
  oauth: {
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: ["read:user", "user:email"]
  }
});
```

The schema describes what the platform needs to collect. It is not a secret store. Actual credentials are kept behind the platform's secret-management implementation and should never be placed in MCP metadata or logs.

## Useful commands

Run commands from the repository root:

```bash
# Format files
pnpm run format

# Check formatting
pnpm run format:check

# Lint the repository
pnpm run lint

# Type-check every workspace package
pnpm run typecheck

# Build every workspace package
pnpm run build

# Run API tests
pnpm --filter @apps/api test

# Generate Prisma client
pnpm --filter @packages/prisma generate

# Type-check or build one package
pnpm --filter @packages/mcp-core typecheck
pnpm --filter @packages/mcp-core build
pnpm --filter @apps/api typecheck
pnpm --filter @apps/api build
pnpm --filter @apps/web typecheck
pnpm --filter @apps/web build
```

API route changes should update their Zod validators, DTOs, and OpenAPI document. Route implementations follow the four-file convention in [AGENTS.md](AGENTS.md).

## Documentation map

- [Product requirements](product.md)
- [Repository structure and setup reference](project-structure.md)
- [MCP core package guide](packages/mcp-core/README.md)
- [Frontend content source](frontend-content.md)
- [Agent and repository conventions](AGENTS.md)

## Contributing

When extending MCPLib:

1. Read [AGENTS.md](AGENTS.md) and the relevant product requirements.
2. Keep package responsibilities separate.
3. Add or update typed validators, DTOs, and OpenAPI metadata for API changes.
4. Keep secrets out of metadata, logs, tests, and responses.
5. Add tests for new behavior and run targeted checks before submitting a change.
6. Use the existing pnpm workspace scripts and avoid unrelated refactors.

MCPLib is intended to be inspectable and composable: MCP implementations should be able to use the shared toolkit without depending directly on the API application's database internals.
