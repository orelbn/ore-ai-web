import { afterEach, describe, expect, test, vi } from "vitest";
import { verifyTurnstileToken } from "./turnstile";

const fetchMock = vi.fn<typeof fetch>();

function makeSuccessfulVerificationResponse(
	input: { action?: string; hostname?: string } = {},
) {
	return new Response(
		JSON.stringify({
			success: true,
			action: input.action,
			hostname: input.hostname,
		}),
		{ status: 200 },
	);
}

describe("verifyTurnstileToken", () => {
	afterEach(() => {
		fetchMock.mockReset();
		vi.unstubAllGlobals();
	});

	test("should accept a successful verification when action and hostname match", async () => {
		vi.stubGlobal("fetch", fetchMock);
		fetchMock.mockResolvedValue(
			makeSuccessfulVerificationResponse({
				action: "chat_send",
				hostname: "localhost",
			}),
		);

		const verified = await verifyTurnstileToken({
			request: new Request("http://localhost/api/chat"),
			token: "token",
			secretKey: "secret",
			expectedAction: "chat_send",
			expectedHostname: "localhost",
		});

		expect(verified).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	test("should reject a successful response when the action does not match", async () => {
		vi.stubGlobal("fetch", fetchMock);
		fetchMock.mockResolvedValue(
			makeSuccessfulVerificationResponse({
				action: "different_action",
				hostname: "localhost",
			}),
		);

		const verified = await verifyTurnstileToken({
			request: new Request("http://localhost/api/chat"),
			token: "token",
			secretKey: "secret",
			expectedAction: "chat_send",
			expectedHostname: "localhost",
		});

		expect(verified).toBe(false);
	});

	test("should reject a successful response when the hostname does not match", async () => {
		vi.stubGlobal("fetch", fetchMock);
		fetchMock.mockResolvedValue(
			makeSuccessfulVerificationResponse({
				action: "chat_send",
				hostname: "different-host.example",
			}),
		);

		const verified = await verifyTurnstileToken({
			request: new Request("http://localhost/api/chat"),
			token: "token",
			secretKey: "secret",
			expectedAction: "chat_send",
			expectedHostname: "localhost",
		});

		expect(verified).toBe(false);
	});

	test("should reject a successful response when the expected action is missing", async () => {
		vi.stubGlobal("fetch", fetchMock);
		fetchMock.mockResolvedValue(
			makeSuccessfulVerificationResponse({
				hostname: "localhost",
			}),
		);

		const verified = await verifyTurnstileToken({
			request: new Request("http://localhost/api/chat"),
			token: "token",
			secretKey: "secret",
			expectedAction: "chat_send",
			expectedHostname: "localhost",
		});

		expect(verified).toBe(false);
	});

	test("should reject a successful response when the expected hostname is missing", async () => {
		vi.stubGlobal("fetch", fetchMock);
		fetchMock.mockResolvedValue(
			makeSuccessfulVerificationResponse({
				action: "chat_send",
			}),
		);

		const verified = await verifyTurnstileToken({
			request: new Request("http://localhost/api/chat"),
			token: "token",
			secretKey: "secret",
			expectedAction: "chat_send",
			expectedHostname: "localhost",
		});

		expect(verified).toBe(false);
	});

	test("should retry once when Cloudflare returns an internal error", async () => {
		vi.stubGlobal("fetch", fetchMock);
		fetchMock
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						success: false,
						"error-codes": ["internal-error"],
					}),
					{ status: 200 },
				),
			)
			.mockResolvedValueOnce(
				makeSuccessfulVerificationResponse({
					action: "chat_send",
					hostname: "localhost",
				}),
			);

		const verified = await verifyTurnstileToken({
			request: new Request("http://localhost/api/chat"),
			token: "token",
			secretKey: "secret",
			expectedAction: "chat_send",
			expectedHostname: "localhost",
		});

		expect(verified).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
