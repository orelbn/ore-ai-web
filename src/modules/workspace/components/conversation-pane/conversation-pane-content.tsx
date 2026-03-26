"use client";
import { extractLastToolResult } from "@/modules/agent";
import type { SessionMessage } from "@/modules/chat";
import { useAutoScroll } from "../../client/use-auto-scroll";
import { ConversationComposer } from "../conversation-composer";
import { ConversationMessageList } from "../conversation-message-list";
import { ToolOutputPanel } from "../tool-output-panel";
import { ConversationEmptyView } from "./conversation-empty-view";

type ConversationPaneContentProps = {
	error: Error | undefined;
	input: string;
	messages: SessionMessage[];
	onInputChange: (value: string) => void;
	onPromptSelect: (value: string) => void;
	onStop: () => void;
	onSubmit: () => Promise<void>;
	status: string;
};

export function ConversationPaneContent({
	error,
	input,
	messages,
	onInputChange,
	onPromptSelect,
	onStop,
	onSubmit,
	status,
}: ConversationPaneContentProps) {
	const bottomAnchorRef = useAutoScroll(messages.length);
	const isEmpty = messages.length === 0;
	const lastToolResult = extractLastToolResult(messages);
	const showToolPanel = !isEmpty && lastToolResult !== null;
	const visibleErrorMessage =
		error?.message ||
		(error ? "Something went wrong. Please try again." : null);

	const composer = (
		<ConversationComposer
			input={input}
			onInputChange={onInputChange}
			onSubmit={onSubmit}
			status={status}
			onStop={onStop}
			placeholder="Message OreAI…"
		/>
	);

	return (
		<>
			{isEmpty ? (
				<ConversationEmptyView
					composer={composer}
					onPromptSelect={onPromptSelect}
				/>
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
			{visibleErrorMessage ? (
				<p className="mt-2 px-2 text-xs text-destructive" role="alert">
					{visibleErrorMessage}
				</p>
			) : null}
		</>
	);
}
