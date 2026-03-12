import { beforeEach, describe, expect, test, vi } from "vitest";
import { applySessionAccessMiddleware } from "./middleware";

const state = vi.hoisted(() => ({
	sessionResponse: null as Response | null,
	requireCalls: 0,
	rateLimitResponse: null as Response | null,
	rateLimitCalls: 0,
	env: {
		SESSION_ACCESS_SECRET: "session-secret",
	},
}));

vi.mock("cloudflare:workers", () => ({
	env: state.env,
}));

vi.mock("./verification", () => ({
	requireSessionAccess: async () => {
		state.requireCalls += 1;
		return state.sessionResponse;
	},
}));

vi.mock("@/lib/security/rate-limit", () => ({
	applyAnonymousRateLimit: async () => {
		state.rateLimitCalls += 1;
		return state.rateLimitResponse;
	},
}));

beforeEach(() => {
	state.sessionResponse = null;
	state.requireCalls = 0;
	state.rateLimitResponse = null;
	state.rateLimitCalls = 0;
	state.env.SESSION_ACCESS_SECRET = "session-secret";
});

describe("session access middleware", () => {
	test("should skip non-chat routes", async () => {
		const response = await applySessionAccessMiddleware({
			request: new Request("http://localhost/privacy"),
			router: {} as never,
			responseHeaders: new Headers(),
		});

		expect(response).toBeNull();
		expect(state.requireCalls).toBe(0);
		expect(state.rateLimitCalls).toBe(0);
	});

	test("should return the session access response for protected chat requests", async () => {
		state.sessionResponse = Response.json(
			{ error: "Session access required." },
			{ status: 401 },
		);

		const response = await applySessionAccessMiddleware({
			request: new Request("http://localhost/api/chat", {
				method: "POST",
			}),
			router: {} as never,
			responseHeaders: new Headers({ "x-test-header": "1" }),
		});

		expect(response?.status).toBe(401);
		expect(response?.headers.get("x-test-header")).toBe("1");
		expect(state.requireCalls).toBe(1);
		expect(state.rateLimitCalls).toBe(0);
	});

	test("should return the rate-limit response after session access passes", async () => {
		state.rateLimitResponse = Response.json(
			{
				error: "Too many requests. Please try again later.",
				retryAfterSeconds: 60,
			},
			{
				status: 429,
				headers: {
					"Retry-After": "60",
				},
			},
		);

		const response = await applySessionAccessMiddleware({
			request: new Request("http://localhost/api/chat", {
				method: "POST",
			}),
			router: {} as never,
			responseHeaders: new Headers({ "x-test-header": "1" }),
		});

		expect(response?.status).toBe(429);
		expect(response?.headers.get("x-test-header")).toBe("1");
		expect(response?.headers.get("Retry-After")).toBe("60");
		expect(state.requireCalls).toBe(1);
		expect(state.rateLimitCalls).toBe(1);
	});
});
