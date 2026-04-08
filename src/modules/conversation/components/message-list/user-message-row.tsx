import { Streamdown } from "streamdown";
import { Message } from "@/components/message";

type UserMessageRowProps = {
  text: string;
  timestamp: string | null;
};

export const UserMessageRow = ({ text, timestamp }: UserMessageRowProps) => (
  <Message
    bubbleClassName="py-2.5 leading-relaxed"
    footer={
      timestamp ? <span className="pl-4 text-[11px] text-foreground/55">{timestamp}</span> : null
    }
    sender="user"
  >
    <Streamdown>{text}</Streamdown>
  </Message>
);
