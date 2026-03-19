import { betterAuth } from "better-auth";
import { buildOreAuthOptions, type BetterAuthEnv } from "./config";

type BetterAuthRuntimeEnv = Partial<BetterAuthEnv>;

export type AuthSession = {
	session: {
		id: string;
		userId: string;
	};
	user: {
		id: string;
		isAnonymous?: boolean;
	};
};

function requireBetterAuthEnv(env: BetterAuthRuntimeEnv): BetterAuthEnv {
	const database = env.AUTH_DB;
	const secret = env.BETTER_AUTH_SECRET?.trim();
	const baseURL = env.BETTER_AUTH_URL?.trim();

	if (!database || !secret || !baseURL) {
		throw new Error("Missing Better Auth configuration.");
	}

	return {
		AUTH_DB: database,
		BETTER_AUTH_SECRET: secret,
		BETTER_AUTH_URL: baseURL,
	};
}

function createOreAuth(env: BetterAuthRuntimeEnv) {
	return betterAuth(buildOreAuthOptions(requireBetterAuthEnv(env)));
}

export function isBetterAuthConfigured<T extends BetterAuthRuntimeEnv>(
	env: T,
): env is T & BetterAuthEnv {
	return Boolean(
		env.AUTH_DB &&
			env.BETTER_AUTH_SECRET?.trim() &&
			env.BETTER_AUTH_URL?.trim(),
	);
}

export async function getRequestAuthSession(input: {
	request: Request;
	env: BetterAuthRuntimeEnv;
}): Promise<AuthSession | null> {
	if (!isBetterAuthConfigured(input.env)) {
		return null;
	}

	return (await createOreAuth(input.env).api.getSession({
		headers: input.request.headers,
	})) as AuthSession | null;
}

export async function createAnonymousSessionResponse(input: {
	request: Request;
	env: BetterAuthRuntimeEnv;
}): Promise<Response> {
	const auth = createOreAuth(input.env);
	const headers = new Headers(input.request.headers);
	headers.delete("content-length");
	headers.set("content-type", "application/json");

	return auth.handler(
		new Request(new URL("/api/auth/sign-in/anonymous", input.request.url), {
			method: "POST",
			headers,
			body: "{}",
		}),
	);
}

export async function handleAuthRequest(input: {
	request: Request;
	env: BetterAuthRuntimeEnv;
}): Promise<Response> {
	return createOreAuth(input.env).handler(input.request);
}
