import type { ReactNode} from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getInitialLanguage, LANGUAGE_STORAGE_KEY, type Language, translateText } from "../i18n/translations";
import { languageFromPath, localizedPath } from "../lib/seo";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (value: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (value) => value,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathLanguage = languageFromPath(location.pathname);
  const [language, setLanguageState] = useState<Language>(() => pathLanguage || getInitialLanguage());

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    const nextPath = localizedPath(location.pathname, nextLanguage);
    if (nextPath !== location.pathname) navigate(`${nextPath}${location.search}${location.hash}`);
  };

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "en" ? "id" : "en"),
    t: (text: string) => translateText(text, language),
  }), [language]);

  useEffect(() => {
    if (pathLanguage !== language) setLanguageState(pathLanguage);
    document.documentElement.lang = pathLanguage;
  }, [language, pathLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
