export function getClientIpFromRequest(request: Request) {
  return request.headers.get("cf-connecting-ip");
}
