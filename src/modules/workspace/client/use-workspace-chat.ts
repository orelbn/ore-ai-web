"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import type { SessionChat, SessionMessage } from "@/modules/chat";

export function useWorkspaceChat(sessionChat: SessionChat) {
	const sessionIdRef = useRef(sessionChat.sessionId);
	const [needsRefresh, setNeedsRefresh] = useState(false);

	const chatTransportFetch = Object.assign(
		async (
			input: Parameters<typeof globalThis.fetch>[0],
			init?: Parameters<typeof globalThis.fetch>[1],
		) => {
			const response = await globalThis.fetch(input, {
				...init,
				headers: init?.headers,
			});

			if (response.status === 401) {
				setNeedsRefresh(true);
				return new Response(
					"We couldn’t continue this request. Refresh to try again.",
					{
						status: 401,
					},
				);
			}

			return response;
		},
		globalThis.fetch,
	);

	const { setMessages, ...chat } = useChat<SessionMessage>({
		id: "ore-ai",
		messages: sessionChat.messages,
		transport: new DefaultChatTransport({
			api: "/api/chat",
			fetch: chatTransportFetch,
			prepareSendMessagesRequest({ messages: requestMessages }) {
				const latestMessage = requestMessages[requestMessages.length - 1];

				return {
					body: {
						sessionId: sessionIdRef.current,
						message: latestMessage,
					},
				};
			},
		}),
	});

	useEffect(() => {
		sessionIdRef.current = sessionChat.sessionId;
		setMessages(sessionChat.messages);
	}, [sessionChat, setMessages]);

	return {
		...chat,
		needsRefresh,
		refreshPage() {
			window.location.reload();
		},
	};
}
