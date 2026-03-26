import { env } from "cloudflare:workers";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getClientIpFromRequest } from "./client-ip";
import { getIpRateLimitKey, withRateLimit } from "./rate-limit";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("cloudflare rate limit", () => {
	test("extracts the client IP from cf-connecting-ip", () => {
		const request = new Request("https://example.com/api/chat", {
			headers: { "cf-connecting-ip": "203.0.113.7" },
		});

		expect(getClientIpFromRequest(request)).toBe("203.0.113.7");
	});

	test("falls back to x-forwarded-for when cf-connecting-ip is missing", () => {
		const request = new Request("https://example.com/api/chat", {
			headers: { "x-forwarded-for": "203.0.113.7, 198.51.100.8" },
		});

		expect(getClientIpFromRequest(request)).toBe("203.0.113.7");
	});

	test("derives a stable hashed rate-limit key from the request IP", async () => {
		const request = new Request("https://example.com/api/chat", {
			headers: { "cf-connecting-ip": "203.0.113.7" },
		});

		const firstKey = await getIpRateLimitKey(request);
		const secondKey = await getIpRateLimitKey(request);

		expect(firstKey).toMatch(/^ip:[0-9a-f]{32}$/);
		expect(firstKey).toBe(secondKey);
	});

	test("returns a handler descriptor that enforces both limits before continuing", async () => {
		const userLimit = vi
			.spyOn(env.CHAT_USER_QUOTA, "limit")
			.mockResolvedValue({ success: true });
		const ipLimit = vi
			.spyOn(env.CHAT_IP_QUOTA, "limit")
			.mockResolvedValue({ success: true });

		const request = new Request("https://example.com/api/chat", {
			headers: { "cf-connecting-ip": "203.0.113.7" },
		});
		const handler = vi.fn(async (_request: Request, userId: string) => {
			return new Response(userId);
		});

		const rateLimitedHandler = withRateLimit(handler);
		const response = await rateLimitedHandler(request, "user-1");

		expect(userLimit).toHaveBeenCalledWith({ key: "user:user-1" });
		expect(ipLimit).toHaveBeenCalledWith({
			key: expect.stringMatching(/^ip:[0-9a-f]{32}$/),
		});
		expect(handler).toHaveBeenCalledWith(request, "user-1");
		await expect(response.text()).resolves.toBe("user-1");
	});

	test("passes through extra bound arguments to the wrapped handler", async () => {
		vi.spyOn(env.CHAT_USER_QUOTA, "limit").mockResolvedValue({ success: true });
		vi.spyOn(env.CHAT_IP_QUOTA, "limit").mockResolvedValue({ success: true });

		const request = new Request("https://example.com/api/chat");
		const handler = vi.fn(
			async (_request: Request, userId: string, requestId: string) =>
				new Response(`${userId}:${requestId}`),
		);

		const rateLimitedHandler = withRateLimit(handler);
		const response = await rateLimitedHandler(request, "user-1", "request-1");

		expect(handler).toHaveBeenCalledWith(request, "user-1", "request-1");
		await expect(response.text()).resolves.toBe("user-1:request-1");
	});

	test("returns 429 when the user limit is exceeded", async () => {
		vi.spyOn(env.CHAT_USER_QUOTA, "limit").mockResolvedValue({ success: false });
		const ipLimit = vi.spyOn(env.CHAT_IP_QUOTA, "limit");
		const handler = vi.fn(async () => new Response("ok"));

		const rateLimitedHandler = withRateLimit(
			handler as (request: Request, userId: string) => Promise<Response>,
		);
		const response = await rateLimitedHandler(
			new Request("https://example.com/api/chat"),
			"user-1",
		);

		expect(response.status).toBe(429);
		expect(ipLimit).not.toHaveBeenCalled();
		expect(handler).not.toHaveBeenCalled();
	});
});
