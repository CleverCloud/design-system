import { css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconRemixCheckLine as iconCheck,
  iconRemixClipboardLine as iconClipboard,
  iconRemixEyeOffLine as iconEyeClosed,
  iconRemixEyeLine as iconEyeOpen,
} from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { CcFormControlElement } from '../../lib/form/cc-form-control-element.abstract.js';
import { EmailValidator, RequiredValidator, combineValidators } from '../../lib/form/validation.js';
import { arrayEquals } from '../../lib/utils.js';
import { accessibilityStyles } from '../../styles/accessibility.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-icon/cc-icon.js';

const TAG_SEPARATOR = ' ';

/**
 * @typedef {import('lit/directives/ref.js').Ref<HTMLInputElement|HTMLTextAreaElement>} HTMLInputOrTextareaElementRef
 * @typedef {import('lit/directives/ref.js').Ref<HTMLElement>} HTMLElementRef
 * @typedef {import('../../lib/events.types.js').EventWithTarget<HTMLInputElement|HTMLTextAreaElement>} HTMLInputOrTextareaEvent
 * @typedef {import('../../lib/events.types.js').GenericEventWithTarget<KeyboardEvent,HTMLInputElement|HTMLTextAreaElement>} HTMLInputOrTextareaKeyboardEvent
 * @typedef {import('../../lib/form/validation.types.js').Validator} Validator
 * @typedef {import('../../lib/form/validation.types.js').ErrorMessageMap} ErrorMessageMap
 * @typedef {import('../../lib/form/form.types.js').FormControlData} FormControlData
 */

/**
 * An enhanced text input with support for multiline, copy-to-clipboard, show/hide secret and highlighted tags.
 *
 * ## Technical details
 *
 * * Uses a native `<input>` element by default and a `<textarea>` element when `multi` is true.
 * * When you use it with `readonly` \+ `clipboard` \+ NOT `multi`, the width of the input auto adapts to the length of the content.
 * * The `secret` feature only works for simple line mode (when `multi` is false).
 * * The `tags` feature enables a space-separated-value input wrapped on several lines where line breaks are not allowed. Don't use it with `multi` or `secret`.
 * * When an `errorMessage` is set, the input is decorated with a red border and a redish focus ring.
 *
 * @cssdisplay inline-block / block (with `[multi]`)
 *
 * @fires {CustomEvent<string>} cc-input-text:input - Fires the `value` whenever the `value` changes.
 * @fires {CustomEvent} cc-input-text:requestimplicitsubmit - Fires when enter key is pressed in simple mode, in tags mode or when ctrl+enter is pressed in multi mode.
 * @fires {CustomEvent<string[]>} cc-input-text:tags - Fires an array of tags whenever the `value` changes (separated by spaces).
 *
 * @cssprop {Color} --cc-input-btn-icon-color - The color for the icon within the clipboard/secret button (defaults: `#595959`).
 * @cssprop {FontFamily} --cc-input-font-family - The font-family for the input content (defaults: `inherit` or `--cc-ff-monospace` when using the tags mode).
 * @cssprop {Color} --cc-input-label-color - The color for the input's label (defaults: `inherit`).
 * @cssprop {FontSize} --cc-input-label-font-size - The font-size for the input's label (defaults: `inherit`).
 * @cssprop {FontWeight} --cc-input-label-font-weight - The font-weight for the input's label (defaults: `normal`).
 *
 * @slot help - The help message to be displayed right below the `<input>` element. Please use a `<p>` tag.
 */
