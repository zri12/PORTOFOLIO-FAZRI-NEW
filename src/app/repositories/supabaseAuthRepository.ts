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
  const domain = import.meta.env.VITE_ADMIN_AUTH_DOMAIN || "portfolio-admin.example";
  return `${value.toLowerCase()}@${domain}`;
}

function emitChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
}

export const supabaseAuthRepository = {
  async getSession(): Promise<AdminSession | null> {
    if (!isSupabaseEnabled) return null;
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session?.user?.email) return null;
    const { data: admin } = await supabase.from("admin_users").select("display_name, active").eq("user_id", session.user.id).maybeSingle();
    if (admin && admin.active === false) {
      await supabase.auth.signOut();
      return null;
    }
    return {
      name: typeof admin?.display_name === "string" ? admin.display_name : session.user.user_metadata?.display_name || "Fazri L.",
      email: session.user.email,
      createdAt: session.user.created_at || new Date().toISOString(),
    };
  },
  async login(identifier: string, password: string): Promise<AdminSession> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const email = normalizeIdentifier(identifier);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user?.email) throw error || new Error("Login failed.");
    const { data: admin, error: adminError } = await supabase.from("admin_users").select("display_name, active").eq("user_id", data.user.id).maybeSingle();
    if (adminError) throw adminError;
    if (!admin?.active) {
      await supabase.auth.signOut();
      throw new Error("This account is not an active portfolio admin.");
    }
    await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("user_id", data.user.id);
    const session = {
      name: typeof admin.display_name === "string" ? admin.display_name : data.user.user_metadata?.display_name || "Fazri L.",
      email: data.user.email,
      createdAt: data.user.created_at || new Date().toISOString(),
    };
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
