export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = {
	[key: string]: JsonValue | undefined;
};

export function toJsonValue(value: unknown): JsonValue | undefined {
	if (value === null) {
		return null;
	}

	switch (typeof value) {
		case "string":
		case "number":
		case "boolean":
			return value;
		case "object":
			if (Array.isArray(value)) {
				return value.flatMap((item) => {
					const jsonItem = toJsonValue(item);
					return jsonItem === undefined ? [] : [jsonItem];
				});
			}

			return Object.fromEntries(
				Object.entries(value).flatMap(([key, entryValue]) => {
					const jsonEntryValue = toJsonValue(entryValue);
					return jsonEntryValue === undefined ? [] : [[key, jsonEntryValue]];
				}),
			);
		default:
			return undefined;
	}
}
