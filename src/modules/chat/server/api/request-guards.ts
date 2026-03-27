import { BadRequest, PayloadTooLarge } from "@/lib/http/response";
import { isRequestBodyTooLarge, parseAndValidateChatRequest } from "../../schema/validation";
import type { OreAgentUIMessage } from "@/modules/agent";

export async function validateChatPostRequest(
  request: Request,
): Promise<{ sessionId: string; message: OreAgentUIMessage }> {
  const rawBody = await request.text();
  if (isRequestBodyTooLarge(request.headers, rawBody)) {
    throw PayloadTooLarge("Message is too large.");
  }

  const chatRequest = await parseAndValidateChatRequest(rawBody);
  if (!chatRequest) {
    throw BadRequest("Invalid request.");
  }

  return chatRequest;
}
