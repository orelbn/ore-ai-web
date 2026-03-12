export const env = {
	TURNSTILE_SITE_KEY: "test-site-key",
	TURNSTILE_SECRET_KEY: "test-turnstile-secret",
	HUMAN_VERIFICATION_SECRET: "test-human-secret",
	MCP_SERVER_URL: "https://example.com/mcp",
	MCP_INTERNAL_SHARED_SECRET: "test-mcp-secret",
	ORE_AI_MCP: {
		fetch: async () => new Response("ok"),
	} as unknown as Fetcher,
	AGENT_PROMPTS: {
		get: async () => null,
	} as unknown as R2Bucket,
};
