import type { UIMessage } from "ai";
import type { OreAgentUIMessage } from "@/modules/agent";

export function normalizeConversationHistoryMessage(message: UIMessage): OreAgentUIMessage | null {
  if (message.role === "system") {
    return null;
  }

  return message as OreAgentUIMessage;
}

export function normalizeConversationHistoryMessages(messages: UIMessage[]): OreAgentUIMessage[] {
  return messages.flatMap((message) => {
    const normalized = normalizeConversationHistoryMessage(message);
    return normalized ? [normalized] : [];
  });
}
