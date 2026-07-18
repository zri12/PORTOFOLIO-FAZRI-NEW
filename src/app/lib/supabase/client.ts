import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const enableSupabase = import.meta.env.VITE_ENABLE_SUPABASE === "true";

export const isSupabaseEnabled = Boolean(enableSupabase && supabaseUrl && supabaseKey);

export const publicBucket = import.meta.env.VITE_SUPABASE_PUBLIC_BUCKET || "portfolio-public";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (!isSupabaseEnabled) return null;
  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: { eventsPerSecond: 3 },
      },
    });
  }
  return browserClient;
}

export function requireSupabaseClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
  return client;
}
