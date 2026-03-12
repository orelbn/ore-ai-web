// Keep shared limits centralized for server code while workspace-specific UI
// values remain under `workspace/constants`.
export {
	CHAT_MAX_MESSAGE_CHARS,
	CHAT_CONTEXT_MAX_BYTES,
	CHAT_STORAGE_MAX_BYTES,
} from "../workspace/constants";

export const CHAT_MAX_BODY_BYTES = 256 * 1024;
export const CHAT_DEFAULT_TITLE = "New chat";
