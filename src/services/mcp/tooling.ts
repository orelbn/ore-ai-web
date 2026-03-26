import {
	classifyErrorForLogging,
	type LogRuntimeMode,
} from "@/lib/logging/error-classification";
import { createMCPClient } from "@ai-sdk/mcp";
import type { ToolSet } from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { z } from "zod";
import type {
	McpServerDefinition,
	McpServiceBinding,
	ResolveMcpServersInput,
	ResolvedMcpTools,
} from "./types";

interface ResolvedMcpServer {
	serverName: string;
	tools: ToolSet;
	close: () => Promise<void>;
}

const closeNoop = async () => {};

const mcpServerSchema = z.object({
	serverName: z.string().trim().min(1),
	serverUrl: z.string().trim().url().optional(),
});

function createCloseOnce(closeFn: () => Promise<void>): () => Promise<void> {
	let closePromise: Promise<void> | null = null;
	return async () => {
		if (!closePromise) {
			closePromise = closeFn();
		}
		await closePromise;
	};
}

async function closeMcpClient(
	client: Awaited<ReturnType<typeof createMCPClient>>,
) {
	await client.close().catch(() => {});
}

function isLoopbackHost(hostname: string): boolean {
	return (
		hostname === "localhost" ||
		hostname === "127.0.0.1" ||
		hostname === "::1" ||
		hostname === "[::1]"
	);
}

function toRequest(
	requestInfo: RequestInfo | URL,
	init?: RequestInit,
): Request {
	return requestInfo instanceof Request
		? requestInfo
		: new Request(requestInfo, init);
}

function createTransportFetch(
	serverUrl: URL,
	serviceBinding?: McpServiceBinding,
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
	if (!serviceBinding || isLoopbackHost(serverUrl.hostname)) {
		return async (requestInfo, requestInit) =>
			fetch(toRequest(requestInfo, requestInit));
	}

	return async (requestInfo, requestInit) =>
		serviceBinding.fetch(toRequest(requestInfo, requestInit));
}

function mergeToolSets({
	requestId,
	servers,
}: {
	requestId: string;
	servers: ResolvedMcpServer[];
}): ToolSet {
	const merged: ToolSet = {};

	for (const server of servers) {
		for (const [toolName, tool] of Object.entries(server.tools)) {
			if (toolName in merged) {
				console.warn(
					JSON.stringify({
						scope: "mcp_tooling",
						level: "warn",
						message: "duplicate tool name skipped",
						requestId,
						server: server.serverName,
						toolName,
					}),
				);
				continue;
			}
			merged[toolName] = tool;
		}
	}

	return merged;
}

async function resolveSingleMcpServer({
	requestId,
	server,
	mode,
}: {
	requestId: string;
	server: McpServerDefinition;
	mode?: LogRuntimeMode;
}): Promise<ResolvedMcpServer> {
	let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;
	const validatedServerConfig = mcpServerSchema.safeParse({
		serverName: server.serverName,
		serverUrl: server.serverUrl,
	});

	try {
		if (!validatedServerConfig.success) {
			throw validatedServerConfig.error;
		}
		const parsedUrl = new URL(
			validatedServerConfig.data.serverUrl ?? "https://mcp.invalid/mcp",
		);
		const transport = new StreamableHTTPClientTransport(parsedUrl, {
			requestInit: {
				headers: server.requestHeaders,
			},
			fetch: createTransportFetch(parsedUrl, server.serviceBinding),
		});

		mcpClient = await createMCPClient({ transport });
		const discoveredClient = mcpClient;
		const tools = await discoveredClient.tools();
		const close = createCloseOnce(() => closeMcpClient(discoveredClient));

		return {
			serverName: validatedServerConfig.data.serverName,
			tools,
			close,
		};
	} catch (error) {
		if (mcpClient) {
			await closeMcpClient(mcpClient);
		}

		console.warn(
			JSON.stringify({
				scope: "mcp_tooling",
				level: "warn",
				message: "mcp discovery failed, using empty tools",
				requestId,
				server: server.serverName,
				stage: "discovery",
				...classifyErrorForLogging(error, { mode }),
			}),
		);

		return {
			serverName: server.serverName,
			tools: {},
			close: closeNoop,
		};
	}
}

export async function resolveMcpToolsFromServers({
	requestId,
	servers,
	mode,
}: ResolveMcpServersInput & {
	mode?: LogRuntimeMode;
}): Promise<ResolvedMcpTools> {
	if (servers.length === 0) {
		return {
			tools: {},
			close: closeNoop,
		};
	}

	const resolvedServers = await Promise.all(
		servers.map((server) =>
			resolveSingleMcpServer({
				requestId,
				server,
				mode,
			}),
		),
	);

	return {
		tools: mergeToolSets({
			requestId,
			servers: resolvedServers,
		}),
		close: createCloseOnce(async () => {
			await Promise.all(resolvedServers.map((server) => server.close()));
		}),
	};
}
