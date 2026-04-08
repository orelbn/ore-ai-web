"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MessageSender = "assistant" | "user";

const messageAlignments: Record<MessageSender, string> = {
  assistant: "justify-start",
  user: "justify-end",
};

const bubbleTones: Record<MessageSender, string> = {
  assistant: "rounded-2xl border border-border bg-card text-card-foreground",
  user: "rounded-2xl bg-primary text-primary-foreground",
};

type MessageProps = HTMLAttributes<HTMLDivElement> & {
  bubbleClassName?: string;
  footer?: ReactNode;
  sender?: MessageSender;
};

function Message({
  bubbleClassName,
  footer,
  children,
  className,
  sender = "assistant",
  ...props
}: MessageProps) {
  return (
    <div
      className={cn("flex w-full mt-4 first:mt-0", messageAlignments[sender], className)}
      data-sender={sender}
      {...props}
    >
      <div
        className={cn(
          "inline-flex max-w-[78%] flex-col gap-1 px-4 py-2.5 text-sm",
          bubbleTones[sender],
          bubbleClassName,
        )}
      >
        <div className="min-w-0">{children}</div>
        {footer ? <div className="flex justify-end">{footer}</div> : null}
      </div>
    </div>
  );
}

export { Message };
