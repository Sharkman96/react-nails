import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationRU from './locales/ru/translation.json';
import translationDE from './locales/de/translation.json';
import { getLangFromPath } from './utils/localeRoutes';

const resources = {
  ru: {
    translation: translationRU,
  },
  de: {
    translation: translationDE,
  },
};

const pathLanguageDetector = {
  name: 'path',
  lookup() {
    if (typeof window === 'undefined') return undefined;
    return getLangFromPath(window.location.pathname);
  },
  cacheUserLanguage() {
    // URL — источник истины для SEO-страниц / и /ru
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(pathLanguageDetector);

const initialLng =
  typeof window !== 'undefined' ? getLangFromPath(window.location.pathname) : 'de';

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng: 'de',
    supportedLngs: ['ru', 'de'],
    load: 'languageOnly',
    cleanCode: true,
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['path', 'querystring', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default',
    },
  });

export default i18n;
