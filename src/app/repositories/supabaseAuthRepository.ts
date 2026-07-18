import { getSupabaseClient, isSupabaseEnabled } from "../lib/supabase/client";

export interface AdminSession {
  name: string;
  email: string;
  createdAt: string;
}

export const ADMIN_AUTH_CHANGE_EVENT = "admin-auth-change";

function normalizeIdentifier(identifier: string) {
  const value = identifier.trim();
  if (value.includes("@")) return value.toLowerCase();
  const configuredUsername = (import.meta.env.VITE_ADMIN_USERNAME || "Fazrilukman").trim().toLowerCase();
  const configuredEmail = (import.meta.env.VITE_ADMIN_AUTH_EMAIL || "fajrilukman194@gmail.com").trim().toLowerCase();
  if (value.toLowerCase() === configuredUsername && configuredEmail.includes("@")) return configuredEmail;
  const domain = import.meta.env.VITE_ADMIN_AUTH_DOMAIN || "portfolio-admin.example";
  return `${value.toLowerCase()}@${domain}`;
}

function emitChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
}

function configuredAdminEmail() {
  return (import.meta.env.VITE_ADMIN_AUTH_EMAIL || "fajrilukman194@gmail.com").trim().toLowerCase();
}

function isPermissionError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const value = error as { code?: string; message?: string };
  return value.code === "42501" || value.message?.toLowerCase().includes("permission denied");
}

function sessionFromUser(user: { email?: string | null; created_at?: string; user_metadata?: Record<string, unknown> }, displayName?: string): AdminSession {
  return {
    name: displayName || String(user.user_metadata?.display_name || "Fazri L."),
    email: user.email || configuredAdminEmail(),
    createdAt: user.created_at || new Date().toISOString(),
  };
}

function isConfiguredAdminUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const role = String(user.user_metadata?.role || "").toLowerCase();
  const username = String(user.user_metadata?.username || "").toLowerCase();
  return user.email?.toLowerCase() === configuredAdminEmail() || role === "owner" || role === "admin" || username === "fazrilukman";
}

export const supabaseAuthRepository = {
  async getSession(): Promise<AdminSession | null> {
    if (!isSupabaseEnabled) return null;
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session?.user?.email) return null;
    const { data: admin, error: adminError } = await supabase.from("admin_users").select("display_name, active").eq("user_id", session.user.id).maybeSingle();
    if (adminError && isPermissionError(adminError) && isConfiguredAdminUser(session.user)) return sessionFromUser(session.user);
    if (adminError) {
      await supabase.auth.signOut();
      return null;
    }
    if (admin && admin.active === false) {
      await supabase.auth.signOut();
      return null;
    }
    return sessionFromUser(session.user, typeof admin?.display_name === "string" ? admin.display_name : undefined);
  },
  async login(identifier: string, password: string): Promise<AdminSession> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const email = normalizeIdentifier(identifier);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user?.email) throw error || new Error("Login failed.");
    const { data: admin, error: adminError } = await supabase.from("admin_users").select("display_name, active").eq("user_id", data.user.id).maybeSingle();
    if (adminError && !(isPermissionError(adminError) && isConfiguredAdminUser(data.user))) throw adminError;
    if (!admin?.active) {
      if (!isConfiguredAdminUser(data.user)) {
        await supabase.auth.signOut();
        throw new Error("This account is not an active portfolio admin.");
      }
    }
    await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("user_id", data.user.id);
    const session = sessionFromUser(data.user, typeof admin?.display_name === "string" ? admin.display_name : undefined);
    emitChange();
    return session;
  },
  async logout() {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    emitChange();
  },
  onAuthChange(callback: () => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange(() => callback());
    return () => data.subscription.unsubscribe();
  },
};
