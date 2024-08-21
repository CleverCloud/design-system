import { validateName } from '@clevercloud/client/esm/utils/env-vars.js';
import { css, html, LitElement } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-button/cc-button.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-notice/cc-notice.js';

/**
 * @typedef {import('../common.types.js').EnvVar} EnvVar
 * @typedef {import('../common.types.js').EnvVarValidationMode} EnvVarValidationMode
 */

/**
 * A small form to create a new environment variable with validations on the name.
 *
 * ## Details
 *
 * * The validation of the variable name format is handled with [@clevercloud/client](https://github.com/CleverCloud/clever-client.js/blob/master/esm/utils/env-vars.js)
 * * The validation of existing names is handled with the `variablesNames` property which is a list of already existing names.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<EnvVar>} cc-env-var-create:create - Fires the variable whenever the add button is clicked.
 */
export class CcEnvVarCreate extends LitElement {
  static get properties() {
    return {
      disabled: { type: Boolean },
      validationMode: { type: String, attribute: 'validation-mode' },
      variablesNames: { type: Array, attribute: 'variables-names' },
      _variableName: { type: String, state: true },
      _variableValue: { type: String, state: true },
    };
  }

  constructor() {
    super();

    /** @type {boolean} Sets `disabled` attribute on inputs and button. */
    this.disabled = false;

    /** @type {EnvVarValidationMode} Sets the mode of the variables name validation. */
    this.validationMode = 'simple';

    /** @type {string[]} Sets list of existing variables names (so we can display an error if it already exists). */
    this.variablesNames = [];

    /** @type {string} */
    this._variableName = '';

    /** @type {string} */
    this._variableValue = '';
  }

  /** Resets the form to its original state. */
  reset() {
    this._variableName = '';
    this._variableValue = '';
  }

  _onNameInput({ detail: value }) {
    this._variableName = value;
  }

  _onValueInput({ detail: value }) {
    this._variableValue = value;
  }

  _onSubmit() {
    dispatchCustomEvent(this, 'create', {
      name: this._variableName,
      value: this._variableValue,
    });
    this.reset();
    // Put focus back on name input, so we can add something else directly
    this.shadowRoot.querySelector('cc-input-text.name').focus();
  }

  _onRequestSubmit(e, hasErrors) {
    e.stopPropagation();
    if (!hasErrors) {
      this._onSubmit();
    }
  }

  render() {
    const isNameInvalidSimple = !validateName(this._variableName, 'simple');
    const isNameInvalidStrict = !validateName(this._variableName, 'strict');
    const isNameAlreadyDefined = this.variablesNames.includes(this._variableName);
    const hasErrors =
      this.validationMode === 'strict'
        ? isNameInvalidStrict || isNameAlreadyDefined
        : isNameInvalidSimple || isNameAlreadyDefined;

    return html`
      <div class="inline-form">
        <cc-input-text
          label=${i18n('cc-env-var-create.name.label')}
          class="name"
          name="name"
          value=${this._variableName}
          ?disabled=${this.disabled}
          @cc-input-text:input=${this._onNameInput}
          @cc-input-text:requestimplicitsubmit=${(e) => this._onRequestSubmit(e, hasErrors)}
        ></cc-input-text>

        <div class="input-btn">
          <cc-input-text
            label=${i18n('cc-env-var-create.value.label')}
            class="value"
            name="value"
            value=${this._variableValue}
            multi
            ?disabled=${this.disabled}
            @cc-input-text:input=${this._onValueInput}
            @cc-input-text:requestimplicitsubmit=${(e) => this._onRequestSubmit(e, hasErrors)}
          ></cc-input-text>

          <cc-button primary ?disabled=${hasErrors || this.disabled} @cc-button:click=${this._onSubmit}
            >${i18n('cc-env-var-create.create-button')}
          </cc-button>
        </div>
      </div>

      ${isNameInvalidStrict && this.validationMode === 'strict' && this._variableName !== ''
        ? html`
            <cc-notice intent="warning">
              <div slot="message">${i18n(`cc-env-var-create.errors.invalid-name`, { name: this._variableName })}</div>
            </cc-notice>
          `
        : ''}
      ${isNameInvalidStrict && isNameInvalidSimple && this.validationMode !== 'strict' && this._variableName !== ''
        ? html`
            <cc-notice intent="warning">
              <div slot="message">${i18n(`cc-env-var-create.errors.invalid-name`, { name: this._variableName })}</div>
            </cc-notice>
          `
        : ''}
      ${isNameInvalidStrict && !isNameInvalidSimple && this.validationMode !== 'strict' && this._variableName !== ''
        ? html`
            <cc-notice intent="info">
              <div slot="message">${i18n(`cc-env-var-create.info.java-prop`, { name: this._variableName })}</div>
            </cc-notice>
          `
        : ''}
      ${isNameAlreadyDefined
        ? html`
            <cc-notice intent="warning">
              <div slot="message">
                ${i18n(`cc-env-var-create.errors.already-defined-name`, { name: this._variableName })}
              </div>
            </cc-notice>
          `
        : ''}
    `;
  }

  static get styles() {
    return [
      linkStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .inline-form {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
        }

        .name {
          flex: 1 1 15em;
        }

        .input-btn {
          display: flex;
          flex: 2 1 27em;
          flex-wrap: wrap;
          gap: 1em 0.5em;
        }

        .value {
          /* 100 seems weird but it is necessary */
          /* it helps to have a button that almost does not grow except when it wraps on its own line */
          flex: 100 1 20em;
        }

        cc-input-text {
          --cc-input-font-family: var(--cc-ff-monospace, monospace);
        }

        cc-button {
          align-self: flex-start;
          flex: 1 1 6em;
          margin-top: auto;
          white-space: nowrap;
        }

        cc-notice {
          margin-top: 1em;
        }

        /* i18n error message may contain <code> tags */

        cc-notice code {
          background-color: var(--cc-color-bg-neutral, #eee);
          border-radius: var(--cc-border-radius-default, 0.25em);
          font-family: var(--cc-ff-monospace, monospace);
          padding: 0.15em 0.3em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-env-var-create', CcEnvVarCreate);
