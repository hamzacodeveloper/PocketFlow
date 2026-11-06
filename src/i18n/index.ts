import 'intl-pluralrules';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

import en from './en.json';
import ur from './ur.json';

const i18n = createInstance();

const resources = {
  en: { translation: en },
  ur: { translation: ur },
};

const getDeviceLang = () => {
  const locales = Localization.getLocales();
  const lang = locales[0]?.languageCode || 'en';
  return lang === 'ur' ? 'ur' : 'en';
};

export const initI18n = async (savedLang?: string | null) => {
  const lng = savedLang === 'system' || !savedLang ? getDeviceLang() : savedLang;
  const shouldBeRTL = lng === 'ur';

  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    // Only reload in production (OTA updates). In dev, reload causes infinite loop.
    if (!__DEV__) {
      try {
        await Updates.reloadAsync();
      } catch {
        // no-op
      }
    }
  }

  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      });
  } else {
    await i18n.changeLanguage(lng);
  }
};

export default i18n;
