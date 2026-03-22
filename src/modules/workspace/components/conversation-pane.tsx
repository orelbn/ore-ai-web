"use client";

import type { ConversationRecord } from "@/modules/chat";
import { useAutoScroll } from "../client/use-auto-scroll";
import { useConversationSubmission } from "../client/use-conversation-submission";
import { useWorkspaceChat } from "../client/use-workspace-chat";
import { ConversationComposer } from "./conversation-composer";
import { ConversationEmptyState } from "./conversation-empty-state";
import { ConversationMessageList } from "./conversation-message-list";
import { EmptyStateFooter } from "./empty-state-footer";

const QUICK_PROMPTS = [
	"What are the projects Orel is currently working on?",
	"What are Orel's favorite coffee shops?",
	"Which books is Orel currently reading?",
	"Provide Orel's latest blog post.",
];

type ConversationPaneProps = {
	handleRejected: () => void;
	initialConversation: ConversationRecord;
};

export function ConversationPane({
	handleRejected,
	initialConversation,
}: ConversationPaneProps) {
	const { error, messages, sendMessage, status, stop } = useWorkspaceChat({
		handleRejected,
		initialConversation,
	});
	const { handleSubmit, input, setInput } = useConversationSubmission({
		sendMessage,
		status,
	});
	const bottomAnchorRef = useAutoScroll(messages.length);
	const isEmpty = messages.length === 0;

	const composer = (
		<ConversationComposer
			input={input}
			onInputChange={setInput}
			onSubmit={handleSubmit}
			status={status}
			onStop={stop}
			showQuickPrompts={isEmpty}
			quickPrompts={QUICK_PROMPTS}
			placeholder="What would you like to do?"
		/>
	);

	return (
		<section className="flex h-full min-h-0 flex-col">
			{isEmpty ? (
				<div className="flex flex-1 min-h-0 flex-col px-4 pt-6 sm:px-6">
					<div className="flex flex-1 items-center justify-center">
						<div className="w-full max-w-3xl">
							<ConversationEmptyState />
							{composer}
						</div>
					</div>
					<div className="pb-4 pt-6">
						<EmptyStateFooter />
					</div>
				</div>
			) : (
				<>
					<ConversationMessageList
						messages={messages}
						status={status}
						bottomAnchorRef={bottomAnchorRef}
					/>
					<div className="bg-background px-4 pb-4 pt-3 sm:px-6">
						<div className="mx-auto w-full max-w-3xl">{composer}</div>
					</div>
				</>
			)}
			{error ? (
				<p className="mt-2 px-2 text-xs text-destructive" role="alert">
					{error.message || "Something went wrong. Please try again."}
				</p>
			) : null}
		</section>
	);
}
