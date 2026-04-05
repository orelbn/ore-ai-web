"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { chatQueryOptions } from "@/modules/chat";
import { Conversation } from "@/modules/conversation";

export function App() {
  const { data } = useSuspenseQuery(chatQueryOptions);

  return <Conversation messages={data.messages} sessionId={data.sessionId} />;
}
