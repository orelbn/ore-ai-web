import { env } from "cloudflare:workers";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { BetterAuthOptions } from "better-auth";
import { anonymous } from "better-auth/plugins/anonymous";
import { captcha } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDatabase } from "@/services/database";
import * as schema from "./schema";

export function buildOreAuthOptions(): BetterAuthOptions {
	const secret = readRequiredAuthEnv(
		"BETTER_AUTH_SECRET",
		env.BETTER_AUTH_SECRET,
	);
	const baseURL = readRequiredAuthEnv("BETTER_AUTH_URL", env.BETTER_AUTH_URL);
	const turnstileSecretKey = readRequiredAuthEnv(
		"TURNSTILE_SECRET_KEY",
		env.TURNSTILE_SECRET_KEY,
	);
	const database = getDatabase();

	return {
		baseURL,
		secret,
		database: drizzleAdapter(database, {
			provider: "sqlite",
			schema,
			usePlural: true,
		}),
		advanced: {
			cookiePrefix: "ore_ai",
			ipAddress: {
				ipAddressHeaders: ["cf-connecting-ip"],
			},
		},
		plugins: [
			anonymous(),
			captcha({
				provider: "cloudflare-turnstile",
				secretKey: turnstileSecretKey,
				endpoints: ["/sign-in/anonymous"],
			}),
			tanstackStartCookies(),
		],
		rateLimit: {
			enabled: true,
			storage: "database",
		},
	};
}

function readRequiredAuthEnv(name: string, value: string | undefined) {
	const trimmedValue = value?.trim();
	if (!trimmedValue) {
		throw new Error(`Missing required auth config: ${name}.`);
	}

	return trimmedValue;
}
