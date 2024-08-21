// eslint-disable-next-line import/no-extraneous-dependencies
import { UPDATE_GLOBALS } from '@storybook/core-events';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addons } from '@storybook/preview-api';
import { addTranslations, getLanguage, setLanguage } from '../../lib/i18n/i18n.js';
import * as en from '../../translations/translations.en.js';
import * as fr from '../../translations/translations.fr.js';

const availableLanguages = [
  { value: 'en', title: 'English' },
  { value: 'fr', title: 'Français' },
  { value: 'missing', title: '🤬 Missing' },
];

// Init languages
addTranslations(en.lang, en.translations);
addTranslations(fr.lang, fr.translations);

const INIT_LANG = window.localStorage.getItem('I18N_LANG') ?? 'en';

// Default to English
setLanguage(INIT_LANG);

const ALL_LANGS = availableLanguages.map((o) => o.value);

window.addEventListener('keypress', ({ keyCode, altKey, ctrlKey, metaKey, shiftKey }) => {
  // "i" key
  if (keyCode === 105 && !altKey && !ctrlKey && !metaKey && !shiftKey) {
    const langIdx = ALL_LANGS.indexOf(getLanguage());
    const nextIdx = (langIdx + 1) % ALL_LANGS.length;
    const nextLang = ALL_LANGS[nextIdx];
    addons.getChannel().emit(UPDATE_GLOBALS, { globals: { locale: nextLang } });
  }
});
