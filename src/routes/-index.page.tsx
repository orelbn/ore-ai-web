"use client";

import { Home } from "@/components/app/home";
import { useQueryClient } from "@tanstack/react-query";
import { VerificationGate, useVerification } from "@/modules/verification";
import { WorkspacePageFallback } from "@/modules/workspace";
import {
	homeConversationQueryKey,
	useIndexConversation,
} from "./-index.conversation";
import type { IndexRouteLoaderData } from "./-index.loader";

export function IndexPage({
	initialHasSession,
	turnstileSiteKey,
}: IndexRouteLoaderData) {
	const queryClient = useQueryClient();
	const { challenge, error, handleRejected, isReady, isPending } =
		useVerification(turnstileSiteKey, initialHasSession);
	const {
		data: conversation,
		isError,
		error: conversationError,
	} = useIndexConversation(isReady);

	if (!isReady) {
		return (
			<VerificationGate
				challenge={challenge}
				error={error}
				isPending={isPending}
			/>
		);
	}

	if (isError) throw conversationError;
	if (!conversation) return <WorkspacePageFallback />;

	return (
		<Home
			initialConversation={conversation}
			onSessionRejected={() => {
				queryClient.removeQueries({ queryKey: homeConversationQueryKey });
				handleRejected();
			}}
		/>
	);
}
