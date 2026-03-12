import type { UIMessage } from "ai";
import { describe, expect, test } from "vitest";
import {
	mapChatRequestErrorToResponse,
	validateChatPostRequest,
} from "./request-guards";
import { ChatRequestError } from "../../errors/chat-request-error";

function userMessage(text: string): UIMessage {
	return {
		id: crypto.randomUUID(),
		role: "user",
		parts: [{ type: "text", text }],
	};
}

describe("chat request guards", () => {
	test("should parse valid messages payloads", async () => {
		const request = new Request("http://localhost/api/chat", {
			method: "POST",
			body: JSON.stringify({
				messages: [userMessage("hello")],
			}),
		});

		await expect(validateChatPostRequest(request)).resolves.toMatchObject({
			messages: [expect.objectContaining({ role: "user" })],
		});
	});

	test("should map 413 errors to the public oversized-message response", async () => {
		const response = mapChatRequestErrorToResponse(
			new ChatRequestError("too big", 413),
		);

		await expect(response.json()).resolves.toEqual({
			error: "Message is too large.",
		});
	});
});
