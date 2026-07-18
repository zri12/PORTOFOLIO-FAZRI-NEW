import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
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

const translatedTextNodes = new WeakMap<Text, string>();
const translatedAttributes = new WeakMap<Element, Map<string, string>>();
const translatedAttributeNames = ["placeholder", "title", "aria-label"];
const skippedTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE", "PRE"]);

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (skippedTags.has(parent.tagName)) return true;
  if (parent.closest("[data-no-translate], [contenteditable='true']")) return true;
  return !node.nodeValue?.trim();
}

function translateTextNode(node: Text, language: Language) {
  if (shouldSkipTextNode(node)) return;
  const original = translatedTextNodes.get(node) || node.nodeValue || "";
  if (!translatedTextNodes.has(node)) translatedTextNodes.set(node, original);
  const translated = translateText(original.trim(), language);
  if (translated === original.trim()) {
    node.nodeValue = original;
    return;
  }
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  node.nodeValue = `${leading}${translated}${trailing}`;
}

function translateElementAttributes(element: Element, language: Language) {
  if (skippedTags.has(element.tagName) || element.closest("[data-no-translate]")) return;
  let originals = translatedAttributes.get(element);
  if (!originals) {
    originals = new Map();
    translatedAttributes.set(element, originals);
  }
  translatedAttributeNames.forEach((name) => {
    const value = element.getAttribute(name);
    if (!value?.trim()) return;
    if (!originals.has(name)) originals.set(name, value);
    element.setAttribute(name, translateText(originals.get(name) || value, language));
  });
}

function translateTree(root: ParentNode, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    translateTextNode(node as Text, language);
    node = walker.nextNode();
  }

  if (root instanceof Element) translateElementAttributes(root, language);
  root.querySelectorAll?.("[placeholder], [title], [aria-label]").forEach((element) => translateElementAttributes(element, language));
}

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
    translateTree(document.body, language);

    let frame = 0;
    const observer = new MutationObserver((mutations) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text, language);
            if (node.nodeType === Node.ELEMENT_NODE) translateTree(node as Element, language);
          });
          if (mutation.type === "characterData") translateTextNode(mutation.target as Text, language);
          if (mutation.type === "attributes" && mutation.target instanceof Element) translateElementAttributes(mutation.target, language);
        });
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: translatedAttributeNames,
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
