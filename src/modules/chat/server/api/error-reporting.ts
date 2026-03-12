import {
	classifyErrorForLogging,
	type LogRuntimeMode,
} from "@/lib/logging/error-classification";
import { getCloudflareRequestMetadata } from "@/services/cloudflare";

export function reportChatRouteError(input: {
	request: Request;
	requestId: string;
	route: string;
	stage: string;
	error: unknown;
	userId?: string | null;
	chatId?: string | null;
	mode?: LogRuntimeMode;
}) {
	const metadata = getCloudflareRequestMetadata(input.request);
	const errorDetails = classifyErrorForLogging(input.error, {
		request: input.request,
		mode: input.mode,
	});

	console.error(
		JSON.stringify({
			scope: "chat_api",
			level: "error",
			route: input.route,
			stage: input.stage,
			requestId: input.requestId,
			userId: input.userId ?? null,
			chatId: input.chatId ?? null,
			cfRay: metadata.cfRay,
			cfColo: metadata.cfColo,
			cfCountry: metadata.cfCountry,
			...errorDetails,
		}),
	);
}
