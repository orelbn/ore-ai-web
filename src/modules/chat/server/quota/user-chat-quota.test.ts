import { describe, expect, test, vi } from "vitest";
import { CHAT_USER_QUOTA_EXCEEDED_MESSAGE } from "../../constants";
import {
	buildUserChatQuotaExceededResponse,
	enforceUserChatQuota,
	UserChatQuotaExceededError,
} from "./user-chat-quota";

describe("user chat quota", () => {
	test("uses the anonymous user id as the Cloudflare rate-limit key", async () => {
		const limit = vi.fn(async () => ({ success: true }));

		await expect(
			enforceUserChatQuota({ limit } as RateLimit, "user-123"),
		).resolves.toBeUndefined();

		expect(limit).toHaveBeenCalledWith({ key: "user:user-123" });
	});

	test("throws a quota-specific error when the limiter rejects the request", async () => {
		const limit = vi.fn(async () => ({ success: false }));

		await expect(
			enforceUserChatQuota({ limit } as RateLimit, "user-123"),
		).rejects.toEqual(expect.any(UserChatQuotaExceededError));
	});

	test("builds a plain-text 429 response for quota exhaustion", async () => {
		const response = buildUserChatQuotaExceededResponse();

		expect(response.status).toBe(429);
		await expect(response.text()).resolves.toBe(
			CHAT_USER_QUOTA_EXCEEDED_MESSAGE,
		);
	});
});
