export type TranslationsMap = { [lang: string]: Translations };

export type Translations = { [key: string]: Translation };

export type Translation = string | TranslateFunction;

export type TranslateFunction = (data: { [key: string]: any }) => Translated;

export type Translated = string | Node;

export type DateInput = number | string;

export type DateFormatter = (dateInput: DateInput) => string;

export type DateUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

export type RelativeTimeFormatFunction = (value: number, unit: DateUnit) => string;

export type NumberFormatter = (number: number) => string;
