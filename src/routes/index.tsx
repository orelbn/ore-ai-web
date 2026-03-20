import { AgentWorkspace } from "@/modules/chat";
import {
	createEmptyConversationRecord,
	loadLatestConversationForUser,
} from "@/modules/chat/repo/conversations";
import { auth } from "@/services/auth";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { Suspense } from "react";
import type { ConversationRecord } from "@/modules/chat/types";

const getSessionEntryConfig = createServerFn({
	method: "GET",
}).handler(
	async (): Promise<{
		hasActiveSession: boolean;
		initialConversation: object;
		turnstileSiteKey: string;
	}> => {
		const session = await auth.api.getSession({
			headers: getRequest().headers,
		});
		const userId =
			typeof session?.user?.id === "string" ? session.user.id : null;
		const initialConversation = userId
			? ((await loadLatestConversationForUser(userId)) ??
				createEmptyConversationRecord())
			: createEmptyConversationRecord();

		return {
			hasActiveSession: Boolean(userId),
			initialConversation,
			turnstileSiteKey: env.TURNSTILE_SITE_KEY.trim(),
		};
	},
);

export const Route = createFileRoute("/")({
	loader: () => getSessionEntryConfig(),
	component: Home,
});

function WorkspacePageFallback() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
			Loading Ore AI...
		</main>
	);
}

type SessionEntryLoaderData = {
	hasActiveSession: boolean;
	initialConversation: ConversationRecord;
	turnstileSiteKey: string;
};

function Home() {
	const { hasActiveSession, initialConversation, turnstileSiteKey } =
		Route.useLoaderData() as SessionEntryLoaderData;

	return (
		<Suspense fallback={<WorkspacePageFallback />}>
			<AgentWorkspace
				hasActiveSession={hasActiveSession}
				initialConversation={initialConversation}
				turnstileSiteKey={turnstileSiteKey}
			/>
		</Suspense>
	);
}
