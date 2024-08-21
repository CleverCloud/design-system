import { ERROR_TYPES, parseRawJson, toJson } from '@clevercloud/client/esm/utils/env-vars.js';
import { LitElement, css, html } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-notice/cc-notice.js';

/**
 * @type {Array<EnvVar>}
 */
const SKELETON_VARIABLES = [
  { name: 'VARIABLE_ONE', value: '' },
  { name: 'VARIABLE_FOOBAR', value: '' },
  { name: 'VARIABLE_PORT', value: '' },
];

/**
 * @typedef {import('../common.types.js').EnvVarEditorState} EnvVarEditorState
 * @typedef {import('../common.types.js').EnvVarParseError} EnvVarParseError
 * @typedef {import('../common.types.js').EnvVar} EnvVar
 */

/**
 * A high level environment variable editor to create/edit/delete all variables at once as a JSON text (properly parsed with validation and error messages).
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<EnvVar[]>} cc-env-var-editor-json:change - Fires the new list of variables whenever something changes in the list.
 */
export class CcEnvVarEditorJson extends LitElement {
  static get properties() {
    return {
      disabled: { type: Boolean },
      readonly: { type: Boolean },
      state: { type: Object },
      _errors: { type: Array, state: true },
      _formattedErrors: { type: Array, state: true },
      _skeleton: { type: Boolean, state: true },
      _variablesAsJson: { type: String, state: true },
    };
  }

  constructor() {
    super();

    /** @type {boolean} Sets `disabled` attribute on inputs and buttons. */
    this.disabled = false;

    /** @type {boolean} Sets `readonly` attribute on main input and hides buttons. */
    this.readonly = false;

    /** @type {EnvVarEditorState} Sets the variables state. */
    this.state = { type: 'loading' };

    /** @type {EnvVarParseError[]} */
    this._errors = [];

    /** @type {boolean} */
    this._skeleton = false;
  }

  _setErrors(rawErrors) {
    this._errors = rawErrors.map(({ type, name }) => {
      if (type === ERROR_TYPES.INVALID_NAME) {
        return {
          msg: i18n('cc-env-var-editor-json.errors.invalid-name', { name }),
          isWarning: false,
        };
      }
      if (type === ERROR_TYPES.DUPLICATED_NAME) {
        return {
          msg: i18n('cc-env-var-editor-json.errors.duplicated-name', { name }),
          isWarning: false,
        };
      }
      if (type === ERROR_TYPES.INVALID_JSON) {
        return {
          msg: i18n('cc-env-var-editor-json.errors.invalid-json'),
          isWarning: false,
        };
      }
      if (type === ERROR_TYPES.INVALID_JSON_FORMAT) {
        return {
          msg: i18n('cc-env-var-editor-json.errors.invalid-json-format'),
          isWarning: false,
        };
      }
      if (type === ERROR_TYPES.INVALID_JSON_ENTRY) {
        return {
          msg: i18n('cc-env-var-editor-json.errors.invalid-json-entry'),
          isWarning: false,
        };
      }
      if (type === ERROR_TYPES.INVALID_NAME_STRICT) {
        return {
          msg: i18n('cc-env-var-editor-json.errors.invalid-name-strict', { name }),
          isWarning: false,
        };
      }
      if (type === ERROR_TYPES.JAVA_INFO) {
        return {
          msg: i18n('cc-env-var-editor-json.info.java-prop', { name }),
          isWarning: true,
        };
      }
      return { line: '?', msg: i18n('cc-env-var-editor-json.errors.unknown') };
    });
  }

  _onInput({ detail: value }) {
    this._variablesAsJson = value;
    const { variables, errors } = parseRawJson(value, { mode: this.state.validationMode });
    this._setErrors(errors);

    // for INVALID_JSON and INVALID_JSON_FORMAT errors, the parsed 'variables' is an empty array: we don't want to dispatch this case
    const hasJsonError = errors.some(
      ({ type }) => type === ERROR_TYPES.INVALID_JSON || type === ERROR_TYPES.INVALID_JSON_FORMAT,
    );
    if (!hasJsonError) {
      dispatchCustomEvent(this, 'change', variables);
    }
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('state')) {
      this._skeleton = this.state.type === 'loading';
      const vars = this._skeleton ? SKELETON_VARIABLES : this.state.variables;
      const filteredVariables = vars.filter(({ isDeleted }) => !isDeleted);
      this._variablesAsJson = toJson(filteredVariables);
      this._setErrors([]);
    }
  }

  render() {
    return html`
      ${!this.readonly ? html` <div class="example">${i18n('cc-env-var-editor-json.example')}</div> ` : ''}
      <cc-input-text
        label=${i18n('cc-env-var-editor-json.label')}
        hidden-label
        multi
        clipboard
        value=${this._variablesAsJson}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this._skeleton}
        @cc-input-text:input=${this._onInput}
      ></cc-input-text>

      ${this._errors.length > 0
        ? html`
            <div class="error-list">
              ${this._errors.map(
                ({ msg, isWarning }) => html`
                  <cc-notice intent="${!isWarning ? 'warning' : 'info'}">
                    <div slot="message">${msg}</div>
                  </cc-notice>
                `,
              )}
            </div>
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

        :host([hidden]) {
          display: none;
        }

        .error-list {
          display: grid;
          grid-gap: 0.75em;
          margin-top: 1em;
        }

        .example {
          line-height: 1.5;
          padding-bottom: 1em;
        }

        /* i18n error message may contain <code> tags */

        cc-notice code,
        .example code {
          background-color: var(--cc-color-bg-neutral, #eee);
          border-radius: var(--cc-border-radius-default, 0.25em);
          font-family: var(--cc-ff-monospace, monospace);
          padding: 0.15em 0.3em;
        }

        cc-input-text {
          --cc-input-font-family: var(--cc-ff-monospace, monospace);
        }
      `,
    ];
  }
}

window.customElements.define('cc-env-var-editor-json', CcEnvVarEditorJson);
