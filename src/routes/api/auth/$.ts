import { handleAuthRequest } from "@/services/auth";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

async function handleRequest(request: Request) {
	return handleAuthRequest({
		request,
		env,
	});
}

export async function GET(request: Request) {
	return handleRequest(request);
}

export async function POST(request: Request) {
	return handleRequest(request);
}

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => GET(request),
			POST: ({ request }) => POST(request),
		},
	},
});
