"use client";

import { useState } from "react";

type ConversationSubmissionInput = {
	sendMessage: (message: { text: string }) => Promise<void>;
	status: string;
};

export function useConversationSubmission({
	sendMessage,
	status,
}: ConversationSubmissionInput) {
	const [input, setInput] = useState("");

	async function sendPrompt(promptText: string) {
		setInput("");
		await sendMessage({ text: promptText });
	}

	async function handleSubmit() {
		const trimmedInput = input.trim();
		if (!trimmedInput || status === "submitted" || status === "streaming") {
			return;
		}

		await sendPrompt(trimmedInput);
	}

	return {
		handleSubmit,
		input,
		setInput,
	};
}
