// Lightweight i18n: flat key->string dicts, t(key, vars), live language switch.
import { en } from './en.js';
import { ja } from './ja.js';
import { zh } from './zh.js';
import { vi } from './vi.js';
import { ko } from './ko.js';
import { getLang, setLang } from '../state.js';

const DICTS = { en, ja, zh, vi, ko };

// All languages selectable in the picker.
export const LANGUAGES = [
  { code: 'en', native: 'English',   english: 'English',    short: 'EN' },
  { code: 'ja', native: '日本語',     english: 'Japanese',   short: 'JA' },
  { code: 'zh', native: '简体中文',   english: 'Mandarin',   short: 'ZH' },
  { code: 'vi', native: 'Tiếng Việt', english: 'Vietnamese', short: 'VI' },
  { code: 'ko', native: '한국어',     english: 'Korean',     short: 'KO' },
];

// Which dictionary backs each selectable language.
const DICT_FOR = { en: 'en', ja: 'ja', zh: 'zh', vi: 'vi', ko: 'ko' };
// <html lang> attribute used for font-stack swap.
const HTML_LANG = { en: 'en', ja: 'ja', zh: 'zh', vi: 'vi', ko: 'ko' };

let current = 'en';

export function getCurrentLang() { return current; }

export function langMeta(code = current) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

export function initLang() {
  const stored = getLang();
  current = stored && LANGUAGES.some((l) => l.code === stored) ? stored : 'en';
  applyHtmlLang();
}

function applyHtmlLang() {
  document.documentElement.setAttribute('lang', HTML_LANG[current] || 'en');
}

// Change language, persist, update <html lang>. Caller re-renders the route.
export function changeLang(code) {
  current = code;
  setLang(code);
  applyHtmlLang();
}

// Translate. Falls back: current dict -> en -> the key itself.
// Supports {var} interpolation.
export function t(keyPath, vars) {
  const dict = DICTS[DICT_FOR[current] || 'en'] || en;
  let str = dict[keyPath];
  if (str == null) str = en[keyPath];
  if (str == null) return keyPath;
  if (vars) {
    str = str.replace(/\{(\w+)\}/g, (m, name) =>
      (vars[name] != null ? String(vars[name]) : m));
  }
  return str;
}
