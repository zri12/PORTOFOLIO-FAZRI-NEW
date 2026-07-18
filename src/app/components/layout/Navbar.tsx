import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Moon, Zap, BriefcaseBusiness, Menu, X, ArrowRight } from "lucide-react";
import { ThemeModeContext } from "../../context/ThemeModeContext";
import { useLanguage } from "../../context/LanguageContext";
import { AnimatePresence, motion } from "motion/react";

export const Navbar = () => {
  const { mode, toggleMode } = useContext(ThemeModeContext);
  const { language, toggleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t("Home"), path: "/" },
    { label: t("About"), path: "/about" },
    { label: t("Projects"), path: "/projects" },
    { label: t("Creative Works"), path: "/creative-works" },
    { label: t("Certificates"), path: "/certificates" },
    { label: t("Contact"), path: "/contact" },
  ];

  return (
    <nav className={`portfolio-nav fixed top-0 w-full z-50 transition-all duration-500 border-b ${mode === "spider" ? "spider-nav" : ""} ${scrolled ? "bg-[var(--color-bg-secondary)]/80 backdrop-blur-md border-[var(--color-border)] py-4" : "bg-transparent border-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-elevated)] flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-accent-main)] transition-colors">
            <span className="font-manrope font-bold text-lg text-[var(--color-accent-main)]">FL</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-manrope font-bold tracking-wide leading-none text-[var(--color-text-main)]">FAZRI</span>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest mt-1">/ DEV</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`text-sm font-medium transition-colors ${location.pathname === link.path ? "text-[var(--color-accent-main)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleMode} className={`mode-switch hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[var(--color-border)] transition-all text-sm font-medium ${mode === "spider" ? "mode-switch-spider" : "rounded-lg hover:bg-[var(--color-surface-elevated)]"}`}>
            {mode === "professional" ? <Moon size={14} className="text-[var(--color-accent-main)]" /> : <Zap size={14} className="text-[var(--color-accent-main)]" />}
            <span className="text-[var(--color-text-secondary)]">{mode === "professional" ? t("Pro Mode") : t("Spider Mode")}</span>
          </button>

          <button onClick={toggleLanguage} className="hidden min-h-9 items-center gap-1 border border-[var(--color-border)] p-1 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent-main)]/50 sm:flex" aria-label="Switch language">
            <span className={`px-2 py-1 transition ${language === "en" ? "bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : "text-[var(--color-text-muted)]"}`}>EN</span>
            <span className={`px-2 py-1 transition ${language === "id" ? "bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : "text-[var(--color-text-muted)]"}`}>IND</span>
          </button>
          
          <Link to="/contact" className="hidden sm:flex items-center justify-center px-5 py-2 rounded-lg bg-[var(--color-text-main)] text-[var(--color-bg-primary)] font-medium text-sm hover:opacity-90 transition-opacity">
            {t("Contact Me")}
          </Link>
          
          <Link to="/admin/login" className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors" title="Admin Login">
            <BriefcaseBusiness size={16} />
          </Link>

          <button className="lg:hidden text-[var(--color-text-main)]" onClick={() => setIsOpen(!isOpen)}>
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
            className="lg:hidden bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={`font-medium ${location.pathname === link.path ? "text-[var(--color-accent-main)]" : "text-[var(--color-text-main)]"}`}>
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[var(--color-border)] pt-4 mt-2 flex justify-between items-center">
                <button onClick={() => { toggleMode(); setIsOpen(false); }} className="flex items-center gap-2 py-2 text-sm font-medium text-[var(--color-accent-main)]">
                  {mode === "professional" ? <Zap size={16} /> : <Moon size={16} />}
                  {mode === "professional" ? t("Switch to Spider Mode") : t("Switch to Pro Mode")}
                </button>
                <button onClick={() => { toggleLanguage(); setIsOpen(false); }} className="flex items-center gap-1 border border-[var(--color-border)] p-1 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--color-text-muted)]">
                  <span className={`px-2 py-1 ${language === "en" ? "bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : ""}`}>EN</span>
                  <span className={`px-2 py-1 ${language === "id" ? "bg-[var(--color-accent-main)] text-[var(--color-bg-primary)]" : ""}`}>IND</span>
                </button>
                <Link to="/admin/login" onClick={() => setIsOpen(false)} className="text-[var(--color-text-muted)]">
                  <BriefcaseBusiness size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
