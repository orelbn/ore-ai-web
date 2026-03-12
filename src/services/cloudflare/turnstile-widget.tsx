"use client";

import { useEffect, useRef } from "react";

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: HTMLElement,
				options: {
					sitekey: string;
					callback: (token: string) => void;
					"error-callback"?: () => void;
					"expired-callback"?: () => void;
					action?: string;
					appearance?: "always" | "execute" | "interaction-only";
					theme?: "light" | "dark" | "auto";
				},
			) => string;
			remove: (widgetId: string) => void;
		};
	}
}

type TurnstileWidgetProps = {
	siteKey: string;
	action?: string;
	appearance?: "always" | "execute" | "interaction-only";
	onToken: (token: string) => void;
	onError: () => void;
	onExpired?: () => void;
};

export function TurnstileWidget({
	siteKey,
	action,
	appearance = "interaction-only",
	onToken,
	onError,
	onExpired,
}: TurnstileWidgetProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		function renderWidget() {
			if (
				cancelled ||
				!containerRef.current ||
				widgetIdRef.current ||
				!window.turnstile
			) {
				return;
			}

			widgetIdRef.current = window.turnstile.render(containerRef.current, {
				sitekey: siteKey,
				action,
				appearance,
				theme: "light",
				callback: (token) => {
					onToken(token);
				},
				"error-callback": onError,
				"expired-callback": () => {
					onExpired?.();
				},
			});
		}

		renderWidget();
		const intervalId = window.setInterval(renderWidget, 150);

		return () => {
			cancelled = true;
			window.clearInterval(intervalId);
			if (widgetIdRef.current && window.turnstile) {
				window.turnstile.remove(widgetIdRef.current);
			}
			widgetIdRef.current = null;
		};
	}, [action, appearance, onError, onExpired, onToken, siteKey]);

	return <div ref={containerRef} />;
}
