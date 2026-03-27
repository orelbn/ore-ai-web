"use client";

import { queryOptions } from "@tanstack/react-query";
import { parseChat } from "../schema/validation";

export const chatQueryOptions = queryOptions({
  queryKey: ["chat"] as const,
  queryFn: fetchChat,
  staleTime: 30_000,
});

async function fetchChat() {
  const response = await fetch("/api/chat", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load chat.");
  }

  return parseChat(await response.json());
}
