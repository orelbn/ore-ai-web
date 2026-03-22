import { useQuery } from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
	parseConversationRecord,
	serializeConversationRecord,
} from "@/modules/chat";
import { loadLatestConversation } from "@/modules/chat/server";
import { getActiveSessionUserId } from "@/modules/session";

export const homeConversationQueryKey: readonly ["home-conversation"] = [
	"home-conversation",
];

const getHomeConversation = createServerFn({
	method: "GET",
}).handler(async () => {
	const userId = await getActiveSessionUserId(getRequest().headers);
	return serializeConversationRecord(await loadLatestConversation(userId));
});

export function useIndexConversation(enabled: boolean) {
	const loadConversation = useServerFn(getHomeConversation);

	return useQuery({
		queryKey: homeConversationQueryKey,
		enabled,
		queryFn: async () => parseConversationRecord(await loadConversation()),
	});
}
