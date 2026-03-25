import type { ReactNode } from "react";
import { ConversationEmptyState } from "../conversation-empty-state";
import { ConversationFeatureCards } from "./feature-cards";

type ConversationEmptyViewProps = {
	composer: ReactNode;
	onPromptSelect: (prompt: string) => void;
};

export function ConversationEmptyView({
	composer,
	onPromptSelect,
}: ConversationEmptyViewProps) {
	return (
		<div className="flex flex-1 min-h-0 flex-col overflow-y-auto">
			<div className="mx-auto w-full max-w-3xl px-4 pt-16 pb-12 sm:px-6">
				<ConversationEmptyState />
				{composer}
				<ConversationFeatureCards onPromptSelect={onPromptSelect} />
			</div>
		</div>
	);
}
