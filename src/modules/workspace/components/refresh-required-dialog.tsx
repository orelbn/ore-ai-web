"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type RefreshRequiredDialogProps = {
	isOpen: boolean;
	onRefresh: () => void;
};

export function RefreshRequiredDialog({
	isOpen,
	onRefresh,
}: RefreshRequiredDialogProps) {
	return (
		<Dialog open={isOpen}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Refresh required</DialogTitle>
					<DialogDescription>
						We couldn’t continue this request. Refresh to try again.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={onRefresh}>Refresh</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
