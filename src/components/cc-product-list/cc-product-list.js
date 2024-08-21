import { css, html, LitElement } from 'lit';
import { i18n } from '../../lib/i18n/i18n.js';
import { accessibilityStyles } from '../../styles/accessibility.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-badge/cc-badge.js';
import '../cc-icon/cc-icon.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-product-card/cc-product-card.js';
import { ProductsController } from './products-controller.js';

/**
 * @typedef {import('lit').PropertyValues<CcProductList>} CcProductListPropertyValues
 * @typedef {import('./cc-product-list.types.js').ProductsCategory} ProductsCategory
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 */

/**
 * A component that displays a list of products in sections and allows to search and filter through it.
 *
 * @cssdisplay block
 */
export class CcProductList extends LitElement {
  static get properties() {
    return {
      categoryFilter: { type: String, attribute: 'category-filter' },
      productsByCategories: { type: Array, attribute: 'products-by-categories' },
      textFilter: { type: String, attribute: 'text-filter' },
    };
  }

  constructor() {
    super();

    /** @type {string|null} a string to prefilter by a given category */
    this.categoryFilter = null;

    /** @type {ProductsCategory[]} the list of products in their respective categories.  */
    this.productsByCategories = [];

    /** @type {string} a string to presearch through the list */
    this.textFilter = '';

    /** @type {ProductsController} */
    this._productsCrtl = new ProductsController(this);
  }

  /**
   * @param {Event & { target: HTMLInputElement }} e
   */
  _onCategoryChange(e) {
    this.categoryFilter = e.target.value;
  }

  /**
   * @param {Object} event
   * @param {string} event.detail
   */
  _onSearchInput({ detail: value }) {
    this.textFilter = value;
  }

  /**
   * @param {CcProductListPropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('productsByCategories')) {
      this._productsCrtl.productsByCategories = this.productsByCategories;
    }

    if (changedProperties.has('categoryFilter')) {
      this._productsCrtl.toggleCategoryFilter(this.categoryFilter);
    }
    if (changedProperties.has('textFilter')) {
      this._productsCrtl.textFilter = this.textFilter;
    }
  }

  render() {
    const categories = this._productsCrtl.getCategories();

    return html`
      <div class="search-form">
        <cc-input-text
          label="${i18n('cc-product-list.search-label')}"
          value="${this.textFilter ?? ''}"
          @cc-input-text:input="${this._onSearchInput}"
        ></cc-input-text>
        <fieldset class="category-filter">
          <legend class="visually-hidden">${i18n('cc-product-list.filter-category-legend')}</legend>
          ${this._renderCategory(
            i18n('cc-product-list.all-label'),
            'all',
            this._productsCrtl.getCurrentCategory() === 'all',
          )}
          ${categories.map((c) => this._renderCategory(c.categoryName, c.categoryName, c.toggled))}
        </fieldset>
      </div>
      <div class="products">${this._renderProductsByCategories()}</div>
    `;
  }

  /**
   * @param {string} label
   * @param {string} value
   * @param {boolean} isToggled
   * @returns {TemplateResult}
   */
  _renderCategory(label, value, isToggled) {
    const id = label.replace(' ', '-');
    return html`
      <input
        type="radio"
        id="${id}"
        .value=${value}
        name="category-filter"
        class="visually-hidden"
        @change=${this._onCategoryChange}
      />
      <label for="${id}">
        <cc-badge weight="${isToggled ? 'dimmed' : 'outlined'}" intent="info">${label} </cc-badge>
      </label>
    `;
  }

  _renderProductsByCategories() {
    const productsByCategories = this._productsCrtl.getFilteredProductsByCategories();

    if (productsByCategories.length === 0) {
      return html` <p class="search-empty">${i18n('cc-product-list.search-empty')}</p> `;
    }

    return productsByCategories.map(
      (productsCategory) => html`
        <div class="category">
          <div class="category-title">
            ${productsCategory.icon != null
              ? html` <cc-icon .icon="${productsCategory.icon}" class="category-icon"></cc-icon> `
              : ''}
            <div class="category-name">${productsCategory.categoryName}</div>
          </div>
          <div class="category-products">
            ${productsCategory.products.map(
              (p) => html`
                <cc-product-card
                  name="${p.name}"
                  description="${p.description}"
                  .keywords="${p.keywords ?? []}"
                  icon-url="${p.iconUrl}"
                  url="${p.url}"
                ></cc-product-card>
              `,
            )}
          </div>
        </div>
      `,
    );
  }

  static get styles() {
    return [
      accessibilityStyles,
      linkStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .category-name {
          font-size: 1.75em;
          font-weight: bold;
        }

        .category-products {
          display: grid;
          gap: 1em;
          grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
        }

        .category-title {
          align-items: center;
          display: flex;
          gap: 0.5em;
          margin: 2.5em 0 1.5em;
        }

        .category-filter {
          border: none;
          display: flex;
          flex-wrap: wrap;
          gap: 0.25em;
          padding: 0;
        }

        label:hover {
          cursor: pointer;

          --cc-color-bg-primary: var(--cc-color-text-primary-strong);
        }

        input[type='radio']:focus-visible + label {
          /**
    * FIXME:
    * remove this once the "border-radius" of the "cc-badge" component is set on its host instead of its wrapper
    * see https://github.com/CleverCloud/clever-components/issues/990.
    */
          border-radius: 1em;
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .category-icon {
          height: 1.75em;
          width: 1.75em;
        }

        .search-empty {
          font-style: italic;
          margin: 1.5em 0 0;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-product-list', CcProductList);
