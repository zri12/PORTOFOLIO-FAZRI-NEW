import type { ReactNode } from "react";
import { createContext, useState, useEffect, useRef } from "react";
import { usePortfolioData } from "../hooks/usePortfolioData";

type Mode = "professional" | "spider";

interface ThemeContextType {
  mode: Mode;
  toggleMode: () => void;
}

export const ThemeModeContext = createContext<ThemeContextType>({
  mode: "professional",
  toggleMode: () => {},
});

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = usePortfolioData();
  const hasUserPreference = useRef(typeof window !== "undefined" && Boolean(window.localStorage.getItem("portfolio-mode")));
  const [mode, setMode] = useState<Mode>(() => {
    const saved = window.localStorage.getItem("portfolio-mode");
    return (saved as Mode) || "professional";
  });

  useEffect(() => {
    if (!hasUserPreference.current) setMode(settings.defaultMode);
  }, [settings.defaultMode]);

  useEffect(() => {
    if (hasUserPreference.current) window.localStorage.setItem("portfolio-mode", mode);
    let enteringTimer: number | undefined;

    if (mode === "spider") {
      document.documentElement.classList.add("spider-mode");
      document.documentElement.classList.add("spider-mode-entering");
      enteringTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("spider-mode-entering");
      }, 1500);
    } else {
      document.documentElement.classList.remove("spider-mode");
      document.documentElement.classList.remove("spider-mode-entering");
    }

    return () => {
      if (enteringTimer) window.clearTimeout(enteringTimer);
    };
  }, [mode]);

  const toggleMode = () => {
    hasUserPreference.current = true;
    setMode((prev) => prev === "professional" ? "spider" : "professional");
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};
