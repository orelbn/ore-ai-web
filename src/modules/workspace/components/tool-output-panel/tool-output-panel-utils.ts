function isRecordValue(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function getRecordEntries(value: unknown): Array<[string, unknown]> {
  if (!isRecordValue(value)) {
    return [];
  }

  return Object.entries(value);
}

export function getRecordValue(value: unknown): Record<string, unknown> | null {
  if (!isRecordValue(value)) {
    return null;
  }

  return value;
}
