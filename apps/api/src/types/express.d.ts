import type { Session, User } from "@packages/prisma";

export type ApiKeyRequestContext = {
  id: string;
  userId: string | null;
  profileId: string | null;
  ownershipType: "PLATFORM" | "ORGANIZATION";
  organizationId: string | null;
  prefix: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
      apiKey?: ApiKeyRequestContext;
    }
  }
}

export {};
