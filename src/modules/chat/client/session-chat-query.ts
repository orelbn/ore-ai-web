"use client";

import { queryOptions } from "@tanstack/react-query";
import { parseSessionChat } from "../schema/validation";

export const sessionChatQueryOptions = queryOptions({
	queryKey: ["session-chat"] as const,
	queryFn: fetchSessionChat,
});

async function fetchSessionChat() {
	const response = await fetch("/api/chat", {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to load session chat.");
	}

	return parseSessionChat(await response.json());
}
