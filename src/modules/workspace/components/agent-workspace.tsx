"use client";

import { useEffect, useState } from "react";
import { createEmptySessionChat, type SessionChat } from "@/modules/chat";
import { ConversationPane } from "./conversation-pane";
import { WorkspaceHeader } from "./workspace-header";

type AgentWorkspaceProps = {
	sessionChat: SessionChat;
};

export function AgentWorkspace({ sessionChat }: AgentWorkspaceProps) {
	const [chatSeed, setChatSeed] = useState<SessionChat>(sessionChat);

	useEffect(() => {
		setChatSeed(sessionChat);
	}, [sessionChat]);

	return (
		<main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
			<WorkspaceHeader
				onResetConversation={() => {
					setChatSeed(createEmptySessionChat());
				}}
			/>
			<div className="min-h-0 flex-1">
				<ConversationPane sessionChat={chatSeed} />
			</div>
		</main>
	);
}
