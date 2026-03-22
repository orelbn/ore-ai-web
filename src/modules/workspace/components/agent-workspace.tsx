"use client";

import { useEffect, useState } from "react";
import {
	createEmptyConversation,
	type ConversationRecord,
} from "@/modules/chat";
import { ConversationPane } from "./conversation-pane";
import { WorkspaceHeader } from "./workspace-header";

type AgentWorkspaceProps = {
	initialConversation: ConversationRecord;
	onSessionRejected: () => void;
};

export function AgentWorkspace({
	initialConversation,
	onSessionRejected,
}: AgentWorkspaceProps) {
	const [conversationSeed, setConversationSeed] =
		useState<ConversationRecord>(initialConversation);

	useEffect(() => {
		setConversationSeed(initialConversation);
	}, [initialConversation]);

	return (
		<main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
			<WorkspaceHeader
				onResetConversation={() => {
					setConversationSeed(createEmptyConversation());
				}}
			/>
			<div className="min-h-0 flex-1">
				<ConversationPane
					handleRejected={() => {
						onSessionRejected();
						setConversationSeed(createEmptyConversation());
					}}
					initialConversation={conversationSeed}
				/>
			</div>
		</main>
	);
}
