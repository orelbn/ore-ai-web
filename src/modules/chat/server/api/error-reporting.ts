import {
	classifyErrorForLogging,
	type LogRuntimeMode,
} from "@/lib/logging/error-classification";
import { getCloudflareRequestMetadata } from "@/services/cloudflare";

export function reportChatRouteError({
	request,
	requestId,
	route,
	stage,
	error,
	userId,
	chatId,
	mode,
}: {
	request: Request;
	requestId: string;
	route: string;
	stage: string;
	error: unknown;
	userId?: string | null;
	chatId?: string | null;
	mode?: LogRuntimeMode;
}) {
	const metadata = getCloudflareRequestMetadata(request);
	const errorDetails = classifyErrorForLogging(error, {
		request,
		mode,
	});

	console.error(
		JSON.stringify({
			scope: "chat_api",
			level: "error",
			route,
			stage,
			requestId,
			userId: userId ?? null,
			chatId: chatId ?? null,
			cfRay: metadata.cfRay,
			cfColo: metadata.cfColo,
			cfCountry: metadata.cfCountry,
			...errorDetails,
		}),
	);
}
