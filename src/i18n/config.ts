/**
 * i18n Configuration
 * Internationalization setup for grAIde (English + Romanian)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enSetup from './locales/en/setup.json';
import enDashboard from './locales/en/dashboard.json';

import roCommon from './locales/ro/common.json';
import roAuth from './locales/ro/auth.json';
import roSetup from './locales/ro/setup.json';
import roDashboard from './locales/ro/dashboard.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    setup: enSetup,
    dashboard: enDashboard,
  },
  ro: {
    common: roCommon,
    auth: roAuth,
    setup: roSetup,
    dashboard: roDashboard,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    lng: 'ro', // Default to Romanian
    fallbackLng: 'ro', // Fallback to Romanian if translation missing
    defaultNS: 'common',

    // Language detection order
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'graide_language',
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Debugging (disable in production)
    debug: import.meta.env.DEV,
  });

export default i18n;
