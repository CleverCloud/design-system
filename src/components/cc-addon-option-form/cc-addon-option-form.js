import { css, html, LitElement } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';
import '../cc-addon-option/cc-addon-option.js';
import '../cc-block/cc-block.js';
import '../cc-button/cc-button.js';

/**
 * @typedef {import('../cc-addon-option/cc-addon-option.js').CcAddonOption} CcAddonOption
 * @typedef {import('../common.types.js').AddonOptionStates} AddonOptionStates
 * @typedef {import('../common.types.js').AddonOption} AddonOption
 * @typedef {import('../common.types.js').AddonOptionWithMetadata} AddonOptionWithMetadata
 */

/**
 * A component that displays a form of `<cc-addon-option>`.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<AddonOptionStates>} cc-addon-option-form:submit - Fires when the form is submitted.
 *
 * @slot description - The description of the add-on and available options.
 */
export class CcAddonOptionForm extends LitElement {
  static get properties() {
    return {
      options: { type: Array },
      heading: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {AddonOptionWithMetadata[]} List of Option object to render. */
    this.options = null;

    /** @type {string} Heading of the whole options form. */
    this.heading = null;

    /** @type {AddonOptionStates} */
    this._optionsStates = {};
  }

  _onSubmit() {
    // If some options were not changed, fill them here
    this.options.forEach((option) => {
      if (this._optionsStates[option.name] == null) {
        this._optionsStates[option.name] = option.enabled || false;
      }
    });

    dispatchCustomEvent(this, 'submit', this._optionsStates);
  }

  /** @param {string} optionName */
  _onOptionToggle(optionName) {
    /** @param {CustomEvent<boolean>} e */
    return (e) => {
      this._optionsStates[optionName] = e.detail;
    };
  }

  render() {
    return html`
      <cc-block>
        <div slot="header-title">${this.heading}</div>
        <div slot="content-body" class="content">
          <slot name="description"></slot>
          ${this.options.map((option) => {
            const enabled = option.enabled || false;
            return html` <cc-addon-option
              heading="${option.title}"
              .icon="${option.icon}"
              logo="${option.logo}"
              ?enabled=${enabled}
              @cc-addon-option:input=${this._onOptionToggle(option.name)}
            >
              ${option.description}
            </cc-addon-option>`;
          })}
        </div>
        <div slot="content-footer" class="button-bar">
          <cc-button primary @cc-button:click=${this._onSubmit}> ${i18n('cc-addon-option-form.confirm')} </cc-button>
        </div>
      </cc-block>
    `;
  }

  static get styles() {
    return [
      linkStyles,
      skeletonStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .content {
          display: grid;
          gap: 1em;
        }

        .button-bar {
          display: grid;
          justify-content: flex-end;
        }

        [name='description'] {
          line-height: 1.5;
        }

        .option-warning {
          display: grid;
          gap: 0.5em;
          grid-template-columns: min-content 1fr;
          text-align: left;
        }

        .option-warning p {
          margin: 0;
        }

        .icon-warning {
          align-self: center;
          color: var(--cc-color-text-warning);

          --cc-icon-size: 1.25em;
        }

        /* Temporary workaround for cc-addon-elasticsearch-options because the skeleton parts should only be the <strong> elements but they are nested inside i18n strings */
        .option-warning .skeleton {
          color: var(--cc-color-text-weak);
        }

        /* Temporary workaround for cc-addon-elasticsearch-options because the skeleton parts should only be the <strong> elements but they are nested inside i18n strings */
        .skeleton strong {
          background-color: #bbb;
          color: transparent;
        }
      `,
    ];
  }
}

window.customElements.define('cc-addon-option-form', CcAddonOptionForm);
