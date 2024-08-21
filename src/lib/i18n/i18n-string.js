/**
 * Prepares a plural() function for a given lang
 * @param {string} lang - BCP 47 language tag
 * @returns {(number: number, one: string, other?: string) => string}
 */
export function preparePlural(lang) {
  const pr = new Intl.PluralRules(lang);

  /**
   * Based on https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules
   * @param {number} number - The number to get a plural rule for.
   * @param {string} one - The singular form of the string.
   * @param {string} [other] - The plural form of the string (optional with automatic "s" suffix).
   * @returns {string}
   */
  return function plural(number, one, other = one + 's') {
    const rules = { zero: one, one, two: other, few: other, many: other, other };
    return rules[pr.select(number)];
  };
}
