import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { i18n } from '../../translations/translation.js';
import '../cc-badge/cc-badge.js';
import '../cc-button/cc-button.js';
import '../cc-img/cc-img.js';

/**
 * @typedef {import('./cc-product-card.types.js').Keyword} Keyword
 */

/**
 * A component displaying some information about a product in a card.
 *
 * @cssdisplay block
 *
 */
export class CcProductCard extends LitElement {
  static get properties() {
    return {
      description: { type: String },
      iconUrl: { type: String, attribute: 'icon-url' },
      keywords: { type: Array },
      name: { type: String },
      url: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {string|null} The description of the product */
    this.description = null;

    /** @type {string|null} The icon url of the product */
    this.iconUrl = null;

    /** @type {Keyword[]} The keywords representing the product */
    this.keywords = [];

    /** @type {string|null} The name of the product */
    this.name = null;

    /** @type {string|null} The url where the user will be redirected when the product is selected  */
    this.url = null;
  }

  _areKeywordsAllHidden() {
    return this.keywords.every((k) => k.hidden);
  }

  render() {
    const hasKeywords = this.keywords.length > 0 && !this._areKeywordsAllHidden();

    // language=HTML
    return html`
      <div class="wrapper ${classMap({ 'wrapper--no-keywords': !hasKeywords })}">
        <cc-img src="${this.iconUrl}"></cc-img>
        <a class="name" href="${this.url}" title="${i18n('cc-product-card.select', { name: this.name })}">
          ${this.name}
        </a>
        ${hasKeywords
          ? html`
              <ul class="keywords">
                ${this.keywords.map((keyword) => {
                  return !keyword.hidden
                    ? html`
                        <li>
                          <cc-badge class="keyword-badge">${keyword.value}</cc-badge>
                        </li>
                      `
                    : '';
                })}
              </ul>
            `
          : ''}
        <p class="description">${this.description}</p>
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

        /* region RESET */

        p {
          margin: 0;
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        /* endregion */

        /* region wrapper */

        .wrapper {
          background-color: var(--cc-color-bg-default, #fff);
          border: 2px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          box-sizing: border-box;
          display: grid;
          gap: 0.75em;
          grid-template-areas:
            'icon name'
            'keywords keywords'
            'description description';
          grid-template-columns: min-content 1fr;
          grid-template-rows: min-content max-content auto;
          height: 100%;
          padding: 1em;
          position: relative;
        }

        .wrapper:hover {
          border-color: var(--cc-color-border-neutral-focused, #777);
          cursor: pointer;
        }

        .wrapper:focus-within {
          border: 2px solid var(--cc-color-border-neutral-focused, #777);
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .wrapper.wrapper--no-keywords {
          grid-template-areas:
            'icon name'
            'description description';
          grid-template-rows: min-content auto;
        }

        /* endregion */

        /* region grid-items */

        cc-img {
          border-radius: var(--cc-border-radius-default, 0.25em);
          height: 2em;
          width: 2em;
        }

        .name {
          color: var(--cc-color-text-strongest, #000);
          font-size: 1.75em;
          text-decoration: none;
        }

        .name::after {
          content: '';
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }

        .name:focus {
          outline: none;
        }

        .keyword-badge {
          font-size: 0.85em;
        }

        .keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          grid-area: keywords;
        }

        .description {
          color: var(--cc-color-text-weak, #333);
          font-size: 0.8em;
          grid-area: description;
          line-height: 1.5em;
        }

        /*  endregion */
      `,
    ];
  }
}

window.customElements.define('cc-product-card', CcProductCard);
