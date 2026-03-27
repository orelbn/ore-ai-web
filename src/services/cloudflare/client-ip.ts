export function getClientIpFromRequest(request: Request) {
  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xForwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return xForwardedFor || null;
}
