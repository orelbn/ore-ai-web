"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import type { OreAgentUIMessage } from "@/services/google-ai/ore-agent";
import {
	clearStoredConversation,
	persistConversation,
	readStoredConversation,
} from "../../client/conversation-storage";
import { selectMessagesByTurnSize } from "../../client/context-window";
import { CHAT_CONTEXT_MAX_BYTES } from "../../workspace/constants";
import { ConversationComposer } from "./conversation-composer";
import { ConversationEmptyState } from "./conversation-empty-state";
import { ConversationMessageList } from "./conversation-message-list";
import { EmptyStateFooter } from "./empty-state-footer";
import { SessionAccessChallenge } from "@/modules/session/components/session-access-challenge";
import { useSessionAccess } from "@/modules/session/client/use-session-access";

const QUICK_PROMPTS = [
	"What are the projects Orel is currently working on?",
	"What are Orel's favorite coffee shops?",
	"Which books is Orel currently reading?",
	"Provide Orel's latest blog post.",
];
export function ConversationPane() {
	const [input, setInput] = useState("");
	const bottomAnchorRef = useRef<HTMLDivElement>(null);
	const initialMessages = useRef(readStoredConversation());
	const sessionAccess = useSessionAccess();
	const chatTransportFetch = (async (input, init) => {
		const response = await globalThis.fetch(input, init);
		if (response.status !== 401) {
			return response;
		}

		sessionAccess.handleSessionAccessRejected();
		const restored = await sessionAccess.ensureSessionAccess();
		if (!restored) {
			return new Response("We couldn't send your message. Please try again.", {
				status: 401,
			});
		}

		const retriedResponse = await globalThis.fetch(input, init);
		if (retriedResponse.status === 401) {
			return new Response("We couldn't send your message. Please try again.", {
				status: 401,
			});
		}

		return retriedResponse;
	}) as typeof fetch;

	const { messages, sendMessage, status, error, stop } =
		useChat<OreAgentUIMessage>({
			id: "ore-ai",
			messages: initialMessages.current,
			onFinish: ({ messages: updatedMessages }) => {
				persistConversation(updatedMessages);
			},
			onError: (chatError) => {
				if (/session access/i.test(chatError.message)) {
					sessionAccess.handleSessionAccessRejected();
				}
			},
			transport: new DefaultChatTransport({
				api: "/api/chat",
				fetch: chatTransportFetch,
				prepareSendMessagesRequest({ messages: requestMessages }) {
					const selectedMessages = selectMessagesByTurnSize({
						messages: requestMessages,
						maxBytes: CHAT_CONTEXT_MAX_BYTES,
					});

					return {
						body: {
							messages: selectedMessages,
						},
					};
				},
			}),
		});

	const messageCount = messages.length;
	useEffect(() => {
		void messageCount;
		bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messageCount]);

	useEffect(() => {
		persistConversation(messages);
	}, [messages]);

	async function sendPrompt(promptText: string) {
		setInput("");
		sessionAccess.clearError();
		await sendMessage({ text: promptText });
	}

	async function handleSubmit() {
		const trimmedInput = input.trim();
		if (!trimmedInput || status === "submitted" || status === "streaming") {
			return;
		}

		const hasSessionAccess = await sessionAccess.ensureSessionAccess();
		if (!hasSessionAccess) {
			return;
		}

		await sendPrompt(trimmedInput);
	}

	const isEmpty = messages.length === 0;

	const composer = (
		<ConversationComposer
			input={input}
			onInputChange={setInput}
			onSubmit={handleSubmit}
			status={status}
			onStop={stop}
			canSubmit={sessionAccess.canSubmit}
			showQuickPrompts={isEmpty}
			quickPrompts={QUICK_PROMPTS}
			placeholder="What would you like to do?"
		/>
	);

	const sessionAccessChallenge =
		!sessionAccess.hasFreshSessionAccess && sessionAccess.turnstileSiteKey ? (
			<SessionAccessChallenge
				action={sessionAccess.turnstileAction}
				siteKey={sessionAccess.turnstileSiteKey}
				widgetKey={sessionAccess.turnstileWidgetKey}
				onToken={sessionAccess.handleTurnstileToken}
				onError={sessionAccess.handleTurnstileError}
				onExpired={sessionAccess.handleTurnstileExpired}
			/>
		) : null;

	return (
		<section className="flex h-full min-h-0 flex-col">
			{isEmpty ? (
				<div className="flex flex-1 min-h-0 flex-col px-4 pt-6 sm:px-6">
					<div className="flex flex-1 items-center justify-center">
						<div className="w-full max-w-3xl">
							<ConversationEmptyState />
							{composer}
							{sessionAccessChallenge}
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
						<div className="mx-auto w-full max-w-3xl">
							{composer}
							{sessionAccessChallenge}
						</div>
					</div>
				</>
			)}
			{sessionAccess.error ? (
				<p className="mt-2 px-2 text-xs text-destructive" role="alert">
					{sessionAccess.error}
				</p>
			) : null}
			{error ? (
				<p className="mt-2 px-2 text-xs text-destructive" role="alert">
					{error.message || "Something went wrong. Please try again."}
				</p>
			) : null}
		</section>
	);
}
