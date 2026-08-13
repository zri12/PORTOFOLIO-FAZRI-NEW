import type { ReactNode} from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getInitialLanguage, LANGUAGE_STORAGE_KEY, type Language, translateText } from "../i18n/translations";

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
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "en" ? "id" : "en"),
    t: (text: string) => translateText(text, language),
  }), [language]);

  useEffect(() => {
    document.documentElement.lang = language === "id" ? "id" : "en";
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
