export interface Secret {
  type: "header";
  secretType: "bearer" | "basic";

  name?: string;
  value?: string;
  username?: string;
  password?: string;
}

export interface SecretProvider {
  getSecret: (provider: string, identifier: string) => Promise<Secret>;
}
