import { isSupabaseEnabled } from "../lib/supabase/client";
import { supabaseAuthRepository } from "./supabaseAuthRepository";

const AUTH_KEY = "fazri-admin-session";

export interface AdminSession {
  name: string;
  email: string;
  createdAt: string;
}

export const authRepository = {
  getLocalSession(): AdminSession | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(AUTH_KEY) || window.sessionStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminSession;
    } catch {
      return null;
    }
  },
  getSession(): AdminSession | null {
    if (isSupabaseEnabled) return null;
    return authRepository.getLocalSession();
  },
  async restoreSession(): Promise<AdminSession | null> {
    if (isSupabaseEnabled) return supabaseAuthRepository.getSession();
    return authRepository.getLocalSession();
  },
  loginLocal(identifier: string, remember: boolean) {
    const session: AdminSession = {
      name: "Fazri L.",
      email: identifier.includes("@") ? identifier : "admin@fazri.dev",
      createdAt: new Date().toISOString(),
    };
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem(AUTH_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("admin-auth-change"));
    return session;
  },
  async login(identifier: string, password: string, remember: boolean) {
    if (isSupabaseEnabled) return supabaseAuthRepository.login(identifier, password);
    return authRepository.loginLocal(identifier, remember);
  },
  async logout() {
    if (isSupabaseEnabled) {
      await supabaseAuthRepository.logout();
      return;
    }
    window.localStorage.removeItem(AUTH_KEY);
    window.sessionStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event("admin-auth-change"));
  },
  onAuthChange(callback: () => void) {
    if (isSupabaseEnabled) return supabaseAuthRepository.onAuthChange(callback);
    return () => {};
  },
};
