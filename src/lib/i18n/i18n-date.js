/**
 *
 * @typedef {import('./i18n.types.js').DateFormatter} DateFormatter
 * @typedef {import('./i18n.types.js').DateUnit} DateUnit
 * @typedef {import('./i18n.types.js').RelativeTimeFormatFunction} RelativeTimeFormatFunction
 */

/**
 *
 * @type {Array<{unit: DateUnit, duration: number}>}
 */
const UNITS = [
  { unit: 'year', duration: 1000 * 60 * 60 * 24 * 365.25 },
  { unit: 'month', duration: 1000 * 60 * 60 * 24 * (365.25 / 12) },
  { unit: 'week', duration: 1000 * 60 * 60 * 24 * 7 },
  { unit: 'day', duration: 1000 * 60 * 60 * 24 },
  { unit: 'hour', duration: 1000 * 60 * 60 },
  { unit: 'minute', duration: 1000 * 60 },
  { unit: 'second', duration: 1000 },
];

/**
 * Create a "from now" date formatter function
 * @param {string} lang - BCP 47 language tag
 * @param {RelativeTimeFormatFunction} fallback - Function used if Intl.RelativeTimeFormat is not available
 * @param {string} nowString - Fallback function (value, unit) => "x minutes ago"
 * @returns {DateFormatter}
 */
export function prepareFormatDistanceToNow(lang, fallback, nowString) {
  const format = getRelativeTimeFunction(lang, fallback);

  return function (dateInput) {
    const date = new Date(dateInput).getTime();
    const now = new Date().getTime();
    const diff = now - date;

    for (const { unit, duration } of UNITS) {
      const value = diff / duration;
      const roundedValue = Math.round(value);

      if (value >= 1) {
        return format(roundedValue, unit);
      }
    }
    return nowString;
  };
}

/**
 * Prepare a date formatter which formats datetime to localized string (year => minute) with TZ
 * @param {string} lang - BCP 47 language tag
 * @returns {DateFormatter}
 */
export function prepareFormatDate(lang) {
  const dtf = new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  });

  return createFormatter(dtf);
}

/**
 * Prepare a date formatter which formats datetime to localized string (year => minutes) without TZ
 * @param {string} lang - BCP 47 language tag
 * @returns {DateFormatter}
 */
export function prepareFormatDatetime(lang) {
  const dtf = new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  return createFormatter(dtf);
}

/**
 * Prepare a date formatter which formats date to localized string (year => day)
 * @param {string} lang - BCP 47 language tag
 * @returns {DateFormatter}
 */
export function prepareFormatDateOnly(lang) {
  const dtf = new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return createFormatter(dtf);
}

/**
 * Prepare a date formatter which formats date to localized string (year => day)
 * @param {string} lang - BCP 47 language tag
 * @returns {DateFormatter}
 */
export function prepareFormatHours(lang) {
  const dtf = new Intl.DateTimeFormat(lang, {
    hour: 'numeric',
  });
  return createFormatter(dtf);
}

/**
 *
 * @param {Intl.DateTimeFormat} dateTimeFormat
 * @return {DateFormatter}
 */
function createFormatter(dateTimeFormat) {
  return (dateInput) => dateTimeFormat.format(new Date(dateInput));
}

/**
 * @param {string} lang
 * @param {RelativeTimeFormatFunction} fallback
 */
function getRelativeTimeFunction(lang, fallback) {
  if ('RelativeTimeFormat' in Intl) {
    /** @type {RelativeTimeFormatFunction} */
    return (value, unit) => new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(-value, unit);
  }
  return fallback;
}
