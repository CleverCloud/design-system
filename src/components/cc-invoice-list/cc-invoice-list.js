import { css, html, LitElement } from 'lit';
import { ResizeController } from '../../controllers/resize-controller.js';
import { sortBy, unique } from '../../lib/utils.js';
import { i18n } from '../../translations/translation.js';
import '../cc-block-section/cc-block-section.js';
import '../cc-block/cc-block.js';
import '../cc-button/cc-button.js';
import { PENDING_STATUSES, PROCESSED_STATUSES, PROCESSING_STATUS } from '../cc-invoice-table/cc-invoice-table.js';
import '../cc-notice/cc-notice.js';
import '../cc-select/cc-select.js';
import '../cc-toggle/cc-toggle.js';

const BREAKPOINTS = [520];

/**
 * @param {string} dateString
 * @return {string} year as a string
 */
function getYearAsString(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  return String(year);
}

/**
 * @param {string[]} numbersAsStrings
 * @returns {string} the max number as a string
 */
function maxFromStrings(numbersAsStrings) {
  const numbers = numbersAsStrings.map((s) => Number(s));
  const max = Math.max(...numbers);
  return String(max);
}

/**
 * @typedef {import('./cc-invoice-list.types.js').InvoiceListState} InvoiceListState
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 */

/**
 * A component to display a list of invoices in paginated categories.
 *
 * @cssdisplay block
 */
export class CcInvoiceList extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
      _yearFilter: { type: String, state: true },
    };
  }

  constructor() {
    super();

    /** @type {InvoiceListState} Sets the invoices state. */
    this.state = { type: 'loading' };

    /** @type {string|null} */
    this._yearFilter = null;

    new ResizeController(this, {
      widthBreakpoints: BREAKPOINTS,
    });
  }

  /**
   * @param {Event & { detail: string }} event
   * @private
   */
  _onYearFilterValue({ detail: year }) {
    this._yearFilter = year;
  }

  render() {
    if (this.state.type === 'error') {
      return this._renderView(html`
        <cc-notice intent="warning" message="${i18n('cc-invoice-list.error')}"></cc-notice>
      `);
    }

    if (this.state.type === 'loading') {
      return this._renderView(html`
        <cc-block-section>
          <div slot="title">${i18n('cc-invoice-list.pending')}</div>
          <cc-invoice-table></cc-invoice-table>
        </cc-block-section>

        <cc-block-section>
          <div slot="title">${i18n('cc-invoice-list.processed')}</div>
          <cc-invoice-table></cc-invoice-table>
        </cc-block-section>
      `);
    }

    const pendingInvoicesTableState = {
      type: 'loaded',
      invoices: this.state.invoices.filter((i) => PENDING_STATUSES.includes(i.status)),
    };
    const processingInvoicesTableState = {
      type: 'loaded',
      invoices: this.state.invoices.filter((i) => i.status === PROCESSING_STATUS),
    };
    const processedInvoicesTableState = {
      type: 'loaded',
      invoices: this.state.invoices.filter((i) => PROCESSED_STATUSES.includes(i.status)),
    };

    const processedInvoicesYears = processedInvoicesTableState.invoices
      .map((invoice) => getYearAsString(invoice.emissionDate))
      .flatMap(unique);

    const yearChoices = processedInvoicesYears.map((year) => ({ label: year, value: year })).sort(sortBy('label'));

    const yearFilter = this._yearFilter == null ? maxFromStrings(processedInvoicesYears) : this._yearFilter;

    const filteredProcessedInvoiceTableState = {
      type: 'loaded',
      invoices: processedInvoicesTableState.invoices.filter((i) => getYearAsString(i.emissionDate) === yearFilter),
    };

    const hasYearSelector = filteredProcessedInvoiceTableState.invoices.length > 0 && yearChoices.length > 1;

    return this._renderView(html`
      <cc-block-section>
        <div slot="title">${i18n('cc-invoice-list.pending')}</div>
        ${pendingInvoicesTableState.invoices.length > 0
          ? html` <cc-invoice-table .state=${pendingInvoicesTableState}></cc-invoice-table> `
          : ''}
        ${pendingInvoicesTableState.invoices.length === 0
          ? html` <div class="empty-msg">${i18n('cc-invoice-list.pending.no-invoices')}</div> `
          : ''}
      </cc-block-section>

      ${processingInvoicesTableState.invoices.length > 0
        ? html`
            <cc-block-section>
              <div slot="title">${i18n('cc-invoice-list.processing')}</div>
              <cc-invoice-table .state=${processingInvoicesTableState}></cc-invoice-table>
            </cc-block-section>
          `
        : ''}

      <cc-block-section>
        <div slot="title">${i18n('cc-invoice-list.processed')}</div>
        ${hasYearSelector
          ? html`
              <cc-toggle
                legend=${i18n('cc-invoice-list.year')}
                .choices=${yearChoices}
                value=${yearFilter}
                inline
                @cc-toggle:input=${this._onYearFilterValue}
              ></cc-toggle>
              <cc-select
                label=${i18n('cc-invoice-list.year')}
                .options=${yearChoices}
                value=${yearFilter}
                inline
                @cc-select:input=${this._onYearFilterValue}
              ></cc-select>
            `
          : ''}
        ${filteredProcessedInvoiceTableState.invoices.length > 0
          ? html` <cc-invoice-table .state=${filteredProcessedInvoiceTableState}></cc-invoice-table> `
          : ''}
        ${filteredProcessedInvoiceTableState.invoices.length === 0
          ? html` <div class="empty-msg ">${i18n('cc-invoice-list.processed.no-invoices')}</div> `
          : ''}
      </cc-block-section>
    `);
  }

  /**
   * @param {TemplateResult} content
   * @private
   */
  _renderView(content) {
    return html`
      <cc-block>
        <div slot="title">${i18n('cc-invoice-list.title')}</div>
        ${content}
      </cc-block>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }

        cc-toggle {
          justify-self: start;
        }

        :host([w-lt-520]) cc-toggle {
          display: none;
        }

        :host([w-gte-520]) cc-select {
          display: none;
        }

        cc-select {
          width: max-content;
        }

        .empty-msg {
          color: var(--cc-color-text-weak);
          font-style: italic;
        }
      `,
    ];
  }
}

window.customElements.define('cc-invoice-list', CcInvoiceList);
