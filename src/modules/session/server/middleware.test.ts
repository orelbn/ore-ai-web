import { beforeEach, describe, expect, test, vi } from "vitest";
import { applySessionAccessMiddleware } from "./middleware";

const state = vi.hoisted(() => ({
	sessionResponse: null as Response | null,
	requireCalls: 0,
	env: {
		HUMAN_VERIFICATION_SECRET: "session-secret",
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

beforeEach(() => {
	state.sessionResponse = null;
	state.requireCalls = 0;
	state.env.HUMAN_VERIFICATION_SECRET = "session-secret";
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
	});

	test("should return the session access response for protected chat requests", async () => {
		state.sessionResponse = Response.json(
			{ error: "Session access required." },
			{ status: 401 },
		);

		const response = await applySessionAccessMiddleware({
			request: new Request("http://localhost/api/chat"),
			router: {} as never,
			responseHeaders: new Headers({ "x-test-header": "1" }),
		});

		expect(response?.status).toBe(401);
		expect(response?.headers.get("x-test-header")).toBe("1");
		expect(state.requireCalls).toBe(1);
	});
});
