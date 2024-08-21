import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import {
  iconCleverArrowsLeft as iconArrowsLeft,
  iconCleverArrowsRight as iconArrowsRight,
} from '../../assets/cc-clever.icons.js';
import {
  iconRemixArrowDownSLine as iconArrowDown,
  iconRemixDatabase_2Fill as iconDisk,
  iconRemixAddLine as iconPlus,
  iconRemixFunctions as iconSum,
  iconRemixUser_3Fill as iconUser,
} from '../../assets/cc-remix.icons.js';
import { ResizeController } from '../../controllers/resize-controller.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { PricingConsumptionSimulator } from '../../lib/pricing.js';
import { i18n } from '../../translations/translation.js';
import '../cc-button/cc-button.js';
import '../cc-icon/cc-icon.js';
import '../cc-input-number/cc-input-number.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';
import '../cc-toggle/cc-toggle.js';

const BREAKPOINT = 600;

// FIXME: this code is duplicated across all pricing components (see issue #732 for more details)
const CURRENCY_EUR = { code: 'EUR', changeRate: 1 };

const INFINITY = '∞';
const THIRTY_DAYS_IN_HOURS = 24 * 30;
const ONE_GIGABYTE = 1e9;

const ICONS = {
  storage: iconDisk,
  'inbound-traffic': iconArrowsRight,
  'outbound-traffic': iconArrowsLeft,
  'private-users': iconUser,
  'public-users': iconUser,
};

/**
 * @typedef {import('../common.types.js').ActionType} ActionType
 * @typedef {import('../common.types.js').Currency} Currency
 * @typedef {import('../common.types.js').Plan} Plan
 * @typedef {import('./cc-pricing-product-consumption.types.js').PricingProductConsumptionState} PricingProductConsumptionState
 * @typedef {import('./cc-pricing-product-consumption.types.js').SectionStates} SectionStates
 */

/**
 * A component to simulate pricing for products with consumption based pricing (Cellar, FS Buckets, Pulsar...).
 *
 * ## Details
 *
 * * Interval prices are defined in "euros / byte / 30 days" or just "euros / byte" for timeless sections like traffic.
 * * Interval ranges are defined in bytes.
 * * To comply with `<cc-pricing-product>`, the price in the event `cc-pricing-product:add-plan` is in "euros / 1 hour".
 *
 * **Note:** This component relies on the `ResizeController` to change its layout with `600px` as a width breakpoint.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<Plan>} cc-pricing-product:add-plan - Fires the plan whenever the "add" button is clicked.
 *
 * @cssprop {Color} --cc-pricing-hovered-color - Sets the text color used on hover (defaults: `purple`).
 */
