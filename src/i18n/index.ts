import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/i18n/locales/en.json';

/**
 * §16 foundation — resource files + i18next.
 * Step 9 keeps English copy identical; other locales can be added later.
 * `expo-localization` is installed for device locale APIs when multi-locale ships.
 */
void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
  },
  // Force English until additional locale files exist (avoids missing-key flicker).
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en'],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
