import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { iconRemixFileTextLine as iconFile } from '../../assets/cc-remix.icons.js';
import { ResizeController } from '../../controllers/resize-controller.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { sortBy } from '../../lib/utils.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-icon/cc-icon.js';

// TODO: Move to clever-client
export const PENDING_STATUSES = ['PENDING', 'PAYMENTHELD', 'WONTPAY'];
export const PROCESSING_STATUS = 'PROCESSING';
export const PROCESSED_STATUSES = ['PAID', 'CANCELED', 'REFUNDED'];

/** @type {Invoice[]} */
const SKELETON_INVOICES = [
  {
    emissionDate: '2020-01-01',
    number: '????????????',
    type: 'INVOICE',
    status: 'PENDING',
    total: { currency: 'EUR', amount: 10.0 },
    downloadUrl: '',
    paymentUrl: '',
    invoiceHtml: '',
  },
  {
    emissionDate: '2020-02-01',
    number: '????????????',
    type: 'INVOICE',
    status: 'PENDING',
    total: { currency: 'EUR', amount: 200.0 },
    downloadUrl: '',
    paymentUrl: '',
    invoiceHtml: '',
  },
  {
    emissionDate: '2020-03-01',
    number: '????????????',
    type: 'INVOICE',
    status: 'PENDING',
    total: { currency: 'EUR', amount: 3000.0 },
    downloadUrl: '',
    paymentUrl: '',
    invoiceHtml: '',
  },
];

/**
 * @typedef {import('./cc-invoice-table.types.js').InvoiceTableState} InvoiceTableState
 * @typedef {import('../common.types.js').Invoice} Invoice
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 */

/**
 * A table component to display a list of invoices.
 *
 * @cssdisplay block
 */
