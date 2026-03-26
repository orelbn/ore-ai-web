import { textError } from "@/lib/http/error-responses";
import type { SessionMessage } from "../../types";
import type { ChatRequestError } from "../../errors/chat-request-error";
import {
	assertRequestBodySize,
	parseAndValidateChatRequest,
} from "../../schema/validation";

export async function validateChatPostRequest(
	request: Request,
): Promise<{ sessionId: string; message: SessionMessage }> {
	const rawBody = await request.text();
	assertRequestBodySize(request.headers, rawBody);
	return await parseAndValidateChatRequest(rawBody);
}

export function mapChatRequestErrorToResponse(
	error: ChatRequestError,
): Response {
	if (error.status === 413) {
		return textError(413, "Message is too large.");
	}

	return textError(error.status, "Invalid request.");
}
