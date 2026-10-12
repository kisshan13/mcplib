# `@packages/slack-mcp`

Slack MCP provides tools to search messages, read a message thread, and send a message using Slack's Web API and the connected user's OAuth token.

## Configuration

Set these API environment variables:

- `SLACK_OAUTH_CLIENT_ID`
- `SLACK_OAUTH_CLIENT_SECRET`
- `SLACK_OAUTH_REDIRECT_URI`

Register the redirect URI in the Slack app's OAuth settings. It should point to:

```text
<API_BASE_URL>/api/v1/mcps/slack-mcp/oauth/callback
```

The Slack app needs these user token scopes:

- `search:read.public`, `search:read.private`, `search:read.mpim`, `search:read.im`
- `channels:history`, `groups:history`, `im:history`, `mpim:history`
- `chat:write`, `pins:write`

Users connect Slack through the MCP settings page. Their user token is stored by the repository's OAuth credential provider and is used for their tool requests.

## Tools

| Tool                 | Description                                                              | Inputs                                                  |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `search-messages`    | Searches Slack messages and includes surrounding context and permalinks. | `query`; optional result `limit` and `channelTypes`.    |
| `get-thread-replies` | Retrieves a message thread.                                              | `channelId`, `threadTs`; optional `limit` and `cursor`. |
| `send-message`       | Posts text to a Slack channel or conversation as the connected user.     | `channelId`, `text`.                                    |
| `pin-message`        | Pins an existing message in a channel.                                   | `channelId`, `messageTs`.                               |

## Development

From the repository root:

```bash
pnpm --filter @packages/slack-mcp typecheck
pnpm --filter @packages/slack-mcp build
```
