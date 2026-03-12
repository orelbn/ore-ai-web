export const env = {
	TURNSTILE_SITE_KEY: "test-site-key",
	TURNSTILE_SECRET_KEY: "test-turnstile-secret",
	SESSION_ACCESS_SECRET: "test-session-secret",
	MCP_SERVER_URL: "https://example.com/mcp",
	MCP_INTERNAL_SHARED_SECRET: "test-mcp-secret",
	RATE_LIMITER: {
		getByName: () =>
			({
				fetch: async () => Response.json({ allowed: true }),
			}) as unknown as DurableObjectStub,
	} as unknown as DurableObjectNamespace,
	ORE_AI_MCP: {
		fetch: async () => new Response("ok"),
	} as unknown as Fetcher,
	AGENT_PROMPTS: {
		get: async () => null,
	} as unknown as R2Bucket,
};
