import { Streamdown } from "streamdown";

type UserMessageRowProps = {
  text: string;
};

export const UserMessageRow = ({ text }: UserMessageRowProps) => (
  <div className="flex justify-end">
    <div className="max-w-[78%] rounded-2xl bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
      <Streamdown>{text}</Streamdown>
    </div>
  </div>
);
