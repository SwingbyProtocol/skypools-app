/* eslint-disable import/no-internal-modules */

import zh from './files/zh.json';
import zh_TW from './files/zh-TW.json';
import en from './files/en.json';
import es from './files/es.json';
import ja from './files/ja.json';

export const languages = {
  en,
  zh,
  'zh-TW': zh_TW,
  es,
  ja,
} as const;

export const SUPPORTED_LANGUAGES = Object.keys(languages) as unknown as Array<
  keyof typeof languages
>;

export const getLanguageName = (locale: string) => {
  switch (locale) {
    case 'zh':
      return '简体中文';
    case 'zh-TW':
      return '繁體中文';
    case 'ja':
      return '日本語';
    case 'es':
      return 'Español';
    case 'en':
    default:
      return 'EN';
  }
};
