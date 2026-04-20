const enc = new TextEncoder();

export async function signValue(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return new Uint8Array(sig);
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
