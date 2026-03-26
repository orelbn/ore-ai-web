import { validateUIMessages } from "ai";
import { tryCatch } from "@/lib/try-catch";
import { ChatRequestError } from "../errors/chat-request-error";
import {
	CHAT_MAX_BODY_BYTES,
	CHAT_MAX_MESSAGE_CHARS,
} from "../server/constants";
import type { SessionChat, SessionMessage } from "../types";
import { chatRequestSchema, chatSchema } from "./payloads";

export { ChatRequestError } from "../errors/chat-request-error";

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

async function validateUserMessage(message: unknown) {
	let validatedMessage: SessionMessage;

	try {
		[validatedMessage] = await validateUIMessages<SessionMessage>({
			messages: [message],
		});
	} catch {
		throw new ChatRequestError("Invalid request payload.", 400);
	}

	if (validatedMessage.role !== "user") {
		throw new ChatRequestError(
			`Only user messages are accepted. Received ${validatedMessage.role}.`,
			400,
		);
	}

	if (
		!Array.isArray(validatedMessage.parts) ||
		validatedMessage.parts.length === 0
	) {
		throw new ChatRequestError(
			"User messages must include at least one text part.",
			400,
		);
	}

	let totalChars = 0;
	for (const part of validatedMessage.parts) {
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

	return validatedMessage;
}

export async function parseAndValidateChatRequest(rawBody: string) {
	const payload = tryCatch(JSON.parse)(rawBody);
	if (payload.error) {
		throw new ChatRequestError("Invalid JSON payload.", 400);
	}

	const parsedRequest = tryCatch(chatRequestSchema.parse)(payload.data);
	if (parsedRequest.error) {
		throw new ChatRequestError("Invalid request payload.", 400);
	}

	const { sessionId, messages } = parsedRequest.data;
	const latestMessage = messages.at(-1);
	if (!latestMessage) {
		throw new ChatRequestError("Invalid request payload.", 400);
	}

	return {
		sessionId,
		message: await validateUserMessage(latestMessage),
	};
}

export async function parseChat(payload: unknown): Promise<SessionChat> {
	const parsedChat = tryCatch(chatSchema.parse)(payload);
	if (parsedChat.error) {
		throw new Error("Invalid session chat payload.");
	}

	const { sessionId, messages: rawMessages } = parsedChat.data;
	if (Array.isArray(rawMessages) && rawMessages.length === 0) {
		return {
			sessionId,
			messages: [],
		};
	}

	const messages = await validateUIMessages<SessionMessage>({
		messages: rawMessages,
	});

	return {
		sessionId,
		messages,
	};
}
