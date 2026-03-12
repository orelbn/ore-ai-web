import type { ToolSet, UIMessage } from "ai";
import { afterEach, beforeAll, describe, expect, vi, test } from "vitest";
import type { OreAiMcpServiceBinding } from "@/services/mcp/ore-ai-mcp-tools";

const state: {
	validateCalls: Array<{ messages: UIMessage[] }>;
	createStreamCalls: number;
	closeCalls: number;
} = {
	validateCalls: [],
	createStreamCalls: 0,
	closeCalls: 0,
};

vi.mock("ai", () => ({
	validateUIMessages: async (input: { messages: UIMessage[] }) => {
		state.validateCalls.push(input);
		return input.messages;
	},
	createAgentUIStreamResponse: (_input: unknown) => {
		state.createStreamCalls += 1;
		return new Response("stream", { status: 200 });
	},
}));

vi.mock("@/services/google-ai/ore-agent", () => ({
	createOreAgent: () => ({ type: "mock-agent" }),
}));

let streamAssistantReply: typeof import("./assistant-stream").streamAssistantReply;

beforeAll(async () => {
	({ streamAssistantReply } = await import("./assistant-stream"));
});

afterEach(() => {
	state.validateCalls = [];
	state.createStreamCalls = 0;
	state.closeCalls = 0;
	vi.restoreAllMocks();
});

function textMessage(
	id: string,
	role: UIMessage["role"],
	text: string,
): UIMessage {
	return { id, role, parts: [{ type: "text", text }] };
}

describe("streamAssistantReply", () => {
	test("validates provided messages and closes MCP tools", async () => {
		const mcpServiceBinding: OreAiMcpServiceBinding = {
			fetch: async () => new Response("ok"),
		};
		const tools: ToolSet = {};
		const response = await streamAssistantReply({
			requestId: "request-1",
			agentOptions: { googleApiKey: "test-key" },
			messages: [
				textMessage("u-1", "user", "hello"),
				textMessage("a-1", "assistant", "hi"),
			],
			actorId: "request-1",
			mcpServiceBinding,
			mcpInternalSecret: "secret",
			mcpServerUrl: "https://example.com/mcp",
			resolveMcpTools: async () => ({
				tools,
				close: async () => {
					state.closeCalls += 1;
				},
			}),
		});

		expect(response.status).toBe(200);
		expect(state.validateCalls).toHaveLength(1);
		expect(state.validateCalls[0]?.messages).toHaveLength(2);
		expect(state.createStreamCalls).toBe(1);
	});
});
