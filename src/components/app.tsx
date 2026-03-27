"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { chatQueryOptions } from "@/modules/chat";
import { AgentWorkspace } from "@/modules/workspace";

export function App() {
  const { data } = useSuspenseQuery(chatQueryOptions);

  return <AgentWorkspace messages={data.messages} sessionId={data.sessionId} />;
}
