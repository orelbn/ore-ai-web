import type { ToolSet } from "ai";
import { afterAll, beforeEach, describe, expect, vi, test } from "vite-plus/test";
import type { McpServiceBinding } from "./types";
import { resolveOreAiMcpTools } from "./ore-ai-mcp-tools";

const state: {
  calls: Array<{
    requestId: string;
    servers: Array<{
      serverName: string;
      serverUrl: string;
      serviceBinding?: McpServiceBinding;
      requestHeaders?: Record<string, string>;
    }>;
  }>;
  resolvedTools: ToolSet;
  closeCalls: number;
} = {
  calls: [],
  resolvedTools: {
    "ore.alpha": { execute: async () => ({ ok: true }) },
  } as unknown as ToolSet,
  closeCalls: 0,
};

function resetState() {
  state.calls = [];
  state.resolvedTools = {
    "ore.alpha": { execute: async () => ({ ok: true }) },
  } as unknown as ToolSet;
  state.closeCalls = 0;
}

vi.mock("../mcp/tooling", () => ({
  resolveMcpToolsFromServers: async (options: {
    requestId: string;
    servers: Array<{
      serverName: string;
      serverUrl: string;
      serviceBinding?: McpServiceBinding;
      requestHeaders?: Record<string, string>;
    }>;
  }) => {
    state.calls.push(options);
    return {
      tools: state.resolvedTools,
      close: async () => {
        state.closeCalls += 1;
      },
    };
  },
}));

beforeEach(() => {
  resetState();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("resolveOreAiMcpTools", () => {
  test("forwards server config and request headers", async () => {
    const binding: McpServiceBinding = {
      fetch: async () => new Response("ok"),
    };
    const resolved = await resolveOreAiMcpTools({
      mcpServiceBinding: binding,
      internalSecret: "mcp-secret",
      userId: "user-1",
      requestId: "request-1",
      mcpServerUrl: "https://ore-ai-mcp/mcp",
    });

    expect(state.calls).toHaveLength(1);
    expect(state.calls[0]).toEqual({
      requestId: "request-1",
      servers: [
        {
          serverName: "ore_ai_mcp",
          serverUrl: "https://ore-ai-mcp/mcp",
          serviceBinding: binding,
          requestHeaders: {
            "x-ore-internal-secret": "mcp-secret",
            "x-ore-user-id": "user-1",
            "x-ore-request-id": "request-1",
          },
        },
      ],
    });

    expect(Object.keys(resolved.tools)).toEqual(["ore.alpha"]);
    await resolved.close();
    expect(state.closeCalls).toBe(1);
  });

  test("returns the tools object from resolver", async () => {
    state.resolvedTools = {
      "ore.alpha": { execute: async () => ({ ok: true }) },
      "ore.beta": { execute: async () => ({ ok: true }) },
    } as unknown as ToolSet;

    const resolved = await resolveOreAiMcpTools({
      mcpServiceBinding: {
        fetch: async () => new Response("ok"),
      },
      internalSecret: "mcp-secret",
      userId: "user-1",
      requestId: "request-2",
      mcpServerUrl: "https://ore-ai-mcp/mcp",
    });

    expect(Object.keys(resolved.tools).sort()).toEqual(["ore.alpha", "ore.beta"]);
  });
});
