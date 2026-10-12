import type { RequestHandler } from "express";
import { z } from "zod";
import exampleMcp from "@packages/example-mcp";
import firecrawlMcp from "@packages/firecrawl-mcp";
import githubMcp from "@packages/github-mcp";
import { env } from "../config/env.js";
import { databaseSecretProvider } from "../lib/secret-provider.js";
import {
  McpRegistry,
  createMcpRequestHandler,
  type McpConfigurationProvider
} from "../lib/registry.js";

type GithubPlatformConfiguration = {
  oauth: {
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
  };
};

export const mcpRegistry = new McpRegistry();
mcpRegistry.register(exampleMcp);
mcpRegistry.register(firecrawlMcp);
const githubPlatformConfigProvider: McpConfigurationProvider<
  GithubPlatformConfiguration
> = async () => {
  if (
    !env.GITHUB_OAUTH_CLIENT_ID ||
    !env.GITHUB_OAUTH_CLIENT_SECRET ||
    !env.GITHUB_OAUTH_REDIRECT_URI
  ) {
    return null;
  }

  return {
    oauth: {
      clientId: env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: env.GITHUB_OAUTH_CLIENT_SECRET,
      redirectUri: env.GITHUB_OAUTH_REDIRECT_URI
    }
  };
};

mcpRegistry.register(githubMcp, {
  platformConfigProvider: githubPlatformConfigProvider
});

const platformMcpParams = z.object({
  mcpId: z.string().trim().min(1)
});

const organizationMcpParams = z.object({
  organizationId: z.string().trim().min(1),
  mcpId: z.string().trim().min(1)
});

export const platformMcpHandler: RequestHandler = createMcpRequestHandler(
  mcpRegistry,
  (request) => ({
    secretProvider: databaseSecretProvider,
    userId: request.apiKey?.userId ?? request.user?.id
  }),
  (request) => platformMcpParams.parse(request.params).mcpId
);

export const organizationMcpHandler: RequestHandler = createMcpRequestHandler(
  mcpRegistry,
  (request) => ({
    secretProvider: databaseSecretProvider,
    userId: request.apiKey?.userId ?? request.user?.id,
    organizationId:
      request.apiKey?.organizationId ?? organizationMcpParams.parse(request.params).organizationId
  }),
  (request) => organizationMcpParams.parse(request.params).mcpId
);

export const exampleMcpHandler: RequestHandler = createMcpRequestHandler(
  mcpRegistry,
  (request) => ({
    secretProvider: databaseSecretProvider,
    userId: request.user?.id
  }),
  () => exampleMcp.metadata.id
);
