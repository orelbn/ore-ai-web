import { CHAT_USER_QUOTA_EXCEEDED_MESSAGE } from "../../constants";

const CHAT_USER_QUOTA_KEY_PREFIX = "user";

export class UserChatQuotaExceededError extends Error {
	readonly status = 429;

	constructor(readonly userId: string) {
		super(CHAT_USER_QUOTA_EXCEEDED_MESSAGE);
		this.name = "UserChatQuotaExceededError";
	}
}

export async function enforceUserChatQuota(
	rateLimit: RateLimit,
	userId: string,
) {
	const outcome = await rateLimit.limit({
		key: `${CHAT_USER_QUOTA_KEY_PREFIX}:${userId}`,
	});

	if (!outcome.success) {
		throw new UserChatQuotaExceededError(userId);
	}
}

export function buildUserChatQuotaExceededResponse() {
	return new Response(CHAT_USER_QUOTA_EXCEEDED_MESSAGE, {
		status: 429,
		headers: {
			"content-type": "text/plain; charset=utf-8",
		},
	});
}
