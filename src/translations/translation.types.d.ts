import { translations as enTranslations } from './translations.en.js';
import { translations as frTranslations } from './translations.fr.js';

type Translations = typeof frTranslations & typeof enTranslations;
type TranslationKeys = keyof Translations;
type ArrowFunction = (...args: any) => any;

export type I18nFunction = <Key extends TranslationKeys, TranslationPropertyValue extends Translations[Key]>(
  key: Key,
  // the rest of the arguments depends on the type of the TranslationPropertyValue which can be either a function or a string (see (i18n.types.d.ts).Translation)
  // if it's a string, we do not allow any arguments
  // if it's a function, we allow one argument with the same type as the one expected by the function
  ...args: TranslationPropertyValue extends ArrowFunction ? [Parameters<TranslationPropertyValue>[0]] : [undefined]
) => TranslationPropertyValue extends ArrowFunction ? ReturnType<TranslationPropertyValue> : TranslationPropertyValue;