export class CcInvoiceTable extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {InvoiceTableState} Sets the state of the component */
    this.state = { type: 'loading' };

    /** @type {ResizeController} */
    this._resizeController = new ResizeController(this);
  }

  /**
   * @param {Invoice[]} invoices
   * @returns {Invoice[]} formatted invoices
   * @private
   */
  _formatInvoices(invoices) {
    return invoices
      .map((invoice) => {
        const sign = invoice.type === 'CREDITNOTE' ? -1 : 1;
        return {
          ...invoice,
          total: {
            ...invoice.total,
            amount: invoice.total.amount * sign,
          },
        };
      })
      .sort(sortBy('emissionDate', true));
  }

  render() {
    // NOTE: This value is arbitrary, we don't have a better solution for now
    // It's a bit more than the width of the table in french (which is the largest) and with both links (download and pay)
    // The table width is mostly stable since the width of the amount is fixed and the rest is almost always the same number of characters
    const isBig = this._resizeController.width > 700;
    const skeleton = this.state.type === 'loading';
    const invoices =
      this.state.type === 'loaded'
        ? this._formatInvoices(this.state.invoices)
        : this._formatInvoices(SKELETON_INVOICES);

    return isBig ? this._renderTable(skeleton, invoices) : this._renderList(skeleton, invoices);
  }

  /**
   * @param {boolean} skeleton
   * @param {Invoice[]} invoiceList
   * @returns {TemplateResult}
   * @private
   */
  _renderTable(skeleton, invoiceList) {
    return html`
      <table>
        <tr>
          <th>${i18n('cc-invoice-table.date.emission')}</th>
          <th>${i18n('cc-invoice-table.number')}</th>
          <th class="number">${i18n('cc-invoice-table.total.label')}</th>
          <th></th>
        </tr>
        ${invoiceList.map(
          (invoice) => html`
            <tr>
              <td>
                <span class="${classMap({ skeleton })}"
                  >${i18n('cc-invoice-table.date.value', { date: invoice.emissionDate })}</span
                >
              </td>
              <td>
                <span class="${classMap({ skeleton })}">${invoice.number}</span>
              </td>
              <td class="number">
                <code class="${classMap({ skeleton, 'credit-note': invoice.type === 'CREDITNOTE' })}">
                  ${i18n('cc-invoice-table.total.value', { amount: invoice.total.amount })}
                </code>
              </td>
              <td>${this._renderLinks(skeleton, invoice)}</td>
            </tr>
          `,
        )}
      </table>
    `;
  }

  /**
   * @param {boolean} skeleton
   * @param {Invoice[]} invoiceList
   * @returns {TemplateResult}
   * @private
   */
  _renderList(skeleton, invoiceList) {
    return html`
      <div class="invoice-list">
        ${invoiceList.map(
          (invoice) => html`
            <div class="invoice">
              <cc-icon class="invoice-icon" size="lg" .icon=${iconFile}></cc-icon>
              <div class="invoice-text ${classMap({ skeleton })}">
                ${i18n('cc-invoice-table.text', {
                  number: invoice.number,
                  date: invoice.emissionDate,
                  amount: invoice.total.amount,
                })}
                <br />
                ${this._renderLinks(skeleton, invoice)}
              </div>
            </div>
          `,
        )}
      </div>
    `;
  }

  /**
   * @param {boolean} skeleton
   * @param {Invoice} invoice
   * @returns {TemplateResult}
   * @private
   */
  _renderLinks(skeleton, invoice) {
    return html`
      <div class="links">
        ${ccLink(invoice.downloadUrl, i18n('cc-invoice-table.open-pdf'), skeleton)}
        ${PENDING_STATUSES.includes(invoice.status)
          ? html` ${ccLink(invoice.paymentUrl, i18n('cc-invoice-table.pay'), skeleton)} `
          : ''}
      </div>
    `;
  }

  static get styles() {
    return [
      skeletonStyles,
      linkStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        /* region COMMON */
        /* we should use a class (something like "number-value") but it's not possible right now in i18n */

        code {
          font-family: var(--cc-ff-monospace, monospace);
        }

        .credit-note {
          font-style: italic;
        }

        .cc-link {
          white-space: nowrap;
        }

        .links {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        /* endregion */

        /* region SMALL */

        .invoice-list {
          display: grid;
          gap: 1.5em;
        }

        .invoice {
          display: flex;
          line-height: 1.5em;
        }

        .invoice-icon,
        .invoice-text {
          margin-right: 0.5em;
        }

        .invoice-icon {
          --cc-icon-color: var(--cc-color-text-primary);

          flex: 0 0 auto;
        }

        .invoice-text {
          color: var(--cc-color-text-weak);
        }

        .invoice-text code,
        .invoice-text strong {
          color: var(--cc-color-text-strongest);
          font-weight: bold;
          white-space: nowrap;
        }

        .invoice-list .skeleton code,
        .invoice-list .skeleton strong {
          background-color: #bbb;
          color: transparent;
        }
        /* endregion */

        /* region BIG */

        table {
          border-collapse: collapse;
          border-radius: 5px;
          overflow: hidden;
        }

        th,
        td {
          padding: 0.5em 1em;
          text-align: left;
        }

        th {
          background-color: var(--cc-color-bg-neutral-alt, #eee);
          color: var(--cc-color-text-strongest);
        }

        td {
          background-color: var(--cc-color-bg-neutral);
          color: var(--cc-color-text-normal);
        }

        tr:not(:last-child) td {
          border-bottom: 1px solid var(--cc-color-border-neutral-weak, #eee);
        }

        /* applied on th and td */

        .number {
          text-align: right;
        }

        td.number {
          /* "-ø###,###.##" OR "-### ###,## ø" => 13ch */
          min-width: 13ch;
        }

        tr:hover td {
          background-color: var(--cc-color-bg-neutral-hovered, #f9f9f9);
        }

        table .skeleton {
          background-color: #bbb;
        }

        /* endregion */
      `,
    ];
  }
}

window.customElements.define('cc-invoice-table', CcInvoiceTable);
