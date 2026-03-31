import type { ToolSet } from "ai";
import { resolveMcpToolsFromServers } from "./tooling";
import type { McpServiceBinding } from "./types";

export interface ResolveOreAiMcpToolsInput {
  mcpServiceBinding: McpServiceBinding;
  mcpServerUrl?: string;
}

export interface ResolvedOreAiMcpTools {
  tools: ToolSet;
  close: () => Promise<void>;
}

export type OreAiMcpServiceBinding = McpServiceBinding;

export async function resolveOreAiMcpTools({
  mcpServiceBinding,
  mcpServerUrl,
}: ResolveOreAiMcpToolsInput): Promise<ResolvedOreAiMcpTools> {
  return resolveMcpToolsFromServers({
    servers: [
      {
        serverName: "ore_ai_mcp",
        serverUrl: mcpServerUrl,
        serviceBinding: mcpServiceBinding,
      },
    ],
  });
}
