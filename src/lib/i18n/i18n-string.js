/**
 * /**
 * Prepares a plural() function for a given lang
 * @param {String} lang - BCP 47 language tag
 * @returns {function(Number, String, String=): String}
 */
export function preparePlural(lang) {
  const pr = new Intl.PluralRules(lang);

  /**
   * Based on https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
   * @param {Number} number - The number to get a plural rule for.
   * @param {String} one - The singular form of the string.
   * @param {String} other - The plural form of the string (optional with automatic "s" suffix).
   * @returns {String}
   */
  return function plural(number, one, other = one + 's') {
    const rules = { one, other };
    return rules[pr.select(number)];
  };
}
