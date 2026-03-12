export const env = {
	TURNSTILE_SITE_KEY: "test-site-key",
	TURNSTILE_SECRET_KEY: "test-turnstile-secret",
	SESSION_ACCESS_SECRET: "test-session-secret",
	MCP_SERVER_URL: "https://example.com/mcp",
	MCP_INTERNAL_SHARED_SECRET: "test-mcp-secret",
	RATE_LIMITER: {
		getByName: () => ({
			fetch: async () => Response.json({ allowed: true }),
		}),
	},
	ORE_AI_MCP: {
		fetch: async () => new Response("ok"),
	},
	AGENT_PROMPTS: {
		get: async () => null,
	},
};
