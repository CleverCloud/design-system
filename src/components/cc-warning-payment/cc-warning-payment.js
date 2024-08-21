import { ERROR_TYPES } from '@clevercloud/client/esm/utils/payment.js';
import { css, html, LitElement } from 'lit';
import { i18n } from '../../lib/i18n/i18n.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-notice/cc-notice.js';

/**
 * @typedef {import('./cc-warning-payment.types.js').PaymentMethodError} PaymentMethodError
 * @typedef {import('./cc-warning-payment.types.js').PaymentWarningModeType} PaymentWarningModeType
 */

/**
 * A component to display a warning block with details about payment methods errors.
 *
 * @cssdisplay block
 */
export class CcWarningPayment extends LitElement {
  static get properties() {
    return {
      errors: { type: Array },
      mode: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {PaymentMethodError[]} Sets the list of payment method errors with type (and optional orga name and billing link). */
    this.errors = [{ type: ERROR_TYPES.NO_PAYMENT_METHOD }];

    /** @type {PaymentWarningModeType} Sets the mode, depending on where the warning is used, the level of details is not the same. */
    this.mode = 'billing';
  }

  /**
   * @param {PaymentMethodError} error
   */
  _getOrgaError({ type }) {
    if (type === ERROR_TYPES.NO_PAYMENT_METHOD) {
      return {
        title: i18n('cc-payment-warning.orga.no-payment-method.title'),
        error: i18n('cc-payment-warning.orga.no-payment-method'),
      };
    }
    if (type === ERROR_TYPES.NO_DEFAULT_PAYMENT_METHOD) {
      return {
        title: i18n('cc-payment-warning.orga.no-default-payment-method.title'),
        error: i18n('cc-payment-warning.orga.no-default-payment-method'),
      };
    }
    if (type === ERROR_TYPES.DEFAULT_PAYMENT_METHOD_IS_EXPIRED) {
      return {
        title: i18n('cc-payment-warning.orga.default-payment-method-is-expired.title'),
        error: i18n('cc-payment-warning.orga.default-payment-method-is-expired'),
      };
    }
  }

  render() {
    const { title, error } =
      this.mode === 'overview' || this.mode === 'billing' ? this._getOrgaError(this.errors[0]) : '';
    const link = this.mode === 'overview' ? i18n('cc-payment-warning.billing-page-link', this.errors[0]) : '';

    return html`
      ${this.mode === 'home'
        ? html`
            <cc-notice .heading="${i18n('cc-payment-warning.home.title')}" intent="warning">
              <div slot="message" class="error-container">
                <span>${i18n('cc-payment-warning.home', { orgaCount: this.errors.length })}</span>
                <ul>
                  ${this.errors.map((error) => html` <li>${this._renderHomeItem(error)}</li> `)}
                </ul>
              </div>
            </cc-notice>
          `
        : ''}
      ${this.mode === 'overview' || this.mode === 'billing'
        ? html`
            <cc-notice .heading="${title}" intent="warning">
              <div slot="message">${error} ${link}</div>
            </cc-notice>
          `
        : ''}
    `;
  }

  /**
   * @param {PaymentMethodError} error
   */
  _renderHomeItem({ type, orgaName, orgaBillingLink }) {
    if (type === ERROR_TYPES.NO_PAYMENT_METHOD) {
      return html`
        ${i18n('cc-payment-warning.generic.no-payment-method', { orgaName })}
        ${i18n('cc-payment-warning.billing-page-link', { orgaName, orgaBillingLink })}
      `;
    }
    if (type === ERROR_TYPES.NO_DEFAULT_PAYMENT_METHOD) {
      return html`
        ${i18n('cc-payment-warning.generic.no-default-payment-method', { orgaName })}
        ${i18n('cc-payment-warning.billing-page-link', { orgaName, orgaBillingLink })}
      `;
    }
    if (type === ERROR_TYPES.DEFAULT_PAYMENT_METHOD_IS_EXPIRED) {
      return html`
        ${i18n('cc-payment-warning.generic.default-payment-method-is-expired', { orgaName })}
        ${i18n('cc-payment-warning.billing-page-link', { orgaName, orgaBillingLink })}
      `;
    }
  }

  static get styles() {
    return [
      // language=CSS
      linkStyles,
      css`
        :host {
          display: block;
        }

        ul {
          margin: 0.5em 0 0 1.5em;
          padding: 0;
        }

        li {
          margin-top: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-warning-payment', CcWarningPayment);
