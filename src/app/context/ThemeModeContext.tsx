import { createContext, useState, useEffect, useRef, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

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
  const navigate = useNavigate();
  const location = useLocation();
  const firstToggleFrame = useRef<number | null>(null);
  const secondToggleFrame = useRef<number | null>(null);
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem("portfolio-mode");
    return (saved as Mode) || "professional";
  });

  useEffect(() => {
    localStorage.setItem("portfolio-mode", mode);
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

  useEffect(() => {
    return () => {
      if (firstToggleFrame.current) {
        window.cancelAnimationFrame(firstToggleFrame.current);
      }
      if (secondToggleFrame.current) {
        window.cancelAnimationFrame(secondToggleFrame.current);
      }
    };
  }, []);

  const toggleMode = () => {
    if (firstToggleFrame.current) {
      window.cancelAnimationFrame(firstToggleFrame.current);
    }
    if (secondToggleFrame.current) {
      window.cancelAnimationFrame(secondToggleFrame.current);
    }

    navigate("/", {
      replace:
        location.pathname === "/" &&
        location.search === "" &&
        location.hash === "",
    });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    firstToggleFrame.current = window.requestAnimationFrame(() => {
      secondToggleFrame.current = window.requestAnimationFrame(() => {
        setMode((prev) =>
          prev === "professional" ? "spider" : "professional",
        );
        firstToggleFrame.current = null;
        secondToggleFrame.current = null;
      });
    });
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};
