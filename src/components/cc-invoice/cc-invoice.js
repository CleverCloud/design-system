import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { iconRemixFileTextLine as iconFile } from '../../assets/cc-remix.icons.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';
import '../cc-block/cc-block.js';
import '../cc-html-frame/cc-html-frame.js';
import '../cc-icon/cc-icon.js';
import '../cc-notice/cc-notice.js';

/** @type {Partial<InvoiceStateLoaded>} */
const SKELETON_INVOICE = {
  emissionDate: '2020-01-01',
  number: '????????????',
  status: 'PENDING',
  amount: 10.0,
};

/**
 * @typedef {import('./cc-invoice.types.js').InvoiceState} InvoiceState
 */

/**
 * A block component to display an HTML invoice.
 *
 * @cssdisplay block
 */
export class CcInvoice extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {InvoiceState} Sets the invoice state. */
    this.state = { type: 'loading' };
  }

  render() {
    const invoiceNumber = this.state.number;
    const skeletonNumber = invoiceNumber == null;
    const number = skeletonNumber ? SKELETON_INVOICE.number : invoiceNumber;
    const skeleton = skeletonNumber || this.state.type === 'loading';
    const invoice = skeleton ? SKELETON_INVOICE : this.state;
    const title = `${i18n('cc-invoice.title')} ${number}`;

    return html`
      <cc-block .icon=${iconFile} class=${classMap({ 'has-errors': this.state.type === 'error' })}>
        <div slot="title">
          ${skeletonNumber ? html` ${i18n('cc-invoice.title')} <span class="skeleton">${number}</span> ` : title}
        </div>

        ${this.state.type === 'error'
          ? html` <cc-notice intent="warning" message="${i18n('cc-invoice.error')}"></cc-notice> `
          : ''}
        ${this.state.type !== 'error'
          ? html`
              <div slot="button">${ccLink(invoice.downloadUrl, i18n('cc-invoice.download-pdf'), skeleton)}</div>
              <div class="info">
                <em class=${classMap({ skeleton })}>
                  ${i18n('cc-invoice.info', { date: invoice.emissionDate, amount: invoice.amount })}
                </em>
              </div>
              <cc-html-frame class="frame" ?loading="${skeleton}" iframe-title="${title}">
                ${invoice.invoiceHtml != null ? unsafeHTML(`<template>${invoice.invoiceHtml}</template>`) : ''}
              </cc-html-frame>
            `
          : ''}
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

        [slot='button'] {
          align-self: start;
          margin-left: 1em;
        }

        cc-block {
          --cc-icon-color: var(--cc-color-text-primary);
        }

        .has-errors {
          --cc-skeleton-state: paused;
        }

        .skeleton {
          background-color: #bbb;
        }

        .info,
        .frame {
          justify-self: center;
        }

        .frame {
          /* height and max-width are roughly set to have a standard letter / A4 paper ratio */
          box-shadow: 0 0 0.5em rgb(0 0 0 / 40%);
          height: 31cm;
          max-width: 22cm;
          width: 100%;
        }
      `,
    ];
  }
}

window.customElements.define('cc-invoice', CcInvoice);
