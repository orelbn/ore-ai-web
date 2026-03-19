import { betterAuth } from "better-auth";
import { buildOreAuthOptions } from "./services/auth/config";

export function createAuth(env: Partial<CloudflareEnv> = {}) {
	return betterAuth(buildOreAuthOptions(env));
}

export const auth = createAuth();
