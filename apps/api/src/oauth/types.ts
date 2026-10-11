export interface PlatformMcpOAuthState {
  state: string;
  codeVerifier: string;
  mcpId: string;
  userId: string;
  redirectUri: string;
  createdAt: number;
}

export interface PlatformMcpOAuthConfiguration {
  oauth: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}
