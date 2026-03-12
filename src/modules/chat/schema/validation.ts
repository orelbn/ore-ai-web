import type { UIMessage } from "ai";
import { ChatRequestError } from "../errors/chat-request-error";
import {
	CHAT_MAX_BODY_BYTES,
	CHAT_MAX_MESSAGE_CHARS,
} from "../server/constants";

export { ChatRequestError } from "../errors/chat-request-error";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function assertRequestBodySize(headers: Headers, rawBody: string) {
	const contentLength = headers.get("content-length");
	if (contentLength) {
		const lengthValue = Number.parseInt(contentLength, 10);
		if (Number.isFinite(lengthValue) && lengthValue > CHAT_MAX_BODY_BYTES) {
			throw new ChatRequestError("Request body is too large.", 413);
		}
	}

	const encodedLength = new TextEncoder().encode(rawBody).byteLength;
	if (encodedLength > CHAT_MAX_BODY_BYTES) {
		throw new ChatRequestError("Request body is too large.", 413);
	}
}

function validateUserMessage(message: UIMessage): UIMessage {
	if (message.role !== "user") {
		return message;
	}

	if (!Array.isArray(message.parts) || message.parts.length === 0) {
		throw new ChatRequestError(
			"User messages must include at least one text part.",
			400,
		);
	}

	let totalChars = 0;
	for (const part of message.parts) {
		if (part.type !== "text") {
			throw new ChatRequestError(
				"Only plain text user messages are allowed.",
				400,
			);
		}

		totalChars += part.text.length;
		if (totalChars > CHAT_MAX_MESSAGE_CHARS) {
			throw new ChatRequestError("Message exceeds maximum length.", 413);
		}
	}

	if (totalChars === 0) {
		throw new ChatRequestError("Message cannot be empty.", 400);
	}

	return message;
}

export function parseAndValidateChatRequest(rawBody: string): {
	messages: UIMessage[];
} {
	let parsed: unknown;

	try {
		parsed = JSON.parse(rawBody);
	} catch {
		throw new ChatRequestError("Invalid JSON payload.", 400);
	}

	if (!isRecord(parsed)) {
		throw new ChatRequestError("Invalid request payload.", 400);
	}

	const rawMessages = parsed.messages;
	if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
		throw new ChatRequestError("Messages are required.", 400);
	}

	const messages = rawMessages as UIMessage[];
	for (const message of messages) {
		if (!isRecord(message) || typeof message.role !== "string") {
			throw new ChatRequestError("Invalid message payload.", 400);
		}

		if (message.role === "user") {
			validateUserMessage(message);
		}
	}

	const lastMessage = messages[messages.length - 1];
	if (!lastMessage || lastMessage.role !== "user") {
		throw new ChatRequestError(
			"The latest message must be from the user.",
			400,
		);
	}

	return {
		messages,
	};
}
