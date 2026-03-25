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
		<main className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
			<div
				className="pointer-events-none absolute inset-0 overflow-hidden"
				aria-hidden="true"
			>
				<div className="page-background-glow page-background-glow-top-left absolute -left-64 -top-64 opacity-60" />
				<div className="page-background-glow page-background-glow-bottom-right absolute -bottom-48 -right-48 opacity-50" />
			</div>
			<div className="relative z-10 flex min-h-0 flex-1 flex-col">
				<WorkspaceHeader
					onResetConversation={() => {
						setChatSeed(createEmptySessionChat());
					}}
				/>
				<div className="min-h-0 flex-1">
					<ConversationPane sessionChat={chatSeed} />
				</div>
			</div>
		</main>
	);
}
