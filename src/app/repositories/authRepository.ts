import { isSupabaseEnabled } from "../lib/supabase/client";
import { supabaseAuthRepository } from "./supabaseAuthRepository";

const DEV_MOCK_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_ADMIN_MOCK === "true";

export interface AdminSession {
  name: string;
  email: string;
  createdAt: string;
}

export const authRepository = {
  getSession(): AdminSession | null {
    return null;
  },
  async restoreSession(): Promise<AdminSession | null> {
    if (!isSupabaseEnabled) return null;
    return supabaseAuthRepository.getSession();
  },
  async login(identifier: string, password: string, _remember: boolean) {
    void _remember;
    if (!isSupabaseEnabled) {
      throw new Error(DEV_MOCK_ENABLED ? "Development admin mock is not implemented." : "Supabase authentication is not configured.");
    }
    return supabaseAuthRepository.login(identifier, password);
  },
  async logout() {
    if (isSupabaseEnabled) await supabaseAuthRepository.logout();
  },
  onAuthChange(callback: () => void) {
    return isSupabaseEnabled ? supabaseAuthRepository.onAuthChange(callback) : () => {};
  },
};
