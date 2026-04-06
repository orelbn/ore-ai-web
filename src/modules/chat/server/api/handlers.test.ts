import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import type { UIMessage } from "ai";
import type { McpServiceBinding } from "@/services/mcp/types";
import { postHandler } from "./handlers";

const state = vi.hoisted<{
  createChatResponseCalls: number;
  lastCreateChatResponseInput: Record<string, unknown> | null;
  env: {
    BETTER_AUTH_SECRET: string;
    CHAT_USER_QUOTA: RateLimit;
    CHAT_IP_QUOTA: RateLimit;
    GOOGLE_GENERATIVE_AI_API_KEY: string;
    MCP_SERVER_URL: string;
    ORE_AI_MCP: McpServiceBinding;
  };
}>(() => ({
  createChatResponseCalls: 0,
  lastCreateChatResponseInput: null,
  env: {
    BETTER_AUTH_SECRET: "better-auth-secret",
    CHAT_USER_QUOTA: {
      limit: async () => ({ success: true }),
    },
    CHAT_IP_QUOTA: {
      limit: async () => ({ success: true }),
    },
    GOOGLE_GENERATIVE_AI_API_KEY: "google-key",
    MCP_SERVER_URL: "https://example.com/mcp",
    ORE_AI_MCP: {
      fetch: async () => new Response("ok"),
    },
  },
}));

vi.mock("cloudflare:workers", () => ({
  env: state.env,
}));

vi.mock("@/services/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({ user: { id: "user-1" } }),
    },
  },
}));

vi.mock("../logic/create-chat-response", () => ({
  createChatResponse: async (options: Record<string, unknown>) => {
    state.createChatResponseCalls += 1;
    state.lastCreateChatResponseInput = options;
    return new Response("ok", { status: 200 });
  },
}));

vi.mock("../../schema/validation", () => ({
  parseChatPostRequest: async () => ({
    sessionId: "conversation-1",
    message: {
      id: "user-1",
      role: "user",
      parts: [{ type: "text", text: "hello" }],
    } satisfies UIMessage,
  }),
}));

beforeEach(() => {
  state.createChatResponseCalls = 0;
  state.lastCreateChatResponseInput = null;
});

describe("postHandler", () => {
  test("creates the chat response for the authenticated user", async () => {
    const response = await postHandler(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "conversation-1",
          messages: [
            {
              id: "user-1",
              role: "user",
              parts: [{ type: "text", text: "hello" }],
            },
          ],
        }),
      }),
      "user-1",
    );

    expect(response.status).toBe(200);
    expect(state.createChatResponseCalls).toBe(1);
    expect(state.lastCreateChatResponseInput).toMatchObject({
      userId: "user-1",
      sessionId: "conversation-1",
      message: expect.objectContaining({
        id: "user-1",
        role: "user",
      }),
    });
  });
});
