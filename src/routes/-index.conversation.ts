import { safeValidateUIMessages } from "ai";
import { useQuery } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
	createEmptyConversation,
	type ConversationMessage,
	type ConversationRecord,
} from "@/modules/chat";
import { loadLatestConversation } from "@/modules/chat/server";
import { getActiveSessionUserId } from "@/modules/session";

export const homeConversationQueryKey = ["home-conversation"] as const;

const getHomeConversation = createServerFn({
	method: "GET",
}).handler(async () => {
	const userId = await getActiveSessionUserId(getRequest().headers);
	return JSON.stringify(await loadLatestConversation(userId));
});

export function useIndexConversation(enabled: boolean) {
	const loadConversation = useServerFn(getHomeConversation);

	return useQuery({
		queryKey: homeConversationQueryKey,
		enabled,
		queryFn: async () => readConversationRecord(await loadConversation()),
	});
}

async function readConversationRecord(
	serializedConversation: string,
): Promise<ConversationRecord> {
	try {
		const parsed = JSON.parse(serializedConversation);
		if (typeof parsed !== "object" || parsed === null) {
			return createEmptyConversation();
		}

		const conversationId = Reflect.get(parsed, "conversationId");
		if (typeof conversationId !== "string") {
			return createEmptyConversation();
		}

		const validatedMessages = await safeValidateUIMessages<ConversationMessage>(
			{
				messages: Reflect.get(parsed, "messages"),
			},
		);

		return {
			conversationId,
			messages: validatedMessages.success ? validatedMessages.data : [],
		};
	} catch {
		return createEmptyConversation();
	}
}
