/**
 * @param {string} key - The translation key
 * @param {object} [data] - The translation data
 * @returns {string} - The translated
 */
export function i18n(key, data) {
  const translation = getTranslation(key);
  if (translation == null) {
    console.warn(`Unknown translation [${i18n._lang}] "${key}"`);
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
 * @returns {null|string|function} - The translation string or function
 */
function getTranslation(key) {
  try {
    return i18n._translations[i18n._lang][key];
  } catch (e) {
    return null;
  }
}

// Init private translation storage
i18n._translations = {};

/**
 * @param {string} lang - Translation language code
 */
export function setLanguage(lang) {
  i18n._lang = lang;
}

/**
 * @returns {string} - Translation language code
 */
export function getLanguage() {
  return i18n._lang;
}

/**
 * @param {string} lang - Translation language code
 * @param {object} translations - Translation values by key
 */
export function addTranslations(lang, translations) {
  if (i18n._translations[lang] == null) {
    i18n._translations[lang] = {};
  }
  for (const key in translations) {
    i18n._translations[lang][key] = translations[key];
  }
}
