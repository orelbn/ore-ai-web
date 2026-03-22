"use client";

import { AgentWorkspace } from "@/modules/workspace";
import type { ConversationRecord } from "@/modules/chat";

export type HomeProps = {
	initialConversation: ConversationRecord;
	onSessionRejected: () => void;
};

export function Home({ initialConversation, onSessionRejected }: HomeProps) {
	return (
		<AgentWorkspace
			initialConversation={initialConversation}
			onSessionRejected={onSessionRejected}
		/>
	);
}
