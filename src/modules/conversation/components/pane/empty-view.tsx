import type { ReactNode } from "react";
import { EmptyState } from "../empty-state";
import { FeatureCards } from "./feature-cards";

type EmptyViewProps = {
  composer: ReactNode;
  onPromptSelect: (prompt: string) => void;
};

export function EmptyView({ composer, onPromptSelect }: EmptyViewProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-5 pb-6 sm:px-6 sm:pt-12 sm:pb-10">
        <EmptyState />
        <div className="flex flex-col">
          <div className="order-2 mt-6 sm:order-1 sm:mt-0">{composer}</div>
          <div className="order-1 sm:order-2">
            <FeatureCards onPromptSelect={onPromptSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}
