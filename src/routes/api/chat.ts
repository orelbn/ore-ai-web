import { handleGetChat, handlePostChat } from "@/modules/chat/server";
import { createFileRoute } from "@tanstack/react-router";

export const maxDuration = 30;

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			GET: ({ request }) => handleGetChat(request),
			POST: ({ request }) => handlePostChat(request),
		},
	},
});
