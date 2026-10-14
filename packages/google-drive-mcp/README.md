# Google Drive MCP

`@packages/google-drive-mcp` exposes Google Drive v3, Drive Activity v2, and Drive Labels v2 through the repository's `McpToolkit` registration boundary. It resolves a bearer token through the request-scoped `SecretProvider`; it never reads credentials from environment variables or logs tokens.

## Workspace and configuration

The package is registered by `apps/api` as `google-drive-mcp`. Platform OAuth requires:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- a Google OAuth consent screen configured for the requested scopes

The registered OAuth scopes are `drive`, `drive.activity`, and `drive.labels`. The platform stores access and refresh credentials; the MCP package receives only the authorized bearer token for the current user/profile/organization context. Reconnection or token refresh is therefore handled by the existing OAuth/secret-provider layer.

## Tools

Tool names are grouped by resource: `drive-list/search/get/create/update/move/copy/trash/restore/delete/upload/download`, permissions and capabilities, shared drives, comments and replies, revisions, changes, Drive Activity, and labels. Tool metadata and JSON schemas are available through the MCP registry. Every paginated operation returns Google's continuation token in its result. Page tokens are opaque and must be passed back unchanged.

Uploads and downloads use base64 content with an 8 MiB package limit because the current MCP transport has no binary artifact channel. No arbitrary local paths or public download URLs are accepted. Google Workspace files must use `drive-download-file.exportMimeType`; binary files use Drive media download.

Destructive and externally visible actions require explicit confirmations in their input schemas: permanent file/shared-drive deletion, comment/reply/revision deletion, access removal, ownership transfer, and domain/public sharing. Google Drive remains the final authorization authority, including shared-drive and label restrictions.

Drive Activity supports the API's `time` and `detail.action_detail_case` filters only. It is not presented as a complete audit log. Change tracking is polling-only; no webhook infrastructure is created. Label definitions and field types are read from Drive Labels v2 before applied-label modifications are sent through Drive v3 `files.modifyLabels`.

## Development

From the repository root:

```sh
pnpm --filter @packages/google-drive-mcp typecheck
pnpm --filter @packages/google-drive-mcp build
pnpm --filter @packages/google-drive-mcp test
```

The standard unit suite does not require live Google credentials. Integration testing should use a dedicated test account and isolated files; never grant public access or modify production files.
