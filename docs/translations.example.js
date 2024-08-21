// Use existing date helpers if you need them
import { formatDatetime } from '../src/lib/i18n/i18n-date.js';
// Use HTML sanitizer tag function if you need HTML in translations
import { sanitize } from '../src/lib/i18n/i18n-sanitize.js';
// Use existing number helpers if you need them
import { prepareNumberUnitFormatter } from '../src/lib/i18n/i18n-number.js';
import { preparePlural } from '../src/lib/i18n/i18n-string.js';

// Define language code here
export const lang = 'example';

const plural = preparePlural(lang);

// Prepare date and number helpers for the current language
const formatNumberUnit = prepareNumberUnitFormatter(lang);

// DELETE THIS, it's only here to demonstrate some bad examples
const unknownTagFunction = () => ``;

// Define and export translations here
// Translations must be sorted by component and then alphabetically
// Translations must be grouped with fold region comments like this:
//#region cc-component
//#endregion

export const translations = {
  // The key must follow this pattern: 'cc-component.foo.bar'
  // Valid custom element tag name for the component,
  // then a dot,
  // then, a dot separated list of lowercase-alpha | numbers | dashes.
  // Enforced by ESlint rule "i18n-valid-key"
  'cc-good.foo.last-details': `good`,
  'cc-good.bar.24h-details': `good`,
  'cc-bad-name': `bad`,
  'bad.name': `bad`,
  'cc-bad.NAME': `bad`,

  // The value must be a template literal string.
  'cc-good.template-literal': `good`,

  // The value cannot be any other type, even a simple literal string.
  // A few exceptions are explained later...
  // Enforced by ESlint rule "i18n-valid-value"
  'cc-bad.simple-literal': `bad`,
  'cc-bad.array': [],
  'cc-bad.boolean': false,
  'cc-bad.null': null,
  'cc-bad.number': 42,
  'cc-bad.object': {},
  'cc-bad.undefined': undefined,
  'cc-bad.unknown-tag-function': unknownTagFunction`bad`,
  'cc-bad.function': function () {},

  // If the translation requires one or more params,
  // the value can be an arrow function returning a template literal string.
  'cc-good.arrow-params': ({ foo }) => `good ${foo}`,

  // The arrow function cannot return any other type, even a simple literal string.
  // A few exceptions are explained later...
  // Enforced by ESlint rule "i18n-no-forbidden-value-types"
  'cc-bad.arrow-simple-literal': ({ foo }) => `bad`,
  'cc-bad.arrow-array': ({ foo }) => [foo],
  'cc-bad.arrow-boolean': ({ foo }) => false,
  'cc-bad.arrow-null': ({ foo }) => null,
  'cc-bad.arrow-number': ({ foo }) => 42,
  'cc-bad.arrow-object': ({ foo }) => ({}),
  'cc-bad.arrow-undefined': ({ foo }) => undefined,
  'cc-bad.arrow-unknown-tag-function': ({ foo }) => unknownTagFunction`bad`,
  'cc-bad.arrow-no-return': () => {},

  // An arrow function cannot be used if there are no params!
  // Exception: if the translation contains sanitized HTML, more details later...
  // Enforced by ESlint rule "i18n-no-paramless-arrow"
  'cc-bad.arrow-no-params': `bad`,
  'cc-good.arrow-no-params-sanitize-tag': () => sanitize`<em>good</em>`,

  // The value returned by an arrow function can be a call to a helper function (date, number, plural...).
  'cc-good.arrow-with-helper': ({ from }) => formatDatetime(from),

  // If the code gets a bit hard to read with a one liner,
  // it happens when there are multiple calls to helpers (date, number, plural...),
  // the arrow function can have a block body and use multine lines.
  'cc-good.arrow-with-body': ({ from, totalRequests }) => {
    const fromDate = formatDatetime(from);
    const request = plural(totalRequests, 'request');
    const formattedValue = formatNumberUnit(totalRequests);
    return `${formattedValue} ${request} since ${fromDate}`;
  },

  // If the translation contains HTML, it must be sanitized with the "sanitize" tag function.
  // This tag function will only allow some WHITELISTED_TAGS and will filter almost all attributes.
  'cc-good.html-sanitize': () => sanitize`<em>good</em>`,
  'cc-good.html-sanitize-params': ({ foo }) => sanitize`<em>good</em> ${foo}`,
  'cc-good.html-sanitize-arrow-block': ({ foo }) => {
    return sanitize`<em>good</em> ${foo}`;
  },

  // The sanitize tag function must always be used when the translation contains HTML!
  // ESlint "translations-always-sanitize-with-html"
  'cc-bad.html-no-sanitize': () => sanitize`<em>bad</em>`,
  'cc-bad.html-no-sanitize-params': ({ foo }) => sanitize`<em>bad</em> ${foo}`,
  'cc-bad.html-no-sanitize-arrow-block': ({ foo }) => {
    return sanitize`<em>bad</em> ${foo}`;
  },

  // Translations without any HTML must not use the sanitize tag function!
  // Enforced by ESlint rule "i18n-no-sanitize-without-html"
  'cc-bad.no-html-sanitize': `bad`,
  'cc-bad.no-html-sanitize-params': ({ foo }) => `bad ${foo}`,
  'cc-bad.no-html-sanitize-arrow-block': ({ foo }) => {
    return `bad`;
  },

  // The sanitize tag function returns a DOM node.
  // If it's used directly as the translation value (without arrow function),
  // the same DOM node will be returned for each i18n('key') call.
  // It would cause weird behaviour and prevent the page from displaying the translation multiple times.
  // The sanitize tag function must always be used in an arrow function!
  // Enforced by ESlint rule "i18n-always-arrow-with-sanitize"
  'cc-bad.sanitize-without-arrow': () => sanitize`<em>bad</em>`,

  // The sanitize tag function must also be used as a template literal and not
  // a regular function that returns a template literal (for security reasons).
  // Enforced by ESlint rule "i18n-always-template-literal-sanitize"
  'cc-bad.sanitize-without-template-literal': () => sanitize(`<em>bad</em>`),
};
