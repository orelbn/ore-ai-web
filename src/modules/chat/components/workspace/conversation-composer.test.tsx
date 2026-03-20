import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { ConversationComposer } from "./conversation-composer";

describe("ConversationComposer", () => {
	test("should render a locked composer when verification has not completed", () => {
		const html = renderToStaticMarkup(
			<ConversationComposer
				input=""
				onInputChange={() => {}}
				onSubmit={async () => {}}
				status="ready"
				onStop={() => {}}
				canSubmit={false}
				showQuickPrompts
				quickPrompts={["One prompt"]}
				placeholder="Complete verification to unlock chat"
			/>,
		);

		expect(html).toContain(
			'placeholder="Complete verification to unlock chat"',
		);
		expect(html).toContain("<textarea");
		expect(html).toContain("disabled");
	});
});