export class CcPricingProductConsumption extends LitElement {
  static get properties() {
    return {
      action: { type: String },
      currency: { type: Object },
      product: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {ActionType} Sets the type of action: "add" to display the "add" button for the product and "none" for no actions (defaults to "add") */
    this.action = 'add';

    /** @type {Currency} Sets the currency used to display the prices (defaults to euros) */
    this.currency = CURRENCY_EUR;

    /** @type {PricingProductConsumptionState} Sets the state of the product */
    this.product = { state: 'loading' };

    this._simulator = new PricingConsumptionSimulator();

    /** @type {SectionStates} Sets the state of the section. It is modified everytime the quantity is changed, the section is shown / hidden, or if the unit value changes. */
    this._sectionStates = {};

    /** @type {ResizeController} */
    this._resizeController = new ResizeController(this);
  }

  /**
   * Returns the translated section title depending on its type
   *
   * @param {SectionType|"total"} type - the type of the pricing section
   * @return {string} the translated section title based on the section type
   */
  _getTitle(type) {
    switch (type) {
      case 'storage':
        return i18n('cc-pricing-product-consumption.storage.title');
      case 'inbound-traffic':
        return i18n('cc-pricing-product-consumption.inbound-traffic.title');
      case 'outbound-traffic':
        return i18n('cc-pricing-product-consumption.outbound-traffic.title');
      case 'private-users':
        return i18n('cc-pricing-product-consumption.private-users.title');
      case 'public-users':
        return i18n('cc-pricing-product-consumption.public-users.title');
      case 'total':
        return i18n('cc-pricing-product-consumption.total.title');
    }
  }

  /**
   * Returns the translated label depending on the section type
   *
   * @param {SectionType} type - the type of the pricing section
   * @return {string} the translated label corresponding to the given section type
   */
  _getLabel(type) {
    switch (type) {
      case 'storage':
        return i18n('cc-pricing-product-consumption.storage.label');
      case 'inbound-traffic':
        return i18n('cc-pricing-product-consumption.inbound-traffic.label');
      case 'outbound-traffic':
        return i18n('cc-pricing-product-consumption.outbound-traffic.label');
      case 'private-users':
        return i18n('cc-pricing-product-consumption.private-users.label');
      case 'public-users':
        return i18n('cc-pricing-product-consumption.public-users.label');
    }
  }

  /**
   * Returns the currency code and the computed price factored with the currency changerate
   *
   * @param {number} amount - the amount to base the calculation on
   * @return {Object} An object containing the computed price and the currency code
   */
  _getCurrencyValue(amount) {
    return {
      price: amount * this.currency.changeRate,
      code: this.currency.code,
    };
  }

  /**
   * Returns the localized maximum range to display if the values from this section type are expressed in bytes
   * or the raw maximum range if the values are expressed as raw numbers.
   *
   * @param {SectionType} type - the type of the section related to the maximum range to process
   * @param {number} maxRange - the maximum range expressed as a raw number
   *
   * @return {string|number} the localized maximum range (if maxRange is null, returns `INFINITY`) or the raw maximum range itself
   */
  _getMaxRange(type, maxRange) {
    if (maxRange == null) {
      return INFINITY;
    }
    if (this._isTypeBytes(type)) {
      return i18n('cc-pricing-product-consumption.bytes', { bytes: maxRange });
    }
    return maxRange;
  }

  /**
   * Returns the localized minimum range to display if the values from this section type are expressed in bytes
   * or the raw minimum range if the values are expressed as raw numbers.
   *
   * @param {SectionType} type - the type of the section related to the minimum range to process
   * @param {number} minRange - the minimum range expressed as a raw number
   *
   * @return {string|number} the localized minimum range or the raw minimum range itself
   */
  _getMinRange(type, minRange) {
    return this._isTypeBytes(type) ? i18n('cc-pricing-product-consumption.bytes', { bytes: minRange }) : minRange;
  }

  /**
   * Returns the localized interval price depending on the given section type.
   *
   * @param {SectionPrice} type - the section type related to the interval price to process
   * @param {number} intervalPrice - the interval price to localize
   */
  _getIntervalPrice(type, intervalPrice) {
    if (intervalPrice === 0) {
      return i18n('cc-pricing-product-consumption.price-interval.free');
    }

    // type bytes interval prices are specified for 1 byte but we want to display a unit price for 1 gigabyte
    return this._isTypeBytes(type)
      ? i18n(
          'cc-pricing-product-consumption.price-interval.bytes',
          this._getCurrencyValue(intervalPrice * ONE_GIGABYTE),
        )
      : i18n('cc-pricing-product-consumption.price-interval.users', {
          ...this._getCurrencyValue(intervalPrice),
          userCount: this.product.sections.find((s) => s.type === type).secability ?? 1,
        });
  }

  /**
   * Returns the localized and formatted units based with their corresponding value in bytes.
   *
   * @return {Array} An array containing objects with a label (localized unit) and a value (the corresponding value in bytes).
   */
  _getUnits() {
    return [
      {
        label: i18n('cc-pricing-product-consumption.bytes-unit', { bytes: 1e6 }),
        value: '1000000',
      },
      {
        label: i18n('cc-pricing-product-consumption.bytes-unit', { bytes: 1e9 }),
        value: '1000000000',
      },
      {
        label: i18n('cc-pricing-product-consumption.bytes-unit', { bytes: 1e12 }),
        value: '1000000000000',
      },
    ];
  }

  /**
   * Checks if the section type is one of the sections with values expressed in bytes or not.
   *
   * @param {SectionType} type - the type of the section to check
   * @return {boolean} true if values from this section are expressed in bytes, false otherwise
   */
  _isTypeBytes(type) {
    return ['storage', 'inbound-traffic', 'outbound-traffic'].includes(type);
  }

  /**
   * Updates the simulator quantity.
   *
   * @param {SectionType} type - the type of the section to update within the simulator
   */
  _updateSimulatorQuantity(type) {
    const quantity = this._sectionStates[type].quantity;
    const factor = this._isTypeBytes(type) ? parseInt(this._sectionStates[type].unitValue) : 1;
    this._simulator.setQuantity(type, quantity * factor);
  }

  /**
   * Creates a plan object based on the component data.
   * Dispatches a `cc-pricing-product:add-plan` event with the plan as its payload.
   */
  _onAddPlan() {
    const name = (this.product?.sections ?? [])
      .map(({ type }) => {
        const title = this._getTitle(type);
        const quantity = this._isTypeBytes(type)
          ? i18n('cc-pricing-product-consumption.bytes', { bytes: this._simulator.getQuantity(type) })
          : i18n('cc-pricing-product-consumption.number', { number: this._simulator.getQuantity(type) });
        return `${title} ${quantity}`;
      })
      .join(', ');

    const plan = {
      productName: this.product.name,
      name,
      // As explained above, interval prices are expected to be in "euros / byte / 30 days" or just "euros / byte" for timeless sections like traffic
      // To comply with `<cc-pricing-product>`, the price in this event is in "euros / 1 hour"
      price: this._simulator.getTotalPrice() / THIRTY_DAYS_IN_HOURS,
    };

    dispatchCustomEvent(this, 'cc-pricing-product:add-plan', plan);
  }

  /**
   * Updates the quantity.
   * Triggers an update of the simulator so that it retrieves the new quantity.
   *
   * @param {SectionType} type - the type of the section to update
   * @param {number} quantity - the quantity to set
   */
  _onInputValue(type, quantity) {
    this._sectionStates[type].quantity = isNaN(quantity) ? 0 : quantity;
    this._updateSimulatorQuantity(type);
    this.requestUpdate();
  }

  /**
   * Updates the selected unit.
   * Triggers an update of the simulator so that it retrieves the new unit.
   *
   * @param {SectionType} type - the type of the section to update
   * @param {number} unitValue - the unit to set
   */
  _onToggleUnit(type, unitValue) {
    this._sectionStates[type].unitValue = unitValue;
    this._updateSimulatorQuantity(type);
    this.requestUpdate();
  }

  /**
   * Toggles the `isClosed` property to show / hide a section.
   *
   * @param {SectionType} type - the type of the section to toggle
   */
  _onToggleState(type) {
    this._sectionStates[type].isClosed = !this._sectionStates[type].isClosed;
    this.requestUpdate();
  }

  willUpdate(changedProperties) {
    // This is not done within the `render` function because we only want to reset this value in specific cases.
    // We reset the simulator & section states only if the product has changed.
    if (changedProperties.has('product') && Array.isArray(this.product.sections)) {
      this._sectionStates = {};
      this.product.sections.forEach(({ type }) => {
        this._sectionStates[type] = {
          // In small mode, sections are closed by default
          isClosed: true,
          // The number input is set to 0 by default
          quantity: 0,
          // The unit toggle is set to the first value by default
          unitValue: this._getUnits()[0].value,
        };
      });

      this._simulator = new PricingConsumptionSimulator(this.product.sections);
    }
  }

  render() {
    return html`
      ${this.product.state === 'error'
        ? html` <cc-notice intent="warning" message=${i18n('cc-pricing-product-consumption.error')}></cc-notice> `
        : ''}
      ${this.product.state === 'loading' ? html` <cc-loader></cc-loader> ` : ''}
      ${this.product.state === 'loaded' ? this._renderLoaded(this.product.sections) : ''}
    `;
  }

  /**
   * @param {PricingSection[]} sections
   */
  _renderLoaded(sections) {
    const { width } = this._resizeController;
    const bodyClasses = {
      'body--big': width > BREAKPOINT,
      'body--small': width <= BREAKPOINT,
    };

    const someNullishIntervals = sections.some(({ intervals }) => intervals == null);
    const everyQuantityAtZero = sections
      .map(({ type }) => this._simulator.getQuantity(type))
      .every((quantity) => quantity === 0);

    return html`
      <div class="body ${classMap(bodyClasses)}">
        ${sections.map((section) => this._renderSection(section))}

        <div class="section">
          <div class="section-header">
            <cc-icon class="section-icon sum-icon" .icon=${iconSum} size="lg"></cc-icon>
            <div class="section-title section-title--total">
              <div class="section-title-text">${this._getTitle('total')}</div>
              <div class="section-title-price">
                ${i18n('cc-pricing-product-consumption.price', this._getCurrencyValue(this._simulator.getTotalPrice()))}
              </div>
            </div>
          </div>
        </div>
        <hr class="${classMap({ last: this.action === 'none' })}" />

        ${this.action === 'add'
          ? html`
              <div class="button-bar">
                <cc-button
                  .icon=${iconPlus}
                  ?disabled=${someNullishIntervals || everyQuantityAtZero}
                  @cc-button:click=${this._onAddPlan}
                >
                  ${i18n('cc-pricing-product-consumption.add')}
                </cc-button>
              </div>
            `
          : ''}
      </div>
    `;
  }

  /**
   * @param {PricingSection} section
   */
  _renderSection(section) {
    const intervals = section.intervals;
    const progressive = section.progressive;

    const type = section.type;
    const icon = ICONS[type];
    const { isClosed, quantity, unitValue } = this._sectionStates[type];
    const sectionPrice = this._simulator.getSectionPrice(type);
    const maxInterval = this._simulator.getMaxInterval(type);

    return html`
      <div class="section ${classMap({ 'section--closed': isClosed })}">
        <div class="section-header">
          <cc-icon class="section-icon" .icon=${icon}></cc-icon>
          <div class="section-title">${this._getTitle(type)}</div>
        </div>

        <div class="input-wrapper">${this._renderInput({ type, quantity, unitValue })}</div>

        <button
          aria-controls=${section.type}
          aria-expanded=${this._sectionStates[type].isClosed === false}
          class="section-toggle-btn"
          @click=${() => this._onToggleState(type)}
        >
          <span>${i18n('cc-pricing-product-consumption.toggle-btn.label')}</span>
          <cc-icon class="expand-icon" .icon=${iconArrowDown}></cc-icon>
        </button>

        <div id=${section.type} class="interval-list">
          ${this._renderIntervalList({ type, progressive, intervals, maxInterval })}
        </div>

        <div class="section-title section-title--subtotal">
          <div class="section-title-text">${i18n('cc-pricing-product-consumption.subtotal.title')}</div>
          <div class="section-title-price">
            ${i18n('cc-pricing-product-consumption.price', this._getCurrencyValue(sectionPrice))}
          </div>
        </div>
      </div>
      <hr />
    `;
  }

  /**
   * @param {Object} plan
   * @param {SectionType} plan.type
   * @param {number} plan.quantity
   * @param {number} plan.unitValue
   */
  _renderInput({ type, quantity, unitValue }) {
    if (this._isTypeBytes(type)) {
      return html`
        <cc-input-number
          label=${i18n('cc-pricing-product-consumption.size', { bytes: unitValue })}
          class="input-quantity"
          value=${quantity}
          min="0"
          @cc-input-number:input=${(e) => this._onInputValue(type, e.detail)}
        ></cc-input-number>
        <cc-toggle
          legend=${i18n('cc-pricing-product-consumption.unit')}
          class="input-unit"
          value=${unitValue}
          .choices=${this._getUnits()}
          @cc-toggle:input=${(e) => this._onToggleUnit(type, e.detail)}
        ></cc-toggle>
      `;
    } else {
      return html`
        <cc-input-number
          label=${i18n('cc-pricing-product-consumption.quantity')}
          class="input-quantity"
          value=${quantity}
          min="0"
          @cc-input-number:input=${(e) => this._onInputValue(type, e.detail)}
        ></cc-input-number>
      `;
    }
  }

  /**
   * @param {SectionType} type
   * @param {boolean} progressive
   * @param {Interval[]} intervals
   * @param {Interval} maxInterval
   */
  _renderIntervalList({ type, progressive, intervals, maxInterval }) {
    return intervals.map((interval, intervalIndex) => {
      const maxIntervalIndex = intervals.indexOf(maxInterval);
      const foo = progressive && intervalIndex <= maxIntervalIndex;
      const highlighted = interval === maxInterval || foo;

      const minRange = this._getMinRange(type, interval.minRange);
      const maxRange = this._getMaxRange(type, interval.maxRange);
      const intervalPrice = this._getIntervalPrice(type, interval.price);
      const estimatedPriceValue = this._simulator.getIntervalPrice(type, intervalIndex);
      const estimatedPrice = i18n('cc-pricing-product-consumption.price', this._getCurrencyValue(estimatedPriceValue));

      return html`
        <div class="interval-line ${classMap({ progressive, highlighted })}">
          <div class="interval interval-min">${minRange}</div>
          <div class="interval interval-min-sign">&le;</div>
          <div class="interval interval-label">${this._getLabel(type)}</div>
          <div class="interval interval-max-sign">&lt;</div>
          <div class="interval interval-max">${maxRange}</div>
          <div class="interval-price ${classMap({ 'interval-price--free': interval.price === 0 })}">
            ${intervalPrice}
          </div>
          <div class="estimated-price">${estimatedPrice}</div>
        </div>
      `;
    });
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          color: var(--cc-color-text-default, #000);
          display: block;
        }

        /* region COMMON */

        cc-notice {
          max-width: max-content;
        }

        cc-loader {
          min-height: 20em;
        }

        .body {
          align-items: center;
          display: grid;
          overflow: visible;
          white-space: nowrap;
        }

        /* 
    these elements could be removed but they help the readability of the whole template
    in source code and browser devtools
  */

        .section,
        .section-header,
        .interval-line {
          display: contents;
        }

        hr {
          border-color: var(--cc-color-border-neutral-weak, #e5e5e5);
          border-style: solid;
          border-width: 1px 0 0;
          grid-column: 1 / -1;
          margin: 1em 0;
          width: 100%;
        }

        hr.last {
          margin-bottom: 0;
        }

        .section-icon {
          --cc-icon-color: var(--cc-color-text-primary, #000);
          --cc-icon-size: 1em;

          align-self: center;
          grid-column: section-icon / span 1;
          margin-right: 1em;
        }

        .section-icon.sum-icon {
          --cc-icon-size: 1.25em;
        }

        .section-title {
          align-self: center;
          display: flex;
          font-weight: bold;
          grid-column: title / title--end;
          justify-content: space-between;
        }

        .section-title.section-title--subtotal,
        .section-title.section-title--total {
          grid-column: title / title-total--end;
        }

        .section-title.section-title--subtotal {
          margin-top: 0.5em;
        }

        .section-title.section-title--subtotal .section-title-text {
          font-weight: normal;
        }

        .section-title-price {
          margin-left: 1em;
        }

        .input-wrapper {
          align-items: end;
          display: flex;
          grid-column: input-wrapper / input-wrapper--end;
          margin: 1em 0;
          width: 100%;
        }

        .input-quantity {
          flex: 1 1 0;
          min-width: 10ch;
        }

        .input-unit {
          --cc-toggle-text-transform: capitalize;

          margin-left: 0.5em;
        }

        .interval-list {
          display: contents;
        }

        .interval-line {
          --bdrs: var(--cc-border-radius-default, 0.25em);
        }

        .interval,
        .interval-price,
        .estimated-price {
          align-self: stretch;
          margin: 0.1em 0;
          padding-left: 0.5em;
          padding-top: 0.5em;
        }

        .interval {
          padding-bottom: 0.5em;
          padding-right: 0.5em;
        }

        .interval-line.highlighted:not(.progressive) .interval {
          background-color: var(--cc-color-bg-soft, #e5e5e5);
        }

        .interval-min,
        .interval-max,
        .interval-price {
          text-align: right;
        }

        .interval-min {
          border-radius: var(--bdrs) 0 0 var(--bdrs);
          grid-column: interval-min / span 1;
        }

        .interval-label {
          text-align: center;
        }

        .interval-price {
          align-self: center;
          color: var(--cc-color-text-weak, #333);
          font-style: italic;
          grid-column: interval-price / interval-price--end;
          padding-block: 0;
        }

        .interval-max {
          border-radius: 0 var(--bdrs) var(--bdrs) 0;
        }

        .estimated-price {
          font-weight: bold;
          text-align: right;
        }

        .interval-line:not(.highlighted) .estimated-price {
          visibility: hidden;
        }

        .button-bar {
          grid-column: start / end;
          margin-bottom: 1em;
        }

        /* endregion */

        /* region BIG */

        .body--big {
          grid-template-columns:
            [start section-icon] 1.5em
            [title input-wrapper interval-min] min-content
            [interval-min-sign] min-content
            [interval-label] min-content
            [interval-max-sign] min-content
            [interval-max] min-content
            [interval-price input-wrapper--end] min-content
            [estimated-price interval-price--end] min-content
            [title--end title-total--end] 1fr
            [end] 0;
        }

        .body--big .section-title--subtotal {
          display: none;
        }

        .body--big .section-toggle-btn {
          display: none;
        }

        .body--big .interval-label {
          text-align: center;
        }

        .body--big .interval-price {
          margin-left: 2em;
        }

        .body--big .estimated-price {
          grid-column: estimated-price / span 1;
          margin-left: 2em;
        }

        /* endregion */

        /* region SMALL */

        .body--small {
          grid-template-columns:
            [start section-icon] 1.5em
            [title input-wrapper interval-min interval-price] min-content
            [interval-min-sign] min-content
            [interval-label] min-content
            [interval-max-sign] min-content
            [interval-max toggle-btn title--end] min-content
            [input-wrapper--end interval-price--end title-total--end] 1fr
            [end];
        }

        .body--small .section--closed .interval,
        .body--small .section--closed .interval-price {
          height: 0;
          margin-bottom: 0;
          margin-top: 0;
          padding-bottom: 0;
          padding-top: 0;
          visibility: hidden;
        }

        .body--small .interval-price {
          margin-bottom: 1.5em;
        }

        .body--small .estimated-price {
          display: none;
        }

        .body--small .input-wrapper {
          margin-bottom: 0.5em;
        }

        .section-toggle-btn {
          align-items: center;
          background: transparent;
          border: none;
          color: var(--cc-color-text-primary-highlight, blue);
          display: flex;
          font-size: 1em;
          grid-column: input-wrapper / -1;
          margin-block: 0.5em;
          padding: 0;
        }

        .section-toggle-btn:hover {
          color: var(--cc-pricing-hovered-color, purple);
        }

        .expand-icon {
          --cc-icon-color: var(--cc-color-text-default, #000);
          --cc-icon-size: 1.5em;

          transform: rotate(0deg);
          transition: transform 0.2s ease;
        }

        .section:not(.section--closed) .expand-icon {
          transform: rotate(180deg);
          transition: transform 0.2s ease;
        }
        /* endregion */
      `,
    ];
  }
}

window.customElements.define('cc-pricing-product-consumption', CcPricingProductConsumption);
