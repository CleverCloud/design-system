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
 * @param {String} lang - BCP 47 language tag
 * @param {Funciton} fallback - Function used if Intl.RelativeTimeFormat is not available
 * @param {String} nowString - Fallback function (value, unit) => "x minutes ago"
 * @returns {Function}
 */
export function prepareFormatDistanceToNow(lang, fallback, nowString) {
  const format =
    'RelativeTimeFormat' in Intl
      ? (value, unit) => new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(-value, unit)
      : fallback;

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
 * Format datetime to localized string (year => minute) with TZ
 * @param {String} lang - BCP 47 language tag
 * @param {String|Number} dateInput - Date as ISO string or millisec timestamp number
 * @returns {String}
 */
export function formatDate(lang, dateInput) {
  const dtf = new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  });
  const date = new Date(dateInput);
  return dtf.format(date);
}

/**
 * Format datetime to localized string (year => minutes) without TZ
 * @param {String} lang - BCP 47 language tag
 * @param {String|Number} dateInput - Date as ISO string or millisec timestamp number
 * @returns {String}
 */
export function formatDatetime(lang, dateInput) {
  const dtf = new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  const date = new Date(dateInput);
  return dtf.format(date);
}

/**
 * Format date to localized string (year => day)
 * @param {String} lang - BCP 47 language tag
 * @param {String|Number} dateInput - Date as ISO string or millisec timestamp number
 * @returns {String}
 */
export function formatDateOnly(lang, dateInput) {
  const dtf = new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const date = new Date(dateInput);
  return dtf.format(date);
}

/**
 * Format date to localized string (year => day)
 * @param {String} lang - BCP 47 language tag
 * @param {String|Number} dateInput - Date as ISO string or millisec timestamp number
 * @returns {String}
 */
export function formatHours(lang, dateInput) {
  const dtf = new Intl.DateTimeFormat(lang, {
    hour: 'numeric',
  });
  const date = new Date(dateInput);
  return dtf.format(date);
}
