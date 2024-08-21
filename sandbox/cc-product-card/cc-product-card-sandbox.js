import { css, html, LitElement } from 'lit';
import '../../src/components/cc-ansi-palette/cc-ansi-palette.js';
import '../../src/components/cc-block/cc-block.js';
import '../../src/components/cc-input-number/cc-input-number.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import '../../src/components/cc-product-card/cc-product-card.js';
import { generateRandomKeywords } from '../../src/components/cc-product-card/generate-random-keywords.js';
import '../../src/components/cc-select/cc-select.js';
import '../../src/components/cc-toggle/cc-toggle.js';
import { sandboxStyles } from '../sandbox-styles.js';

const DEFAULT_PRODUCT = {
  iconUrl: 'https://placekitten.com/202/202',
  name: 'My product',
  description: 'My description',
  keywords: generateRandomKeywords(3),
};

const API_PRODUCTS = await Promise.all([
  fetch('https://api.clever-cloud.com/v2/products/instances').then((r) => r.json()),
  fetch('https://api.clever-cloud.com/v2/products/addonproviders').then((r) => r.json()),
]).then(([instances, addons]) => [...instances, ...addons]);

const API_PRODUCTS_SELECT = [
  {
    label: 'default',
    value: 'default',
  },
  ...API_PRODUCTS.map((p) => ({ label: p.name, value: p.name })),
];

export class CcProductCardSandbox extends LitElement {
  static get properties() {
    return {
      _currentProduct: { type: Object },
      _componentWidth: { type: Number },
    };
  }

  constructor() {
    super();

    this._currentProduct = DEFAULT_PRODUCT;
    this._componentWidth = 20;
  }

  _onSelect({ detail: productName }) {
    if (productName === 'default') {
      this._currentProduct = DEFAULT_PRODUCT;
      return;
    }

    const product = API_PRODUCTS.find((p) => p.name === productName);
    this._currentProduct = {
      name: product.name,
      description: `this is ${product.name} product that comes directly from the API with \`${product?.variant?.slug ?? product.id}\` as an identifier`,
      iconUrl: product?.variant?.logo ?? product.logoUrl,
    };
  }

  _onProductInput({ detail: product }) {
    const parsedProduct = JSON.parse(product);
    if (parsedProduct != null) {
      this._currentProduct = parsedProduct;
    }
  }

  _onWidthInput({ detail: width }) {
    this._componentWidth = width;
  }

  render() {
    return html`
      <div class="ctrl-top">
        <cc-select
          label="API products"
          value="default"
          .options="${API_PRODUCTS_SELECT}"
          @cc-select:input="${this._onSelect}"
        ></cc-select>
        <cc-input-number
          label="component width (em)"
          value=${this._componentWidth}
          @cc-input-number:input="${this._onWidthInput}"
        ></cc-input-number>
      </div>
      <div class="main">
        <cc-product-card
          style="width:${this._componentWidth}em;"
          name="${this._currentProduct.name}"
          description="${this._currentProduct.description}"
          icon-url="${this._currentProduct.iconUrl}"
          .keywords="${this._currentProduct?.keywords ?? []}"
        ></cc-product-card>
      </div>
      <div class="ctrl-right">
        <cc-input-text
          label="Product details"
          value=${JSON.stringify(this._currentProduct, null, '\t')}
          @cc-input-text:input="${this._onProductInput}"
          multi
        ></cc-input-text>
      </div>
    `;
  }

  static get styles() {
    return [
      sandboxStyles,
      css`
        cc-input-text {
          --cc-input-font-family: var(--cc-ff-monospace, monospace);

          width: 40em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-product-card-sandbox', CcProductCardSandbox);
