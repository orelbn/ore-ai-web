import { BadRequest } from "@/lib/http/response";
import { parseAndValidateChatRequest } from "../../schema/validation";
import type { OreAgentUIMessage } from "@/modules/agent";

export async function validateChatPostRequest(
  request: Request,
): Promise<{ sessionId: string; message: OreAgentUIMessage }> {
  const rawBody = await request.text();
  const chatRequest = await parseAndValidateChatRequest(rawBody);
  if (!chatRequest) {
    throw BadRequest("Invalid request.");
  }

  return chatRequest;
}
