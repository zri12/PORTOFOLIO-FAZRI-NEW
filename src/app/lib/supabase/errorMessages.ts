type SupabaseLikeError = {
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  message?: unknown;
  name?: unknown;
};

export function formatSupabaseError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (!error || typeof error !== "object") return fallback;

  const value = error as SupabaseLikeError;
  const message = typeof value.message === "string" ? value.message : "";
  const details = typeof value.details === "string" ? value.details : "";
  const hint = typeof value.hint === "string" ? value.hint : "";
  const code = typeof value.code === "string" ? value.code : "";
  const name = typeof value.name === "string" ? value.name : "";
  const parts = [message, details, hint, code && `Code: ${code}`, name && `Type: ${name}`].filter(Boolean);

  return parts.length ? parts.join(" ") : fallback;
}

export function formatAdminSaveError(error: unknown, fallback: string) {
  const message = formatSupabaseError(error, fallback);
  const lower = message.toLowerCase();

  if (lower.includes("row-level security") || lower.includes("permission denied") || lower.includes("violates row-level security")) {
    return `${message} Make sure the logged-in Supabase user exists in admin_users and is active.`;
  }

  if (lower.includes("jwt") || lower.includes("session") || lower.includes("not authenticated")) {
    return `${message} Please sign out, sign in again, then retry.`;
  }

  return message;
}
