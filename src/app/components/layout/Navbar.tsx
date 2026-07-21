import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Moon, Zap, Menu, X } from "lucide-react";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { useLanguage } from "../../context/LanguageContext";
import { AnimatePresence, motion } from "motion/react";
import { BrandMark } from "../common/BrandMark";

export const Navbar = () => {
  const { mode, toggleMode } = useContext(ThemeModeContext);
  const { language, toggleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        frame = 0;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: t("Home"), path: "/" },
    { label: t("About"), path: "/about" },
    { label: t("Projects"), path: "/projects" },
    { label: t("Creative Works"), path: "/creative-works" },
    { label: t("Certificates"), path: "/certificates" },
    { label: t("Blog"), path: "/blog" },
    { label: t("Contact"), path: "/contact" },
  ];

  return (
    <nav className={`portfolio-nav fixed top-0 z-50 w-full border-b transition-all duration-500 ${mode === "spider" ? "spider-nav" : ""} ${scrolled || isOpen ? "border-[var(--color-border)] bg-[var(--color-bg-secondary)]/92 py-3 backdrop-blur-md sm:py-4" : "border-transparent bg-transparent py-4 sm:py-6"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <BrandMark className="h-10 w-10 rounded-xl transition-colors group-hover:border-[var(--color-accent-main)] [&_span]:text-lg" />
          <div className="hidden sm:flex flex-col">
            <span className="font-manrope font-bold tracking-wide leading-none text-[var(--color-text-main)]">FAZRI</span>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest mt-1">/ DEV</span>
          </div>
        </Link>

        <div className="hidden xl:flex items-center gap-6 2xl:gap-8">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`text-sm font-medium transition-colors ${location.pathname === link.path ? "text-[var(--color-accent-main)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
          <button onClick={toggleMode} className={`mode-switch hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[var(--color-border)] transition-all text-sm font-medium ${mode === "spider" ? "mode-switch-spider" : "rounded-lg hover:bg-[var(--color-surface-elevated)]"}`}>
            {mode === "professional" ? <Zap size={14} className="text-[var(--color-accent-main)]" /> : <Moon size={14} className="text-[var(--color-accent-main)]" />}
            <span className="text-[var(--color-text-secondary)]">{mode === "professional" ? t("Spider Mode") : t("Pro Mode")}</span>
          </button>

          <button onClick={toggleLanguage} className="hidden min-h-9 items-center gap-1 border border-[var(--color-border)] p-1 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent-main)]/50 sm:flex" aria-label="Switch language">
            <span className={`px-2 py-1 transition ${language === "en" ? "bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : "text-[var(--color-text-muted)]"}`}>EN</span>
            <span className={`px-2 py-1 transition ${language === "id" ? "bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : "text-[var(--color-text-muted)]"}`}>IND</span>
          </button>
          
          <Link to="/contact" className="hidden items-center justify-center rounded-lg bg-[var(--color-text-main)] px-5 py-2 text-sm font-medium text-[var(--color-bg-primary)] transition-opacity hover:opacity-90 xl:flex">
            {t("Contact Me")}
          </Link>
          <button className="flex h-10 w-10 items-center justify-center text-[var(--color-text-main)] xl:hidden" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? "Close navigation" : "Open navigation"} aria-expanded={isOpen}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] overflow-hidden"
          >
            <div className="flex max-h-[calc(100svh-72px)] flex-col gap-1 overflow-y-auto px-5 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={`border-b border-[var(--color-border)] py-3 font-medium ${location.pathname === link.path ? "text-[var(--color-accent-main)]" : "text-[var(--color-text-main)]"}`}>
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pt-3">
                <button onClick={() => { toggleMode(); setIsOpen(false); }} className="flex items-center gap-2 py-2 text-sm font-medium text-[var(--color-accent-main)]">
                  {mode === "professional" ? <Zap size={16} /> : <Moon size={16} />}
                  {mode === "professional" ? t("Switch to Spider Mode") : t("Switch to Pro Mode")}
                </button>
                <button onClick={() => { toggleLanguage(); setIsOpen(false); }} className="flex items-center gap-1 border border-[var(--color-border)] p-1 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--color-text-muted)]">
                  <span className={`px-2 py-1 ${language === "en" ? "bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : ""}`}>EN</span>
                  <span className={`px-2 py-1 ${language === "id" ? "bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : ""}`}>IND</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
