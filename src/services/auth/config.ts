import type { BetterAuthOptions } from "better-auth";
import { anonymous } from "better-auth/plugins";
import { SESSION_ACCESS_COOKIE_NAME } from "@/modules/session/constants";

export const ORE_AUTH_COOKIE_NAMES = {
	sessionToken: SESSION_ACCESS_COOKIE_NAME,
	sessionData: "ore_ai_session_data",
	dontRemember: "ore_ai_dont_remember",
} as const;

export type BetterAuthEnv = {
	AUTH_DB: D1Database;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
};

export function buildOreAuthOptions(env: BetterAuthEnv): BetterAuthOptions {
	return {
		baseURL: env.BETTER_AUTH_URL.trim(),
		secret: env.BETTER_AUTH_SECRET.trim(),
		database: env.AUTH_DB,
		user: {
			modelName: "users",
		},
		session: {
			modelName: "sessions",
		},
		account: {
			modelName: "accounts",
		},
		verification: {
			modelName: "verifications",
		},
		advanced: {
			cookies: {
				session_token: {
					name: ORE_AUTH_COOKIE_NAMES.sessionToken,
				},
				session_data: {
					name: ORE_AUTH_COOKIE_NAMES.sessionData,
				},
				dont_remember: {
					name: ORE_AUTH_COOKIE_NAMES.dontRemember,
				},
			},
		},
		plugins: [anonymous()],
	};
}
