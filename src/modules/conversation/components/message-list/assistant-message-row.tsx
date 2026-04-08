import { Streamdown } from "streamdown";
import { Message } from "@/components/message";

type AssistantMessageRowProps = {
  text: string;
  isAnimating: boolean;
  timestamp: string | null;
};

export const AssistantMessageRow = ({ text, timestamp, isAnimating }: AssistantMessageRowProps) => (
  <Message
    bubbleClassName="min-w-0 leading-7"
    footer={
      timestamp || isAnimating ? (
        <div className="flex items-center gap-1.5 pl-4 text-[11px] text-muted-foreground/75">
          {isAnimating ? <span className="tracking-[0.35em]">...</span> : null}
          {timestamp ? <span>{timestamp}</span> : null}
        </div>
      ) : null
    }
    sender="assistant"
  >
    {text ? (
      <Streamdown animated isAnimating={isAnimating}>
        {text}
      </Streamdown>
    ) : null}
  </Message>
);
