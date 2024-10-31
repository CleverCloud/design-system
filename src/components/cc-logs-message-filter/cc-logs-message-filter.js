import { css, html, LitElement } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { parseRegex } from '../../lib/regex-parse.js';
import { isStringEmpty } from '../../lib/utils.js';
import { i18n } from '../../translations/translation.js';
import '../cc-input-text/cc-input-text.js';

/**
 * @typedef {import('./cc-logs-message-filter.types.js').LogsMessageFilterValue} LogsMessageFilterValue
 * @typedef {import('../cc-logs/cc-logs.types.js').LogMessageFilterMode} LogMessageFilterMode
 * @typedef {import('lit/directives/ref.js').Ref<HTMLElement>} HTMLElementRef
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 * @typedef {import('lit').PropertyValues<CcLogsMessageFilter>} PropertyValues
 */

/**
 * @fires {CustomEvent<LogsMessageFilterValue>} cc-logs-message-filter:input - Fires when the value changes.
 * @beta
 */
export class CcLogsMessageFilter extends LitElement {
  static get properties() {
    return {
      filter: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {LogsMessageFilterValue} */
    this.filter = { value: '', mode: 'loose' };

    /** @type {boolean} */
    this._isValid = true;
  }

  /* region Private methods */

  _validateMessageFilter() {
    if (isStringEmpty(this.filter.value)) {
      this._isValid = true;
    } else if (this.filter.mode === 'regex') {
      try {
        parseRegex(this.filter.value);
        this._isValid = true;
      } catch (e) {
        this._isValid = false;
      }
    } else {
      this._isValid = true;
    }
  }

  /* endregion */

  /* region Event handlers */

  /**
   * @param {CustomEvent<string>} event
   */
  _onTextFilterInput(event) {
    this.filter = { value: event.detail, mode: this.filter.mode };

    dispatchCustomEvent(this, 'input', this.filter);
  }

  /**
   * @param {Event & {target: HTMLElement & {dataset: {mode: LogMessageFilterMode}}}} e
   */
  _onTextFilterModeClick(e) {
    const mode = e.target.dataset.mode;

    /** @type {LogMessageFilterMode} */
    let newMode;
    if (this.filter.mode === mode) {
      newMode = 'loose';
    } else {
      newMode = mode;
    }

    this.filter = { value: this.filter.value, mode: newMode };

    dispatchCustomEvent(this, 'input', this.filter);
  }

  /**
   * @param {PropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('filter')) {
      this._validateMessageFilter();
    }
  }

  /* endregion */

  render() {
    const strictToggleButtonLabel = i18n('cc-logs-application-view.filter.mode.strict');
    const regexToggleButtonLabel = i18n('cc-logs-application-view.filter.mode.regex');

    return html`
      <div class="wrapper">
        <cc-input-text
          class="logs-filter-input"
          label=${i18n('cc-logs-application-view.filter')}
          .value=${this.filter.value}
          inline
          @cc-input-text:input=${this._onTextFilterInput}
        >
        </cc-input-text>

        <div class="buttons-wrapper">
          ${!this._isValid
            ? html` <div class="error" id="error">${i18n('cc-logs-application-view.filter.bad-format')}</div> `
            : ''}
          <button
            data-mode="strict"
            title="${strictToggleButtonLabel}"
            aria-label="${strictToggleButtonLabel}"
            aria-pressed=${this.filter.mode === 'strict'}
            @click=${this._onTextFilterModeClick}
          >
            “”
          </button>
          <button
            data-mode="regex"
            title="${regexToggleButtonLabel}"
            aria-label="${regexToggleButtonLabel}"
            aria-pressed=${this.filter.mode === 'regex'}
            @click=${this._onTextFilterModeClick}
            aria-describedby="${this._isValid ? '' : 'error'}"
          >
            .*
          </button>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        /* stylelint-disable no-duplicate-selectors */
        :host {
          display: block;
        }

        .wrapper {
          display: flex;
          position: relative;
        }

        cc-input-text {
          --cc-input-font-family: var(--cc-ff-monospace, monospace);

          flex: 1;
        }

        .buttons-wrapper {
          align-items: center;
          display: flex;
          height: 100%;
          position: absolute;
          right: 5px;
          z-index: 2;
        }

        button {
          background: unset;
          background: var(--cc-color-bg-default, #fff);
          border: none;
          border-radius: var(--cc-border-radius-default, 0.15em);
          color: var(--cc-input-btn-icons-color, #595959);
          cursor: pointer;
          display: block;
          flex-shrink: 0;
          font-family: var(--cc-ff-monospace, monospace);
          font-size: unset;
          height: 1.6em;
          margin: 0;
          padding: 0;
          width: 1.6em;
        }

        button:focus {
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
          z-index: 1;
        }

        button:active,
        button:hover {
          box-shadow: none;
          outline: 0;
        }

        button:hover {
          background-color: var(--cc-color-bg-neutral-hovered);
        }

        button:active,
        button[aria-pressed='true'] {
          background-color: var(--cc-color-bg-neutral-active);
          color: var(--cc-color-text-primary);
        }

        button::-moz-focus-inner {
          border: 0;
        }

        button:first-of-type {
          border-bottom-right-radius: 0;
          border-top-right-radius: 0;
        }

        button:last-of-type {
          border-bottom-left-radius: 0;
          border-top-left-radius: 0;
        }

        .error {
          background: var(--cc-color-bg-default, #fff);
          color: var(--cc-color-text-danger);
          margin-right: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-logs-message-filter-beta', CcLogsMessageFilter);
