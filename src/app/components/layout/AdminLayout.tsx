import { ReactNode, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, User, Image as ImageIcon, Briefcase, Code2, PenTool, Award, MessageSquare, Mail, Settings, LogOut, ExternalLink, Menu } from "lucide-react";
import { AdminAuthContext } from "../../context/AdminAuthContext";

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const signOut = () => {
    void logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex font-inter">
      {/* Sidebar Desktop */}
      <Sidebar signOut={signOut} className="hidden lg:flex" />
      {mobileOpen && <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)}><Sidebar signOut={signOut} className="h-full w-80" /></div>}

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/90 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-[var(--color-text-main)] w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center border border-[var(--color-border)]" aria-label="Open admin navigation">
              <Menu size={20} />
            </button>
            <h1 className="font-manrope font-bold text-xl lg:text-2xl text-[var(--color-text-main)] hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-6">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center">
                <User size={18} className="text-[var(--color-text-secondary)]" />
              </div>
              <div className="hidden md:block">
                <span className="text-sm font-bold text-[var(--color-text-main)] block">Fazri L.</span>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">System Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[var(--color-bg-primary)] p-6 lg:p-10 pb-32 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

const AdminNavLink = ({ to, icon: Icon, children }: { to: string, icon: any, children: ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/admin/dashboard" && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
        isActive 
          ? "bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/20 shadow-[inset_0_0_20px_rgba(78,187,232,0.05)]" 
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-main)] border border-transparent"
      }`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} /> 
      {children}
    </Link>
  );
};

function Sidebar({ signOut, className = "" }: { signOut: () => void; className?: string }) {
  return (
    <aside className={`w-72 border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex-col h-screen sticky top-0 ${className}`} onClick={(event) => event.stopPropagation()}>
      <div className="h-20 border-b border-[var(--color-border)] flex items-center px-8 gap-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-primary)] flex items-center justify-center border border-[var(--color-border)] shadow-sm">
          <span className="font-manrope font-bold text-lg text-[var(--color-accent-main)]">FL</span>
        </div>
        <div>
          <span className="font-manrope font-bold text-[var(--color-text-main)] block leading-tight">Admin System</span>
          <span className="text-[10px] text-[var(--color-text-muted)] tracking-widest font-mono uppercase">Portfolio CMS</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <p className="px-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 mt-4 first:mt-0">Core</p>
        <AdminNavLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</AdminNavLink>
        <AdminNavLink to="/admin/profile" icon={User}>Profile</AdminNavLink>
        <AdminNavLink to="/admin/hero" icon={User}>Hero</AdminNavLink>
        <p className="px-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 mt-6">Content</p>
        <AdminNavLink to="/admin/projects" icon={Briefcase}>Web Projects</AdminNavLink>
        <AdminNavLink to="/admin/tech-stack" icon={Code2}>Tech Stack</AdminNavLink>
        <AdminNavLink to="/admin/creative-works" icon={PenTool}>Creative Works</AdminNavLink>
        <AdminNavLink to="/admin/experience" icon={LayoutDashboard}>Experience</AdminNavLink>
        <AdminNavLink to="/admin/certificates" icon={Award}>Certificates</AdminNavLink>
        <p className="px-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 mt-6">Engagement</p>
        <AdminNavLink to="/admin/comments" icon={MessageSquare}>Comments</AdminNavLink>
        <AdminNavLink to="/admin/messages" icon={Mail}>Messages</AdminNavLink>
        <p className="px-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 mt-6">System</p>
        <AdminNavLink to="/admin/media" icon={ImageIcon}>Media Library</AdminNavLink>
        <AdminNavLink to="/admin/settings" icon={Settings}>Site Settings</AdminNavLink>
      </nav>
      <div className="p-4 border-t border-[var(--color-border)] flex flex-col gap-2">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-main)] transition-colors text-sm font-medium">
          <ExternalLink size={18} /> Preview Portfolio
        </a>
        <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium text-left w-full">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
