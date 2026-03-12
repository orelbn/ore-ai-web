import { beforeEach, describe, expect, test, vi } from "vitest";
import { handlePostSessionVerify, requireSessionAccess } from "./verification";
import { SESSION_VERIFY_MAX_BODY_BYTES } from "../constants";

const state = vi.hoisted(() => ({
	hasSessionAccess: false,
	verifiedToken: true,
	setCookieValue: "ore_ai_session=test",
	env: {
		TURNSTILE_SECRET_KEY: "turnstile-secret",
		HUMAN_VERIFICATION_SECRET: "session-secret",
	},
}));

vi.mock("cloudflare:workers", () => ({
	env: state.env,
}));

vi.mock("@/lib/security/human-verification-cookie", () => ({
	hasValidHumanVerificationCookie: async () => state.hasSessionAccess,
	createHumanVerificationCookie: async () => state.setCookieValue,
}));

vi.mock("@/services/cloudflare/turnstile", () => ({
	verifyTurnstileToken: async () => state.verifiedToken,
}));

beforeEach(() => {
	state.hasSessionAccess = false;
	state.verifiedToken = true;
	state.setCookieValue = "ore_ai_session=test";
});

describe("session verification", () => {
	test("should reject protected requests when session access is missing", async () => {
		const response = await requireSessionAccess({
			request: new Request("http://localhost/api/chat"),
			sessionSecret: "session-secret",
		});

		expect(response?.status).toBe(401);
		await expect(response?.json()).resolves.toEqual({
			error: "Session access required.",
		});
	});

	test("should allow protected requests when session access is present", async () => {
		state.hasSessionAccess = true;

		const response = await requireSessionAccess({
			request: new Request("http://localhost/api/chat"),
			sessionSecret: "session-secret",
		});

		expect(response).toBeNull();
	});

	test("should set the session cookie after successful verification", async () => {
		const response = await handlePostSessionVerify(
			new Request("http://localhost/api/session/verify", {
				method: "POST",
				body: JSON.stringify({ token: "token" }),
			}),
		);

		expect(response.status).toBe(204);
		expect(response.headers.get("Set-Cookie")).toBe("ore_ai_session=test");
	});

	test("should reject malformed verification payloads", async () => {
		const response = await handlePostSessionVerify(
			new Request("http://localhost/api/session/verify", {
				method: "POST",
				body: JSON.stringify({ token: 123 }),
			}),
		);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: "Invalid request.",
		});
	});

	test("should reject oversized verification payloads", async () => {
		const oversizedToken = "x".repeat(SESSION_VERIFY_MAX_BODY_BYTES);
		const body = JSON.stringify({ token: oversizedToken });
		const response = await handlePostSessionVerify(
			new Request("http://localhost/api/session/verify", {
				method: "POST",
				headers: {
					"content-length": String(new TextEncoder().encode(body).byteLength),
				},
				body,
			}),
		);

		expect(response.status).toBe(413);
		await expect(response.json()).resolves.toEqual({
			error: "Invalid request.",
		});
	});

	test("should reject verification when Turnstile validation fails", async () => {
		state.verifiedToken = false;

		const response = await handlePostSessionVerify(
			new Request("http://localhost/api/session/verify", {
				method: "POST",
				body: JSON.stringify({ token: "token" }),
			}),
		);

		expect(response.status).toBe(403);
		await expect(response.json()).resolves.toEqual({
			error: "Session verification failed.",
		});
	});
});