export class CcInputText extends CcFormControlElement {
  static get properties() {
    return {
      ...super.properties,
      clipboard: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
      label: { type: String },
      hiddenLabel: { type: Boolean, attribute: 'hidden-label' },
      inline: { type: Boolean, reflect: true },
      multi: { type: Boolean, reflect: true },
      placeholder: { type: String },
      readonly: { type: Boolean, reflect: true },
      required: { type: Boolean },
      resetValue: { type: String, attribute: 'reset-value' },
      secret: { type: Boolean, reflect: true },
      skeleton: { type: Boolean, reflect: true },
      tags: { type: Array },
      type: { type: String, reflect: true },
      value: { type: String },
      _copyOk: { type: Boolean, state: true },
      _showSecret: { type: Boolean, state: true },
      _tagsEnabled: { type: Boolean, state: true },
    };
  }

  static reactiveValidationProperties = ['required', 'type'];

  constructor() {
    super();

    /** @type {boolean} Adds a copy-to-clipboard button (when not disabled and not skeleton). */
    this.clipboard = false;

    /** @type {boolean} Sets `disabled` attribute on inner native `<input>/<textarea>` element. */
    this.disabled = false;

    /** @type {boolean} Sets the `<label>` on the left of the `<input>` element.
     * Only use this if your form contains 1 or 2 fields and your labels are short.
     */
    this.inline = false;

    /** @type {string|null} Sets label for the input. */
    this.label = null;

    /** @type {boolean} Hides the label visually if `true`. */
    this.hiddenLabel = false;

    /** @type {boolean} Enables multiline support (with a `<textarea>` instead of an `<input>`). */
    this.multi = false;

    /** @type {string} Sets `placeholder` attribute on inner native `<input>/<textarea>` element. */
    this.placeholder = '';

    /** @type {boolean} Sets `readonly` attribute on inner native `<input>/<textarea>` element. */
    this.readonly = false;

    /** @type {boolean} Sets required mention inside the `<label>` element. */
    this.required = false;

    /** @type {string} Sets the `value` to set when parent `<form>` element is reset. */
    this.resetValue = '';

    /** @type {boolean} Enables show/hide secret feature with an eye icon. */
    this.secret = false;

    /** @type {boolean} Enables skeleton screen UI pattern (loading hint). */
    this.skeleton = false;

    /** @type {string[]} Sets list of tags and enables tags mode (if not null). */
    this.tags = null;

    /** @type {'text'|'email'} The type of the input. Setting this to `email` will add a validity constraint on this input. */
    this.type = 'text';

    /** @type {string} Sets `value` attribute on inner native input element or textarea's inner content. */
    this.value = '';

    /** @type {boolean} */
    this._copyOk = false;

    /** @type {HTMLElementRef} */
    this._errorRef = createRef();

    /** @type {HTMLInputOrTextareaElementRef} */
    this._inputRef = createRef();

    /** @type {boolean} */
    this._showSecret = false;

    /** @type {boolean} */
    this._tagsEnabled = false;

    /** @type {ErrorMessageMap} */
    this._errorMessages = {
      empty: () => {
        if (this.type === 'email') {
          return i18n('cc-input-text.error.empty.email');
        } else {
          return i18n('cc-input-text.error.empty');
        }
      },
      badEmail: () => i18n('cc-input-text.error.bad-email'),
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
      this.type === 'email' ? new EmailValidator() : null,
    ]);
  }

  /**
   * @return {FormControlData}
   * @protected
   */
  _getFormControlData() {
    if (this._tagsEnabled) {
      const data = new FormData();
      this.tags.forEach((tag) => {
        data.append(this.name, tag);
      });
      return data;
    }

    return this.value;
  }

  /**
   * @return {Array<string>}
   * @protected
   */
  _getReactiveValidationProperties() {
    return CcInputText.reactiveValidationProperties;
  }

  /* endregion */

  // In general, we try to use LitElement's update() lifecycle callback but in this situation,
  // overriding get/set makes more sense
  get tags() {
    return this._tagsEnabled ? this.value.split(TAG_SEPARATOR).filter((tag) => tag !== '') : null;
  }

  set tags(newVal) {
    this._tagsEnabled = newVal != null;
    if (this._tagsEnabled) {
      const oldVal = this.tags;
      // The cc-input-text:tags event fires with a filtered list of tags.
      // This means if you type "hello " with a trailing space, the event would be fired with ['hello'].
      // Then if a parent component sets input.tags = ['hello'], the space would be removed.
      // This if only sets the value if the new tags are different
      if (!arrayEquals(oldVal, newVal)) {
        this.value = newVal.join(TAG_SEPARATOR);
        this.requestUpdate('tags', oldVal);
      }
    }
  }

  /**
   * Triggers focus on the inner `<input>/<textarea>` element.
   */
  focus() {
    this._inputRef.value?.focus();
  }

  /**
   * @param {HTMLInputOrTextareaEvent} e
   */
  _onInput(e) {
    // If tags mode is enabled, we want to prevent/remove line breaks
    // and preserve caret position in case of a line break entry (keypress, DnD, copy/paste...)
    if (this._tagsEnabled) {
      if (e.target.value.includes('\n')) {
        const { selectionStart, selectionEnd } = e.target;
        const oldValue = e.target.value;
        const newValue = e.target.value.replace(/\n/g, '');
        const diff = oldValue.length - newValue.length;
        e.target.value = newValue;
        e.target.setSelectionRange(selectionStart - diff, selectionEnd - diff);
      }
    }
    this.value = e.target.value;

    dispatchCustomEvent(this, 'input', this.value);
    if (this._tagsEnabled) {
      dispatchCustomEvent(this, 'tags', this.tags);
    }
  }

  /**
   * @param {HTMLInputOrTextareaEvent} e
   */
  _onFocus(e) {
    if (this.readonly) {
      e.target.select();
    }
  }

  _onClickCopy() {
    navigator.clipboard.writeText(this.value).then(() => {
      this._copyOk = true;
      setTimeout(() => (this._copyOk = false), 1000);
    });
  }

  _onClickSecret() {
    this._showSecret = !this._showSecret;
  }

  /**
   * Stop propagation of keydown and keypress events (to prevent conflicts with shortcuts)
   *
   * @param {HTMLInputOrTextareaKeyboardEvent} e
   */
  _onKeyEvent(e) {
    if (e.type === 'keydown' || e.type === 'keypress') {
      e.stopPropagation();
    }
    // Here we prevent keydown on enter key from modifying the value
    if (this._tagsEnabled && e.type === 'keydown' && e.keyCode === 13) {
      e.preventDefault();
      this._internals.form?.requestSubmit();
      dispatchCustomEvent(this, 'requestimplicitsubmit');
    }
    // Request implicit submit with keypress on enter key
    if (!this.readonly && e.type === 'keypress' && e.keyCode === 13) {
      if (!this.multi || (this.multi && e.ctrlKey)) {
        this._internals.form?.requestSubmit();
        dispatchCustomEvent(this, 'requestimplicitsubmit');
      }
    }
  }

  /* endregion */

  render() {
    const value = this.value ?? '';
    const rows = value.split('\n').length;
    const clipboard = this.clipboard && !this.disabled && !this.skeleton;
    // NOTE: For now, we don't support secret when multi is activated
    const secret = this.secret && !this.multi && !this.disabled && !this.skeleton;
    const isTextarea = this.multi || this._tagsEnabled;
    const hasErrorMessage = this.errorMessage != null && this.errorMessage !== '';

    const tags = value
      .split(TAG_SEPARATOR)
      .map((tag, i, all) => html`<span class="tag">${tag}</span>${i !== all.length - 1 ? TAG_SEPARATOR : ''}`);

    return html`
      ${this.label != null
        ? html`
            <label class=${classMap({ 'visually-hidden': this.hiddenLabel })} for="input-id">
              <span class="label-text">${this.label}</span>
              ${this.required ? html` <span class="required">${i18n('cc-input-text.required')}</span> ` : ''}
            </label>
          `
        : ''}

      <div class="meta-input">
        <div
          class="wrapper ${classMap({ skeleton: this.skeleton })}"
          @input=${this._onInput}
          @keydown=${this._onKeyEvent}
          @keypress=${this._onKeyEvent}
        >
          ${isTextarea
            ? html`
                ${this._tagsEnabled && !this.skeleton
                  ? html`
                      <!--
                We use this to display colored background rectangles behind space separated values. 
                This needs to be on the same line and the 2 level parent is important to keep scroll behaviour.
              -->
                      <div class="input input-underlayer" style="--rows: ${rows}">
                        <div class="all-tags">${tags}</div>
                      </div>
                    `
                  : ''}
                <textarea
                  id="input-id"
                  class="input ${classMap({ 'input-tags': this._tagsEnabled, error: hasErrorMessage })}"
                  style="--rows: ${rows}"
                  rows=${rows}
                  ?disabled=${this.disabled || this.skeleton}
                  ?readonly=${this.readonly}
                  .value=${value}
                  placeholder=${this.placeholder}
                  spellcheck="false"
                  wrap="${ifDefined(this._tagsEnabled ? 'soft' : undefined)}"
                  aria-describedby="help-id error-id"
                  @focus=${this._onFocus}
                  ${ref(this._inputRef)}
                ></textarea>
              `
            : ''}
          ${!isTextarea
            ? html`
                ${clipboard && this.readonly
                  ? html`
                      <!--
                This div has the same styles as the input (but it's hidden with height:0)
                this way we can use it to know what width the content is
                and "auto size" the container.
              -->
                      <div class="input input-mirror">${value}</div>
                    `
                  : ''}
                <input
                  id="input-id"
                  type=${this.secret && !this._showSecret ? 'password' : 'text'}
                  class="input ${classMap({ error: hasErrorMessage })}"
                  ?disabled=${this.disabled || this.skeleton}
                  ?readonly=${this.readonly}
                  .value=${value}
                  placeholder=${this.placeholder}
                  spellcheck="false"
                  aria-describedby="help-id error-id"
                  @focus=${this._onFocus}
                  ${ref(this._inputRef)}
                />
              `
            : ''}

          <div class="ring"></div>
        </div>

        ${secret
          ? html`
              <button
                class="btn"
                @click=${this._onClickSecret}
                title=${this._showSecret ? i18n('cc-input-text.secret.hide') : i18n('cc-input-text.secret.show')}
              >
                <cc-icon
                  class="btn-img"
                  .icon=${this._showSecret ? iconEyeClosed : iconEyeOpen}
                  a11y-name=${this._showSecret ? i18n('cc-input-text.secret.hide') : i18n('cc-input-text.secret.show')}
                  size="lg"
                ></cc-icon>
              </button>
            `
          : ''}
        ${clipboard
          ? html`
              <button class="btn" @click=${this._onClickCopy} title=${i18n('cc-input-text.clipboard')}>
                <cc-icon
                  class="btn-img"
                  .icon=${this._copyOk ? iconCheck : iconClipboard}
                  a11y-name=${i18n('cc-input-text.clipboard')}
                  size="lg"
                ></cc-icon>
              </button>
            `
          : ''}
      </div>

      <div class="help-container" id="help-id">
        <slot name="help"></slot>
      </div>

      ${hasErrorMessage
        ? html` <p class="error-container" id="error-id" ${ref(this._errorRef)}>${this.errorMessage}</p>`
        : ''}
    `;
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

        :host([multi]) {
          display: block;
        }

        /* region Common to cc-input-* & cc-select (apart from multi) */

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

        :host([inline][multi]) {
          display: grid;
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
          color: var(--cc-color-text-weak);
          font-size: 0.9em;
          font-variant: small-caps;
        }

        :host([inline]) .required {
          font-size: 0.8em;
        }

        slot[name='help']::slotted(*) {
          color: var(--cc-color-text-weak);
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
          /* link to position:absolute of .ring */
          position: relative;
          vertical-align: top;
          width: 100%;
        }

        :host([multi]) .meta-input {
          display: flex;
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
          font-family: var(--cc-input-font-family, inherit);
          font-size: 0.85em;
          grid-area: 1 / 1 / 2 / 2;
          /* multiline behaviour */
          height: calc(var(--rows, 1) * 2em);
          /* 2em with a 0.85em font-size ~ 1.7em */
          /* (2em - 1.7em) / 2 ~ 0.15em of padding (top and bottom) on the wrapper */
          line-height: 2em;
          overflow: hidden;
          z-index: 2;
        }

        .input::placeholder {
          font-style: italic;
        }

        textarea:not([wrap]) {
          white-space: pre;
        }

        /* STATES */

        .input:focus,
        .input:active {
          outline: 0;
        }

        .input[disabled] {
          color: var(--cc-color-text-weak);
          opacity: 1;
          pointer-events: none;
        }

        /* Hide only height and keep content width */

        .input-mirror {
          height: 0;
        }

        /* TAGS UNDERLAYER */

        .input-tags,
        .input-underlayer {
          font-family: var(--cc-input-font-family, var(--cc-ff-monospace));
          height: auto;
          padding: 0 3px;
          word-break: break-all;
          word-spacing: 0.5ch;
        }

        .input-underlayer {
          color: transparent;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
          white-space: pre-wrap;
          z-index: 1;
        }

        .input-underlayer .tag:not(:empty) {
          --color: var(--cc-color-bg-soft, #eee);

          background-color: var(--color);
          border-radius: 3px;
          box-shadow: 0 0 0 2px var(--color);
          padding: 1px 0;
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

        .input.error + .ring {
          border-color: var(--cc-color-border-danger) !important;
        }

        .input:focus + .ring {
          border-color: var(--cc-color-border-neutral-focused, #777);
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .input.error:focus + .ring {
          outline: var(--cc-focus-outline-error, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .input:hover + .ring {
          border-color: var(--cc-color-border-neutral-hovered, #777);
        }

        :host([disabled]) .ring {
          background: var(--cc-color-bg-neutral-disabled);
          border-color: var(--cc-color-border-neutral-disabled, #eee);
        }

        :host([readonly]) .ring {
          background: var(--cc-color-bg-neutral-readonly, #aaa);
        }

        /* SKELETON */

        .skeleton .ring,
        .skeleton:hover .ring,
        .skeleton .input:hover + .ring {
          background-color: var(--cc-color-bg-neutral-disabled);
          border-color: var(--cc-color-border-neutral-disabled, #eee);
          cursor: progress;
        }

        .skeleton .input,
        .skeleton .input::placeholder {
          color: transparent;
        }

        /* RESET */

        .btn {
          background: transparent;
          border: none;
          display: block;
          font-family: inherit;
          font-size: unset;
          margin: 0;
          padding: 0;
        }

        .btn {
          border-radius: var(--cc-border-radius-small, 0.15em);
          cursor: pointer;
          flex-shrink: 0;
          height: 1.6em;
          margin: 0.2em 0.2em 0.2em 0;
          width: 1.6em;
          z-index: 2;
        }

        .btn:focus {
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .btn:active,
        .btn:hover {
          box-shadow: none;
          outline: 0;
        }

        .btn:hover {
          background-color: var(--cc-color-bg-neutral-hovered);
        }

        .btn:active {
          background-color: var(--cc-color-bg-neutral-active);
        }

        /* We can do this because we set a visible focus state */

        .btn::-moz-focus-inner {
          border: 0;
        }

        .btn-img {
          --cc-icon-color: var(--cc-input-btn-icons-color, #595959);

          box-sizing: border-box;
          padding: 15%;
        }

        .btn-img:hover {
          --cc-icon-color: var(--cc-color-text-primary);
        }
      `,
    ];
  }
}

window.customElements.define('cc-input-text', CcInputText);
