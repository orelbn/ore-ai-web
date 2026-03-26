"use client";

import { Suspense, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { App } from "@/components/app";
import { chatQueryOptions } from "@/modules/chat";
import { VerificationGate } from "@/modules/verification";
import { WorkspacePageFallback } from "@/modules/workspace";

type IndexPageProps = {
	turnstileSiteKey: string;
};

export function IndexPage({ turnstileSiteKey }: IndexPageProps) {
	const queryClient = useQueryClient();
	const [hasAppAccess, setHasAppAccess] = useState(false);

	async function handleAccessGranted() {
		await queryClient.prefetchQuery(chatQueryOptions);
		setHasAppAccess(true);
	}

	if (!hasAppAccess) {
		return (
			<VerificationGate
				onAccessGranted={handleAccessGranted}
				turnstileSiteKey={turnstileSiteKey}
			/>
		);
	}

	return (
		<Suspense fallback={<WorkspacePageFallback />}>
			<App />
		</Suspense>
	);
}
