const allowedOrigins = new Set([
  "https://fazrilukman.id",
  "https://www.fazrilukman.id",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

export const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};

export function corsHeadersFor(req?: Request) {
  const origin = req?.headers.get("origin") || "";
  return origin && allowedOrigins.has(origin) ? { ...corsHeaders, "Access-Control-Allow-Origin": origin } : corsHeaders;
}

export function handleCors(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeadersFor(req) });
  return null;
}
