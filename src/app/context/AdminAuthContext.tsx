import { createContext, useCallback, useEffect, useState, ReactNode } from "react";
import { authRepository, type AdminSession } from "../repositories/authRepository";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session: AdminSession | null;
  login: (identifier: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  error: null,
  session: null,
  login: async () => {},
  logout: async () => {},
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AdminSession | null>(() => authRepository.getSession());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      void authRepository.restoreSession().then((nextSession) => {
        if (mounted) {
          setSession(nextSession);
          setIsLoading(false);
        }
      }).catch(() => {
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
      });
    };
    sync();
    const unsubscribe = authRepository.onAuthChange(sync);
    window.addEventListener("admin-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener("admin-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string, remember = true) => {
    setIsLoading(true);
    setError(null);
    try {
      const nextSession = await authRepository.login(identifier, password, remember);
      setSession(nextSession);
    } catch (loginError) {
      setSession(null);
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authRepository.logout();
    setSession(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated: Boolean(session), isLoading, error, session, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
