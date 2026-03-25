import { getDateLabel } from "../../utils/get-date-label";

type ConversationDateHeaderProps = {
	date: Date;
};

export function ConversationDateHeader({ date }: ConversationDateHeaderProps) {
	return (
		<div className="mb-6 flex items-center justify-center">
			<span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground/60 uppercase">
				{getDateLabel(date)}
			</span>
		</div>
	);
}
