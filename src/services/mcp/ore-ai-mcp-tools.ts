import type { ToolSet } from "ai";
import { resolveMcpToolsFromServers } from "./tooling";
import type { McpServiceBinding } from "./types";

export interface ResolveOreAiMcpToolsInput {
  mcpServiceBinding: McpServiceBinding;
  internalSecret: string;
  userId: string;
  requestId: string;
  mcpServerUrl?: string;
}

export interface ResolvedOreAiMcpTools {
  tools: ToolSet;
  close: () => Promise<void>;
}

export type OreAiMcpServiceBinding = McpServiceBinding;

export async function resolveOreAiMcpTools({
  mcpServiceBinding,
  internalSecret,
  userId,
  requestId,
  mcpServerUrl,
}: ResolveOreAiMcpToolsInput): Promise<ResolvedOreAiMcpTools> {
  const requestHeaders = {
    "x-ore-internal-secret": internalSecret,
    "x-ore-user-id": userId,
    "x-ore-request-id": requestId,
  };

  return resolveMcpToolsFromServers({
    requestId,
    servers: [
      {
        serverName: "ore_ai_mcp",
        serverUrl: mcpServerUrl,
        serviceBinding: mcpServiceBinding,
        requestHeaders,
      },
    ],
  });
}
