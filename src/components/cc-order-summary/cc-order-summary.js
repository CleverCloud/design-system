import { css, html, LitElement } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../translations/translation.js';
import '../cc-badge/cc-badge.js';
import '../cc-button/cc-button.js';
import '../cc-img/cc-img.js';

/**
 * @typedef {import('./cc-order-summary.types.js').ConfigurationItem} ConfigurationItem
 * @typedef {import('./cc-order-summary.types.js').OrderSummaryState} OrderSummaryState
 */

/**
 * Displays a summary of a product being currently ordered.
 *
 * The UI is composed of:
 * - global information about the product,
 * - a configuration in the form of a list of label/value,
 * - a button to trigger the creation,
 * - a list of details for additional information.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent} cc-order-summary:create - Fires when the create button is clicked.
 *
 * @cssprop {FontSize} --cc-order-summary-detail-font-size - The font-size for the list of details (defaults: `0.825em`).
 * @cssprop {FontWeight} --cc-order-summary-font-weight - Sets the value of the font weight CSS property (defaults: `600`).
 *
 * @slot detail - a single piece of information displayed under the main part of the UI. You can insert multiple detail items.
 */

export class CcOrderSummary extends LitElement {
  static get properties() {
    return {
      orderSummaryState: { type: Object, attribute: 'order-summary-state' },
    };
  }

  constructor() {
    super();

    /** @type {OrderSummaryState} component main state */
    this.orderSummaryState = null;
  }

  _onCreateClick() {
    dispatchCustomEvent(this, 'create');
  }

  render() {
    if (this.orderSummaryState == null) {
      return '';
    }

    return html`
      <div class="title">${i18n('cc-order-summary.title')}</div>
      <div class="summary">${this._renderSummary()}</div>
      <div class="details-container">
        <slot name="detail"></slot>
      </div>
    `;
  }

  _renderSummary() {
    return html`
      <div class="header">${this._renderSummaryHeader()}</div>
      <div class="body">${this._renderSummaryBody()}</div>
      <div class="footer">
        <cc-button class="btn-submit" primary @cc-button:click=${this._onCreateClick}>
          ${i18n('cc-order-summary.create')}
        </cc-button>
      </div>
    `;
  }

  _renderSummaryHeader() {
    return html` ${this.orderSummaryState.name != null && this.orderSummaryState.name !== ''
      ? html`<div class="header--name">${this.orderSummaryState.name}</div>`
      : html`<div class="header--name header--name-empty">&hellip;</div>`}
    ${this.orderSummaryState.tags?.length > 0
      ? html`
          <div class="header--tags">
            ${this.orderSummaryState.tags.map((tag) => html`<cc-badge intent="info" weight="dimmed">${tag}</cc-badge>`)}
          </div>
        `
      : ``}
    ${this.orderSummaryState.logoUrl != null
      ? html` <div class="header--logo">
          <cc-img class="logo" src="${this.orderSummaryState.logoUrl}" title="${this.orderSummaryState.name}"></cc-img>
        </div>`
      : ``}`;
  }

  _renderSummaryBody() {
    return html`
      ${this.orderSummaryState.configuration?.length > 0
        ? this.orderSummaryState.configuration.map((configItem) => {
            const { label, value } = configItem;
            return html` <div class="body--item">
              <div class="body--label">${label}</div>
              <div class="body--value">${value}</div>
            </div>`;
          })
        : ``}
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }

        /* region blocks */
        .title {
          color: var(--cc-color-text-weak);
          font-weight: var(--cc-order-summary-font-weight, 600);
          margin-block-end: 0.5em;
          padding-inline: 0.125em;
        }

        .summary {
          background-color: var(--cc-color-bg-neutral);
          border: 1px solid var(--cc-color-border-neutral-weak);
          border-radius: var(--cc-border-radius-default);
          display: flex;
          flex-direction: column;
          padding: 1.5em;
          row-gap: 1em;
        }
        /* endregion */

        /* region elements > header */
        .header {
          display: grid;
          gap: 0.25em;
          grid-template-columns: 1fr min-content;
        }

        .header--name {
          font-size: 1.125em;
          font-weight: var(--cc-order-summary-font-weight, 600);
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          word-break: break-word;
        }

        .header--tags {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 0.25em;
          grid-column: 1 / 2;
          grid-row: 2 / 3;
        }

        .header--logo {
          grid-column: 2 / 3;
          grid-row: 1 / 3;
        }
        /* endregion */

        /* region elements > body */
        .body {
          display: flex;
          flex-direction: column;
          row-gap: 0.75em;
        }

        .body--item {
          align-items: baseline;
          column-gap: 0.5em;
          display: flex;
        }

        .body--label {
          color: var(--cc-color-text-weak);
          flex: 1 1 auto;
        }

        .body--value {
          flex: 0 1 auto;
          font-weight: var(--cc-order-summary-font-weight, 600);
        }
        /* endregion */

        /* region elements > details */
        .details-container {
          display: flex;
          flex-direction: column;
          padding-inline: 0.5em;
          row-gap: 0.5em;
        }

        ::slotted([slot='detail']) {
          color: var(--cc-color-text-weak);
          font-size: var(--cc-order-summary-detail-font-size, 0.825em);
          line-height: 1.5;
        }

        ::slotted([slot='detail']:first-child) {
          margin-block-start: 1.5em;
        }

        ::slotted([slot='detail']:last-child) {
          margin-block-end: 1.5em;
        }
        /* endregion */

        /* region elements > misc */
        .logo {
          border: 1px solid var(--cc-color-border-neutral-weak, #e7e7e7);
          border-radius: var(--cc-border-radius-default, 0.25em);
          height: 3em;
          overflow: hidden;
          width: 3em;
        }

        .btn-submit {
          display: block;
          margin-block-start: 0.5em;
        }
        /* endregion */
      `,
    ];
  }
}

// eslint-disable-next-line wc/tag-name-matches-class
window.customElements.define('cc-order-summary-beta', CcOrderSummary);
