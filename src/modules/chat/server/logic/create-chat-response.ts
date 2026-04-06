import { env } from "cloudflare:workers";
import { createAgentUIStreamResponse } from "ai";
import { createOreAgent } from "@/modules/agent/server";
import { resolveOreAiMcpTools } from "@/services/mcp/ore-ai-mcp-tools";
import { CHAT_CONTEXT_MAX_BYTES } from "../../constants";
import { selectMessagesByTurnSize } from "../../logic/context-window";
import { loadChat } from "../../logic/load-conversation";
import { saveChat } from "../../logic/save-conversation";
import type { OreAgentUIMessage } from "@/modules/agent";
import { resolveChatRuntimeConfig } from "../config/runtime-config";

type CreateChatResponseOptions = {
  userId: string;
  sessionId: string;
  message: OreAgentUIMessage;
};

export async function createChatResponse({
  userId,
  sessionId,
  message,
}: CreateChatResponseOptions) {
  const storedChat = await loadChat(userId, sessionId);
  const messages = selectMessagesByTurnSize({
    messages: [...(storedChat?.messages ?? []), message],
    maxBytes: CHAT_CONTEXT_MAX_BYTES,
  });
  const runtimeConfig = await resolveChatRuntimeConfig(env);
  const resolvedMcpTools = await resolveOreAiMcpTools({
    mcpServiceBinding: env.ORE_AI_MCP,
    mcpServerUrl: runtimeConfig.mcpServerUrl,
  });
  const agent = createOreAgent(
    { googleApiKey: env.GOOGLE_GENERATIVE_AI_API_KEY },
    resolvedMcpTools.tools,
    runtimeConfig.agentSystemPrompt,
  );
  const responseMessageId = crypto.randomUUID();
  let closePromise: Promise<void> | null = null;

  const closeMcpTools = async () => {
    if (!closePromise) {
      closePromise = resolvedMcpTools.close();
    }

    await closePromise;
  };

  try {
    return createAgentUIStreamResponse({
      agent,
      uiMessages: messages,
      originalMessages: messages,
      generateMessageId: () => responseMessageId,
      onFinish: ({ messages }) =>
        saveChat({
          userId,
          sessionId,
          messages,
        }).finally(closeMcpTools),
      onError: () => {
        void closeMcpTools();
        return "Something went wrong while generating the response.";
      },
    });
  } catch (error) {
    await closeMcpTools();
    throw error;
  }
}
