import { Streamdown } from "streamdown";
import { AssistantAvatar } from "./assistant-avatar";

type AssistantMessageRowProps = {
  text: string;
  isAnimating: boolean;
};

export const AssistantMessageRow = ({ text, isAnimating }: AssistantMessageRowProps) => (
  <div className="flex items-start gap-3">
    <AssistantAvatar />
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      {text ? (
        <div className="max-w-[92%] rounded-2xl border border-border/30 bg-card/80 px-4 py-3 text-sm leading-7 text-foreground shadow-sm backdrop-blur-sm">
          <Streamdown animated isAnimating={isAnimating}>
            {text}
          </Streamdown>
        </div>
      ) : null}
    </div>
  </div>
);
