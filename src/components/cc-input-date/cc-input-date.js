import { css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { DateFormatter } from '../../lib/date/date-formatter.js';
import {
  clampDate,
  isDateValid,
  parseIsoDateString,
  parseSimpleDateString,
  shiftDateField,
} from '../../lib/date/date-utils.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { CcFormControlElement } from '../../lib/form/cc-form-control-element.abstract.js';
import { RequiredValidator, Validation, combineValidators, createValidator } from '../../lib/form/validation.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { isStringEmpty } from '../../lib/utils.js';
import { accessibilityStyles } from '../../styles/accessibility.js';
import { skeletonStyles } from '../../styles/skeleton.js';

// This is the date format chosen to format the date displayed to the user.
const DATE_FORMAT = 'datetime-short';
// This array is hard coded and corresponds directly to the date format defined above.
/** @type {Array<'Y'|'M'|'D'|'H'|'m'|'s'>} */
const FIELDS_POSITION = [
  'Y',
  'Y',
  'Y',
  'Y',
  'Y',
  'M',
  'M',
  'M',
  'D',
  'D',
  'D',
  'H',
  'H',
  'H',
  'm',
  'm',
  'm',
  's',
  's',
  's',
];

/**
 * @param {Date|string} dateOrString
 * @return {Date}
 * @throws {Error} Whenever the given argument is not a string with valid ISO date format.
 */
function getDateOrParseIso(dateOrString) {
  if (isDateValid(dateOrString)) {
    return dateOrString;
  }
  return parseIsoDateString(dateOrString);
}

/**
 * @return {InputDateValueStateEmpty}
 */
function dateStateEmpty() {
  return {
    type: 'empty',
  };
}

/**
 * @param {string} value
 * @return {InputDateValueStateNaD}
 */
function dateStateNaD(value) {
  return {
    type: 'NaD',
    value,
  };
}

/**
 * @param {Date} date
 * @return {InputDateValueStateValid}
 */
function dateStateValid(date) {
  return {
    type: 'valid',
    value: date.toISOString(),
    date,
  };
}

/**
 * @typedef {import('../../lib/date/date.types.js').Timezone} Timezone
 * @typedef {import('./cc-input-date.types.js').InputDateValueState} InputDateValueState
 * @typedef {import('./cc-input-date.types.js').InputDateValueStateEmpty} InputDateValueStateEmpty
 * @typedef {import('./cc-input-date.types.js').InputDateValueStateNaD} InputDateValueStateNaD
 * @typedef {import('./cc-input-date.types.js').InputDateValueStateValid} InputDateValueStateValid
 * @typedef {import('../../lib/form/validation.types.js').Validity} Validity
 * @typedef {import('../../lib/form/validation.types.js').Validator} Validator
 * @typedef {import('../../lib/form/validation.types.js').ErrorMessageMap} ErrorMessageMap
 * @typedef {import('lit/directives/ref.js').Ref<HTMLInputElement>} HTMLInputElementRef
 * @typedef {import('lit/directives/ref.js').Ref<HTMLElement>} HTMLElementRef
 * @typedef {import('lit').PropertyValues<CcInputDate>} CcInputDatePropertyValues
 * @typedef {import('../../lib/events.types.js').EventWithTarget<HTMLInputElement>} HTMLInputElementEvent
 * @typedef {import('../../lib/events.types.js').GenericEventWithTarget<KeyboardEvent, HTMLInputElement>} HTMLInputElementKeyboardEvent
 */

/**
 * A custom date input.
 *
 * ## Technical details
 *
 * * Uses a native `<input>` with a type `text`
 * * When an `errorMessage` is Set, the input is decorated with a red border and a redish focus ring.
 *
 * @cssdisplay inline-block
 *
 * @fires {CustomEvent<string>} cc-input-date:input - Fires the `value` whenever the `value` changes.
 * @fires {CustomEvent} cc-input-date:requestimplicitsubmit - Fires when enter key is pressed.
 *
 * @cssprop {FontFamily} --cc-input-font-family - The font-family for the input content (defaults: `inherit`).
 * @cssprop {Color} --cc-input-label-color - The color for the input's label (defaults: `inherit`).
 * @cssprop {FontSize} --cc-input-label-font-size - The font-size for the input's label (defaults: `inherit`).
 * @cssprop {FontWeight} --cc-input-label-font-weight - The font-weight for the input's label (defaults: `normal`).
 *
 * @slot help - The help message to be displayed right below the `<input>` element. Please use a `<p>` tag.
 */
export class CcInputDate extends CcFormControlElement {
  static get properties() {
    return {
      ...super.properties,
      disabled: { type: Boolean, reflect: true },
      hiddenLabel: { type: Boolean, attribute: 'hidden-label' },
      inline: { type: Boolean, reflect: true },
      label: { type: String },
      max: { type: String },
      min: { type: String },
      readonly: { type: Boolean, reflect: true },
      required: { type: Boolean },
      resetValue: { type: String, attribute: 'reset-value' },
      skeleton: { type: Boolean, reflect: true },
      timezone: { type: String },
      value: { type: String },
      _valueState: { type: Object, state: true },
    };
  }

  static reactiveValidationProperties = ['required', 'min', 'max', 'timezone'];

  constructor() {
    super();

    /** @type {boolean} Sets `disabled` attribute on inner native `<input>` element. */
    this.disabled = false;

    /** @type {boolean} Hides the label visually if `true`. */
    this.hiddenLabel = false;

    /** @type {boolean} Sets the `<label>` on the left of the `<input>` element.
     * Only use this if your form contains 1 or 2 fields and your labels are short.
     */
    this.inline = false;

    /** @type {string|null} Sets label for the input. */
    this.label = null;

    /** @type {string|null} Sets the max date with ISO date format. */
    this.max = null;

    /** @type {string|null} Sets the min date with ISO date format. */
    this.min = null;

    /** @type {boolean} Sets `readonly` attribute on inner native `<input>` element. */
    this.readonly = false;

    /** @type {boolean} Sets whether the "required" text inside the label should be displayed. */
    this.required = false;

    /** @type {string|Date|null} Sets the `value` to set when parent `<form>` element is reset. */
    this.resetValue = '';

    /** @type {boolean} Enables skeleton screen UI pattern (loading hint). */
    this.skeleton = false;

    /** @type {Timezone} The timezone to use. */
    this.timezone = 'UTC';

    /** @type {string|Date|null} Sets `value` attribute on inner native input element. */
    this.value = null;

    /** @type {HTMLElementRef} */
    this._errorRef = createRef();

    /** @type {HTMLInputElementRef} */
    this._inputRef = createRef();

    /**
     * @type {DateFormatter} The formatter to use to format the date.
     * It is maintained in sync with the `timezone` properties.
     */
    this._dateFormatter = this._resolveDateFormatter();

    /** @type {Date|null} The resolved maximum date or null if no maximum is specified. */
    this._maxDate = null;

    /** @type {Date|null} The resolved minimum date or null if no minimum is specified. */
    this._minDate = null;

    /** @type {InputDateValueState} */
    this._valueState = dateStateEmpty();

    /** @type {ErrorMessageMap} */
    this._errorMessages = {
      empty: () => i18n('cc-input-date.error.empty'),
      badInput: () => i18n('cc-input-date.error.bad-input'),
      rangeUnderflow: () => i18n('cc-input-date.error.range-underflow', { min: this.min }),
      rangeOverflow: () => i18n('cc-input-date.error.range-overflow', { max: this.max }),
    };
  }

  /* region CcFormControlElement implementation */

  /**
   * @return {HTMLElement}
   * @protected
   */
  _getFormControlElement() {
    return this._inputRef.value;
  }

  /**
   * @return {HTMLElement}
   * @protected
   */
  _getErrorElement() {
    return this._errorRef.value;
  }

  /**
   * @return {ErrorMessageMap}
   * @protected
   */
  _getErrorMessages() {
    return this._errorMessages;
  }

  /**
   * @return {Validator}
   * @protected
   */
  _getValidator() {
    return combineValidators([
      this.required ? new RequiredValidator() : null,
      createValidator(() => {
        if (this._valueState.type === 'empty') {
          return Validation.VALID;
        }

        if (this._valueState.type === 'NaD') {
          return Validation.invalid('badInput');
        }

        const date = this._valueState.date;

        if (this._minDate != null && date.getTime() < this._minDate.getTime()) {
          return Validation.invalid('rangeUnderflow');
        }

        if (this._maxDate != null && date.getTime() > this._maxDate.getTime()) {
          return Validation.invalid('rangeOverflow');
        }

        return Validation.VALID;
      }),
    ]);
  }

  /**
   * @return {string}
   * @protected
   */
  _getFormControlData() {
    if (this._valueState.type === 'empty') {
      return '';
    }
    return this._valueState.value;
  }

  /**
   * @return {Array<string>}
   * @protected
   */
  _getReactiveValidationProperties() {
    return CcInputDate.reactiveValidationProperties;
  }

  /* endregion */

  /* region Public methods */

  /**
   * Triggers focus on the inner `<input>` element.
   * @param {FocusOptions} [options]
   */
  focus(options) {
    this._inputRef.value.focus(options);
  }

  /**
   * @return {Date|null} The current value as Date or null if the value is not a valid date.
   */
  get valueAsDate() {
    return this._valueState.type === 'valid' ? this._valueState.date ?? null : null;
  }

  /* endregion */

  /* region Private methods */

  _resolveDateFormatter() {
    return new DateFormatter(DATE_FORMAT, this.timezone);
  }

  /**
   * Try to parse the given string with the current date parser, or if it fails, the ISO date parser.
   *
   * @param {string} string
   * @return {Date|null} null if given string is empty. Otherwise, the parsed Date.
   * @throws {Error} whenever the given string is not a parseable date.
   */
  _parseAsDate(string) {
    if (isStringEmpty(string)) {
      return null;
    }
    try {
      return parseSimpleDateString(string, this.timezone);
    } catch (e) {
      return parseIsoDateString(string);
    }
  }

  /**
   * Formats the current value using the current date formatter.
   * @return {string}
   */
  _formatValue() {
    switch (this._valueState.type) {
      case 'empty':
        return '';
      case 'NaD':
        return this._valueState.value ?? '';
      case 'valid':
        return this._dateFormatter.format(this._valueState.date);
    }
  }

  /**
   * @param {InputDateValueState} newValueState
   * @param {boolean} [dispatchEvent=true]
   */
  _setNewValueState(newValueState, dispatchEvent = true) {
    const oldValue = this._valueState.type === 'empty' ? '' : this._valueState.value;

    // You may wonder why we always change the reactive property `_valueState`!
    // It's because in some case we need to enforce the render method to be called to reformat the value that will be displayed in the native input.
    // This is needed in the case covered by this unit test: 'should have the formatted value when setting the same value with iso string'
    this._valueState = newValueState;

    // We also want to make sure that the value property is maintained in sync.
    this.value = this._valueState.type === 'empty' ? '' : this._valueState.value;

    if (dispatchEvent && oldValue !== this.value) {
      dispatchCustomEvent(this, 'input', this.value);
    }
  }

  /**
   * @param {null|Date|string} value
   * @return {InputDateValueState}
   */
  _toValueState(value) {
    if (value instanceof Date) {
      if (isDateValid(value)) {
        return dateStateValid(value);
      }

      return dateStateEmpty();
    }

    try {
      const date = this._parseAsDate(value);

      if (date == null) {
        return dateStateEmpty();
      }

      return dateStateValid(date);
    } catch (e) {
      return dateStateNaD(value);
    }
  }

  /* endregion */

  /* region Event handling */

  /**
   * @param {HTMLInputElementEvent} e
   */
  _onInput(e) {
    const inputValue = e.target.value;
    this._setNewValueState(this._toValueState(inputValue));
  }

  /**
   * @param {HTMLInputElementEvent} e
   */
  _onFocus(e) {
    if (this.readonly) {
      e.target.select();
    }
  }

  /**
   * @param {HTMLInputElementKeyboardEvent} e
   */
  _onKeyEvent(e) {
    // Stop propagation of keydown and keypress events (to prevent conflicts with shortcuts)
    if (e.type === 'keydown' || e.type === 'keypress') {
      e.stopPropagation();
    }
    // Here we prevent keydown on enter key from modifying the value
    if (e.type === 'keydown' && e.key === 'Enter') {
      e.preventDefault();
      this._internals.form?.requestSubmit();
      dispatchCustomEvent(this, 'requestimplicitsubmit');
    }
    // Request implicit submit with keypress on enter key
    if (!this.readonly && e.type === 'keypress' && e.key === 'Enter') {
      this._internals.form?.requestSubmit();
      dispatchCustomEvent(this, 'requestimplicitsubmit');
    }

    if (
      !this.readonly &&
      this._valueState.type === 'valid' &&
      e.type === 'keydown' &&
      ['ArrowDown', 'ArrowUp'].includes(e.key)
    ) {
      e.preventDefault();

      const element = e.target;
      const position = element.selectionStart;
      const offset = e.key === 'ArrowDown' ? -1 : +1;

      const shiftedDate = shiftDateField(this._valueState.date, FIELDS_POSITION[position], offset);
      const boundedDate = clampDate(shiftedDate, this._minDate, this._maxDate);

      this._setNewValueState(dateStateValid(boundedDate));

      // Reset the cursor to its initial position.
      this.getUpdateComplete().then(() => {
        element.setSelectionRange(position, position);
      });
    }
  }

  /* endregion */

  /**
   * @param {CcInputDatePropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('timezone')) {
      this._dateFormatter = this._resolveDateFormatter();
    }

    if (changedProperties.has('min')) {
      try {
        this._minDate = getDateOrParseIso(this.min);
      } catch (e) {
        this._minDate = null;
      }
    }

    if (changedProperties.has('max')) {
      try {
        this._maxDate = getDateOrParseIso(this.max);
      } catch (e) {
        this._maxDate = null;
      }
    }

    if (changedProperties.has('value')) {
      this._setNewValueState(this._toValueState(this.value), false);
    }
  }

  render() {
    const hasErrorMessage = this.errorMessage != null && this.errorMessage !== '';

    // We use the live directive for binding the value of the native input.
    // We need that for the case tested by 'should have the formatted value when setting the same value with iso string'

    return html`
      ${this.label != null
        ? html`
            <label class=${classMap({ 'visually-hidden': this.hiddenLabel })} for="input">
              <span class="label-text">${this.label}</span>
              ${this.required ? html` <span class="required">${i18n('cc-input-date.required')}</span> ` : ''}
            </label>
          `
        : ''}

      <div class="meta-input">
        <div class="wrapper ${classMap({ skeleton: this.skeleton })}">
          ${this._renderUnderlay()}
          <input
            id="input"
            ${ref(this._inputRef)}
            type="text"
            class="input ${classMap({ error: hasErrorMessage })}"
            ?disabled=${this.disabled || this.skeleton}
            ?readonly=${this.readonly}
            .value=${live(this._formatValue())}
            spellcheck="false"
            aria-describedby="help error keyboard-hint"
            @focus=${this._onFocus}
            @input=${this._onInput}
            @keydown=${this._onKeyEvent}
            @keypress=${this._onKeyEvent}
          />
          <div class="ring"></div>
        </div>
      </div>

      <div class="help-container" id="help">
        <slot name="help"></slot>
      </div>

      ${hasErrorMessage
        ? html` <p class="error-container" id="error" ${ref(this._errorRef)}>${this.errorMessage}</p>`
        : ''}
      ${this._valueState.type === 'valid'
        ? html` <p id="keyboard-hint" class="visually-hidden">${i18n('cc-input-date.keyboard-hint')}</p> `
        : ''}
    `;
  }

  _renderUnderlay() {
    if (this.skeleton || this._valueState.type !== 'valid') {
      return null;
    }

    return html` <div class="input underlay" aria-hidden="true">
      ${this._dateFormatter.mapParts(this._valueState.date, ({ type, value }) =>
        type === 'separator' ? value : html`<span>${value}</span>`,
      )}
    </div>`;
  }

  static get styles() {
    return [
      accessibilityStyles,
      skeletonStyles,
      // language=CSS
      css`
        /* stylelint-disable no-duplicate-selectors */
        :host {
          display: inline-block;
        }

        /* region Common to cc-input-* & cc-select */

        :host([inline]) {
          align-items: baseline;
          display: inline-grid;
          gap: 0 1em;
          grid-auto-rows: min-content;
          grid-template-areas:
            'label input'
            'label help'
            'label error';
          grid-template-columns: auto 1fr;
        }

        .help-container {
          grid-area: help;
        }

        .error-container {
          grid-area: error;
        }

        label {
          align-items: flex-end;
          cursor: pointer;
          display: flex;
          gap: 2em;
          justify-content: space-between;
          line-height: 1.25em;
          padding-bottom: 0.35em;
        }

        label .label-text {
          color: var(--cc-input-label-color, inherit);
          font-size: var(--cc-input-label-font-size, inherit);
          font-weight: var(--cc-input-label-font-weight, normal);
        }

        :host([inline]) label {
          flex-direction: column;
          gap: 0;
          grid-area: label;
          line-height: normal;
          padding: 0;
        }

        .required {
          color: var(--cc-color-text-weak, #333);
          font-size: 0.9em;
          font-variant: small-caps;
        }

        :host([inline]) .required {
          font-size: 0.8em;
        }

        slot[name='help']::slotted(*) {
          color: var(--cc-color-text-weak, #333);
          font-size: 0.9em;
          margin: 0.3em 0 0;
        }

        .error-container {
          color: var(--cc-color-text-danger);
          margin: 0.5em 0 0;
        }

        /* endregion */

        .meta-input {
          box-sizing: border-box;
          display: inline-flex;
          grid-area: input;
          height: max-content;
          overflow: visible;
          /* link to position:absolute of .ring */
          position: relative;
          vertical-align: top;
          width: 100%;
        }

        .wrapper {
          display: grid;
          flex: 1 1 0;
          min-width: 0;
          overflow: hidden;
          /* see input to know why 0.15em */
          padding: 0.15em 0.5em;
        }

        /* RESET */

        .input {
          /* remove Safari box shadow */
          -webkit-appearance: none;
          background: none;
          border: 1px solid #000;
          box-sizing: border-box;
          color: inherit;
          display: block;
          font-family: inherit;
          font-size: unset;
          margin: 0;
          padding: 0;
          resize: none;
          width: 100%;
        }

        /* BASE */

        .input {
          border: none;
          font-family: var(--cc-input-font-family, var(--cc-ff-monospace, monospace));
          font-size: 0.85em;
          grid-area: 1 / 1 / 2 / 2;
          /* 2em with a 0.85em font-size ~ 1.7em */
          /* (2em - 1.7em) / 2 ~ 0.15em of padding (top and bottom) on the wrapper */
          height: 2em;
          line-height: 2em;
          overflow: hidden;
          z-index: 2;
        }

        /* STATES */

        input:focus,
        input:active {
          outline: 0;
        }

        input[disabled] {
          color: var(--cc-color-text-weak, #333);
          opacity: 1;
          pointer-events: none;
        }

        /* We use this empty .ring element to decorate the input with background, border, box-shadows... */

        .ring {
          background: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral-strong, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          bottom: 0;
          box-shadow: 0 0 0 0 rgb(255 255 255 / 0%);
          left: 0;
          overflow: hidden;
          position: absolute;
          right: 0;
          top: 0;
          z-index: 0;
        }

        input:focus + .ring {
          border-color: var(--cc-color-border-neutral-focused, #777);
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        input.error + .ring {
          border-color: var(--cc-color-border-danger) !important;
        }

        input.error:focus + .ring {
          outline: var(--cc-focus-outline-error, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        input:hover + .ring {
          border-color: var(--cc-color-border-neutral-hovered, #777);
        }

        :host([disabled]) .ring {
          background: var(--cc-color-bg-neutral-disabled, #eee);
          border-color: var(--cc-color-border-neutral-disabled, #777);
        }

        :host([readonly]) .ring {
          background: var(--cc-color-bg-neutral-readonly, #aaa);
        }

        /* SKELETON */

        .skeleton .ring,
        .skeleton:hover .ring,
        .skeleton input:hover + .ring {
          background-color: var(--cc-color-bg-neutral-disabled, #eee);
          border-color: var(--cc-color-border-neutral-disabled, #777);
          cursor: progress;
        }

        .skeleton input {
          color: transparent;
        }

        /* UNDERLAY */

        .input,
        .underlay {
          font-family: var(--cc-input-font-family, var(--cc-ff-monospace, monospace));
          height: auto;
          padding: 0 3px;
        }

        .underlay {
          color: transparent;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
          white-space: nowrap;
          z-index: 1;
        }

        .underlay span:not(:empty) {
          --color: var(--cc-color-border-neutral, #aaa);

          border-bottom: 2px solid var(--cc-color-border-neutral, #eee);
          padding: 1px 0;
        }
      `,
    ];
  }
}

window.customElements.define('cc-input-date', CcInputDate);
