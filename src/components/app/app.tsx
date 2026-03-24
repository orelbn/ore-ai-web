"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { sessionChatQueryOptions } from "@/modules/chat";
import { AgentWorkspace } from "@/modules/workspace";

export function App() {
	const { data: sessionChat } = useSuspenseQuery(sessionChatQueryOptions);

	return <AgentWorkspace sessionChat={sessionChat} />;
}
