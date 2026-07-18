import { Link } from "react-router";
import { Home, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-primary)] p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent-main)]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 text-center flex flex-col items-center">
        <SearchX size={64} className="text-[var(--color-text-muted)] mb-8" strokeWidth={1} />
        <h1 className="text-8xl lg:text-[120px] font-manrope font-extrabold text-[var(--color-text-main)] leading-none tracking-tighter mb-4">404</h1>
        <h2 className="text-2xl lg:text-3xl font-manrope font-bold text-[var(--color-text-secondary)] mb-6">Page Not Found</h2>
        <p className="text-[var(--color-text-muted)] max-w-md mb-10 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Check the URL or return to the homepage.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-text-main)] text-[var(--color-bg-primary)] rounded-xl font-bold hover:opacity-90 transition-opacity">
          <Home size={18} /> Return to Home
        </Link>
      </div>
    </main>
  );
}
