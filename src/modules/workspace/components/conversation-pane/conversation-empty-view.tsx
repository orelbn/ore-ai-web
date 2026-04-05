import type { ReactNode } from "react";
import { ConversationEmptyState } from "../conversation-empty-state";
import { ConversationFeatureCards } from "./feature-cards";

type ConversationEmptyViewProps = {
  composer: ReactNode;
  onPromptSelect: (prompt: string) => void;
};

export function ConversationEmptyView({ composer, onPromptSelect }: ConversationEmptyViewProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-5 pb-6 sm:px-6 sm:pt-12 sm:pb-10">
        <ConversationEmptyState />
        <div className="flex flex-col">
          <div className="order-2 mt-6 sm:order-1 sm:mt-0">{composer}</div>
          <div className="order-1 sm:order-2">
            <ConversationFeatureCards onPromptSelect={onPromptSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}
