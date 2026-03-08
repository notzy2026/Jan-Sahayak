import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import all locale files
import en from './locales/en.json'
import hi from './locales/hi.json'
import bn from './locales/bn.json'
import gu from './locales/gu.json'
import kn from './locales/kn.json'
import ta from './locales/ta.json'
import te from './locales/te.json'
import mr from './locales/mr.json'
import ml from './locales/ml.json'
import pa from './locales/pa.json'
import or from './locales/or.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      gu: { translation: gu },
      kn: { translation: kn },
      ta: { translation: ta },
      te: { translation: te },
      mr: { translation: mr },
      ml: { translation: ml },
      pa: { translation: pa },
      or: { translation: or },
    },
    fallbackLng: 'hi',
    supportedLngs: ['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'en'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'jan-sahayak-language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('jan-sahayak-language', lng)
})

export default i18n
