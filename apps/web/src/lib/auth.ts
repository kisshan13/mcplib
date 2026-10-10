import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/config/constants";

export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`
});
