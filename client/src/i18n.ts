import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en/translation.json';
import amTranslation from './locales/am/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  am: {
    translation: amTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Language-specific configurations
    lng: 'en', // Default language
    
    // Namespace configuration
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Key separator
    keySeparator: '.',
    
    // React configuration
    react: {
      useSuspense: false,
    },
  });

export default i18n;
