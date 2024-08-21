import { css, html, LitElement } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../translations/translation.js';
import '../cc-icon/cc-icon.js';
import '../cc-img/cc-img.js';
import '../cc-toggle/cc-toggle.js';

/**
 * @typedef {import('../common.types.js').IconModel} IconModel
 */

/**
 * A component that allows to enable or disable an add-on option.
 *
 * ## Technical details
 *
 * * If you want to display a warning in the option, add the `option-warning` class to an HTML element. It will be displayed with a custom color and in italic.
 *
 * @cssdisplay grid
 *
 * @fires {CustomEvent<boolean>} cc-addon-option:input - Fires when the option is enabled or disabled.
 *
 * @slot - The content of the option's description (text or HTML).
 */
export class CcAddonOption extends LitElement {
  static get properties() {
    return {
      enabled: { type: Boolean, reflect: true },
      icon: { type: Object },
      logo: { type: String },
      title: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {boolean} Enable the option by default. */
    this.enabled = false;

    /** @type {IconModel|null} The logo icon of the option. Has priority over the logo property. */
    this.icon = null;

    /** @type {string|null} The logo URL of the option. */
    this.logo = null;

    /** @type {string|null} Title of the option. */
    this.title = null;
  }

  _onToggleOption({ detail: enabled }) {
    this.enabled = enabled === 'ENABLED';
    dispatchCustomEvent(this, 'input', this.enabled);
  }

  render() {
    const choices = [
      { label: i18n('cc-addon-option.disabled'), value: 'DISABLED' },
      { label: i18n('cc-addon-option.enabled'), value: 'ENABLED' },
    ];

    return html`
      ${this.icon != null ? html` <cc-icon class="icon" .icon=${this.icon}></cc-icon> ` : ''}
      ${this.logo != null && this.icon == null ? html` <cc-img class="logo" src=${this.logo}></cc-img> ` : ''}
      <div class="option-main">
        <div class="option-name">${this.title}</div>
        <slot class="option-details"></slot>
        <cc-toggle
          .choices=${choices}
          value=${this.enabled ? 'ENABLED' : 'DISABLED'}
          @cc-toggle:input=${this._onToggleOption}
        ></cc-toggle>
      </div>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          background-color: var(--cc-color-bg-default, #fff);
          border-radius: var(--cc-border-radius-default, 0.25em);
          display: grid;
          grid-gap: 1em;
          grid-template-columns: min-content 1fr;
          padding: 1em;
        }

        ::slotted(.option-warning) {
          color: var(--cc-color-text-weak);
          font-style: italic;
        }

        .option-main {
          display: grid;
          grid-gap: 0.5em;
        }

        .option-name {
          font-weight: bold;
          line-height: 1.6;
          min-height: 1.6em;
        }

        :host(:not([enabled])) {
          background-color: var(--cc-color-bg-neutral);
          border: 2px solid var(--cc-color-border-neutral-weak, #eee);
        }

        :host([enabled]) {
          border: 2px solid var(--cc-color-bg-success, #000);
        }

        .logo {
          border-radius: var(--cc-border-radius-default, 0.25em);
          height: 1.6em;
          width: 1.6em;
        }

        .icon {
          --cc-icon-color: #012a51;
          --cc-icon-size: 28px;
        }

        cc-toggle {
          justify-self: end;
          margin-top: 0.5em;
        }

        :host([enabled]) cc-toggle {
          --cc-toggle-color: var(--cc-color-bg-success, #000);
        }

        .option-details {
          line-height: 1.5;
        }
      `,
    ];
  }
}

window.customElements.define('cc-addon-option', CcAddonOption);
