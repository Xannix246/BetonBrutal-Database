import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en-US.json";
import LanguageDetector from "i18next-browser-languagedetector";

type LocaleModule = {
  default: Record<string, typeof en>;
};

const localeModules = import.meta.glob<LocaleModule>("./locales/*.json", {
  eager: true,
});

export const locale = en;

export const resources = Object.fromEntries(
  Object.entries(localeModules).map(([path, module]) => {
    const locale = path.split("/").pop()!.replace(".json", "");

    return [
      locale,
      {
        translation: module.default,
      },
    ];
  }),
);

export const supportedLanguages = Object.keys(resources);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en-US",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "language",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
