import { corsHeadersFor } from "./cors.ts";

export function jsonResponse(body: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400, req?: Request) {
  return jsonResponse({ error: message }, status, req);
}
