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
		<main className="relative h-dvh overflow-hidden bg-background text-foreground">
			<section className="flex h-full min-h-0 flex-col">
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
			</section>
		</main>
	);
}
