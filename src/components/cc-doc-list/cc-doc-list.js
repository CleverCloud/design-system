import { css, html, LitElement } from 'lit';
import { i18n } from '../../lib/i18n/i18n.js';
import '../cc-doc-card/cc-doc-card.js';
import '../cc-notice/cc-notice.js';

const DOC_SKELETON_NUMBER = 9;

/**
 * @typedef {import('./cc-doc-list.types.js').DocListState} DocListState
 */

/**
 * A component displaying a list of documentation cards.
 *
 * @cssdisplay block
 */
export class CcDocList extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {DocListState} Sets the state of the component */
    this.state = { type: 'loading' };
  }

  render() {
    if (this.state.type === 'error') {
      return html` <cc-notice intent="warning" message="${i18n('cc-doc-list.error')}"></cc-notice> `;
    }

    return html`
      <div class="doc-wrapper">
        ${this.state.type === 'loading'
          ? html` ${new Array(DOC_SKELETON_NUMBER).fill(html` <cc-doc-card></cc-doc-card> `)} `
          : ''}
        ${this.state.type === 'loaded'
          ? html`
              ${this.state.docs.map(
                (docCard) => html` <cc-doc-card .state=${{ type: 'loaded', ...docCard }}></cc-doc-card> `,
              )}
            `
          : ''}
      </div>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }

        .doc-wrapper {
          display: grid;
          gap: 1em;
          grid-template-columns: repeat(auto-fit, minmax(20em, 1fr));
        }
      `,
    ];
  }
}

// DOCS: 11. Define the custom element

window.customElements.define('cc-doc-list', CcDocList);
