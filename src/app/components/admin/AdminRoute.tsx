import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AdminAuthContext } from "../../context/AdminAuthContext";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useContext(AdminAuthContext);
  const location = useLocation();
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] text-sm font-semibold text-[var(--color-text-secondary)]">Checking admin session...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
