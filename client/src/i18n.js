import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import translationRU from './locales/ru/translation.json';
import translationDE from './locales/de/translation.json';

const resources = {
  ru: {
    translation: translationRU
  },
  de: {
    translation: translationDE
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'de'],
    
    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    }
  });

export default i18n; 