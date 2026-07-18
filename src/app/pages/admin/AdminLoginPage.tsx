import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ChevronLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { AdminAuthContext } from "../../context/AdminAuthContext";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { isSupabaseEnabled } from "../../lib/supabase/client";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useContext(AdminAuthContext);
  const { mode } = useContext(ThemeModeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || "/admin/dashboard";

  const finishLogin = async (value: string, secret: string, rememberSession: boolean) => {
    setIsLoading(true);
    try {
      await login(value, secret, rememberSession);
      navigate(redirectTo, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)] p-6 font-inter">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(78,187,232,.12),transparent_45%)]" />
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl md:grid-cols-[.8fr_1.2fr]">
        <aside className="hidden border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-10 md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex h-16 w-16 items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
              <span className="font-manrope text-2xl font-bold text-[var(--color-accent-main)]">FL</span>
            </div>
            <h1 className="mt-10 font-manrope text-3xl font-bold">Portfolio CMS</h1>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">Portfolio content management with Supabase-backed authentication and storage-ready data.</p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[var(--color-text-muted)]">{mode} mode active</p>
        </aside>
        <section className="p-8 md:p-12">
          <h2 className="font-manrope text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Login with your admin username or internal admin email.</p>
          <form onSubmit={(event) => { event.preventDefault(); if (identifier && password) void finishLogin(identifier, password, remember); }} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Email or username</span>
              <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3 outline-none focus:border-[var(--color-accent-main)]" placeholder="Fazrilukman" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]">Password</span>
              <div className="flex border border-[var(--color-border)] bg-[var(--color-bg-primary)] focus-within:border-[var(--color-accent-main)]">
                <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none" placeholder="Password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </label>
            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                Remember me
              </label>
              <button type="button" className="text-sm text-[var(--color-accent-main)]" title="Visual placeholder only">Forgot password?</button>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button disabled={isLoading || !identifier || !password} className="w-full bg-[var(--color-text-main)] px-5 py-3 font-bold text-[var(--color-bg-primary)] disabled:opacity-50">{isLoading ? "Signing in..." : "Login"}</button>
            {!isSupabaseEnabled && <button type="button" onClick={() => void finishLogin("demo@fazri.dev", "demo", true)} disabled={isLoading} className="flex w-full items-center justify-center gap-2 border border-dashed border-[var(--color-accent-main)] px-5 py-3 font-bold text-[var(--color-accent-main)] disabled:opacity-50"><KeyRound size={18} /> Local Demo Access</button>}
          </form>
          <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"><ChevronLeft size={16} /> Back to Portfolio</Link>
        </section>
      </div>
    </main>
  );
}
