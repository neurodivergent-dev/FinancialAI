import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// English translations
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enSettings from './locales/en/settings.json';
import enFinance from './locales/en/finance.json';
import enOnboarding from './locales/en/onboarding.json';

// Turkish translations
import trCommon from './locales/tr/common.json';
import trDashboard from './locales/tr/dashboard.json';
import trSettings from './locales/tr/settings.json';
import trFinance from './locales/tr/finance.json';
import trOnboarding from './locales/tr/onboarding.json';

const resources = {
  en: {
    translation: {
      common: enCommon,
      dashboard: enDashboard,
      settings: enSettings,
      finance: enFinance,
      onboarding: enOnboarding,
    },
  },
  tr: {
    translation: {
      common: trCommon,
      dashboard: trDashboard,
      settings: trSettings,
      finance: trFinance,
      onboarding: trOnboarding,
    },
  },
};

const LANGUAGE_KEY = '@app_language';

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  
  if (!savedLanguage) {
    // Cihaz dilini algıla
    const locales = Localization.getLocales();
    const deviceLanguage = locales && locales.length > 0 ? locales[0].languageCode : 'en';
    savedLanguage = deviceLanguage === 'tr' ? 'tr' : 'en';
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
