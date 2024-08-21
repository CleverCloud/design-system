/**
 * @typedef {import('./i18n.types.js').TranslationsMap} TranslationsMap
 * @typedef {import('./i18n.types.js').Translations} Translations
 * @typedef {import('./i18n.types.js').TranslateFunction} TranslateFunction
 * @typedef {import('./i18n.types.js').Translated} Translated
 */

/**
 * @param {string} key - The translation key
 * @param {Object} [data] - The translation data
 * @returns {Translated} - The translation
 */
export function i18n(key, data) {
  const translation = getTranslation(key);
  if (translation == null) {
    console.warn(`Unknown translation [${currentLanguage}] "${key}"`);
    return i18n.MISSING_TEXT;
  }
  if (typeof translation === 'function') {
    return translation(data);
  }
  return translation;
}

// Let anyone configure missing text placeholder
i18n.MISSING_TEXT = '🤬🤬🤬🤬🤬';

/**
 * @param {string} key - The translation key
 * @returns {null|string|TranslateFunction} - The translation string or function
 */
function getTranslation(key) {
  try {
    return TRANSLATIONS_MAP[currentLanguage][key];
  } catch (e) {
    return null;
  }
}

// Init private translation storage
/**
 * @type {TranslationsMap}
 */
const TRANSLATIONS_MAP = {};
/** @type {string|null} */
let currentLanguage = null;

/**
 * @param {string} language - Translation language code
 */
export function setLanguage(language) {
  currentLanguage = language;
}

/**
 * @returns {string} - Translation language code
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * @param {string} language - Translation language code
 * @param {Translations} translations - Translation values by key
 */
export function addTranslations(language, translations) {
  if (TRANSLATIONS_MAP[language] == null) {
    TRANSLATIONS_MAP[language] = {};
  }
  for (const key in translations) {
    TRANSLATIONS_MAP[language][key] = translations[key];
  }
}
