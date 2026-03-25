"use client";

import type { SessionChat } from "@/modules/chat";
import { useAutoScroll } from "../client/use-auto-scroll";
import { useConversationSubmission } from "../client/use-conversation-submission";
import { useWorkspaceChat } from "../client/use-workspace-chat";
import { ConversationComposer } from "./conversation-composer";
import { RefreshRequiredDialog } from "./refresh-required-dialog";
import { ConversationMessageList } from "./conversation-message-list";
import { ToolOutputPanel } from "./tool-output-panel";
import { ConversationEmptyView } from "./conversation-pane/conversation-empty-view";
import { extractLastToolResult } from "../utils/tool-ui";

export { FEATURE_CARDS } from "./conversation-pane/feature-cards";

type ConversationPaneProps = {
	sessionChat: SessionChat;
};

export function ConversationPane({ sessionChat }: ConversationPaneProps) {
	const {
		error,
		messages,
		needsRefresh,
		refreshPage,
		sendMessage,
		status,
		stop,
	} = useWorkspaceChat(sessionChat);
	const { handleSubmit, input, setInput } = useConversationSubmission({
		sendMessage,
		status,
	});
	const bottomAnchorRef = useAutoScroll(messages.length);
	const isEmpty = messages.length === 0;

	const lastToolResult = extractLastToolResult(messages);
	const showToolPanel = !isEmpty && lastToolResult !== null;

	const composer = (
		<ConversationComposer
			input={input}
			onInputChange={setInput}
			onSubmit={handleSubmit}
			status={status}
			onStop={stop}
			placeholder="Message OreAI…"
		/>
	);

	return (
		<section className="flex h-full min-h-0 flex-col">
			<RefreshRequiredDialog isOpen={needsRefresh} onRefresh={refreshPage} />
			{isEmpty ? (
				<ConversationEmptyView composer={composer} onPromptSelect={setInput} />
			) : (
				<div className="flex min-h-0 flex-1 overflow-hidden">
					<div className="flex min-h-0 flex-1 flex-col">
						<ConversationMessageList
							messages={messages}
							status={status}
							bottomAnchorRef={bottomAnchorRef}
						/>
						<div className="px-4 pb-4 pt-3 sm:px-6">
							<div className="mx-auto w-full max-w-3xl">{composer}</div>
						</div>
					</div>
					{showToolPanel ? (
						<div className="hidden w-85 shrink-0 border-l border-border/40 lg:flex lg:flex-col">
							<ToolOutputPanel toolResult={lastToolResult} />
						</div>
					) : null}
				</div>
			)}
			{error && !needsRefresh ? (
				<p className="mt-2 px-2 text-xs text-destructive" role="alert">
					{error.message || "Something went wrong. Please try again."}
				</p>
			) : null}
		</section>
	);
}
