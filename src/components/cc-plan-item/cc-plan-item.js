import { css, html, LitElement } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { iconRemixCheckboxCircleFill as selectedIcon } from '../../assets/cc-remix.icons.js';
import '../cc-badge/cc-badge';
import '../cc-icon/cc-icon.js';

/**
 * @typedef {import('./cc-plan-item.types.js').PlanDetails} PlanDetails
 * @typedef {import('./cc-plan-item.types.js').PlanBadge} PlanBadge
 */

/**
 * A component displaying a card with relative plan information and details
 *
 * @slot decorator - A decorator next to the plan name
 *
 * @cssdisplay flex
 */
export class CcPlanItem extends LitElement {
  static get properties() {
    return {
      badge: { type: Object },
      details: { type: Array },
      disabled: { type: Boolean, reflect: true },
      name: { type: String },
      selected: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();

    /** @type {PlanBadge} Badge to display next to the plan name  **/
    this.badge = null;

    /** @type {PlanDetails[]} The details of the plan **/
    this.details = [];

    /** @type {boolean} Whether the component should be disabled  **/
    this.disabled = false;

    /** @type {string} The plan name **/
    this.name = null;

    /** @type {boolean} Whether the component should be selected **/
    this.selected = false;
  }

  render() {
    return html`
      <div class="title">
        <div class="name">${this.name}</div>
        ${this.badge != null
          ? html` <cc-badge intent="${ifDefined(this.badge?.intent)}"> ${this.badge.content} </cc-badge> `
          : ''}
      </div>
      <cc-icon class="icon-selected" .icon="${selectedIcon}" size="lg"></cc-icon>
      ${this.details?.length > 0
        ? html`<div class="details">${this.details.map((detail) => this._renderDetail(detail))}</div>`
        : ``}
    `;
  }

  /**
   *
   * @param {PlanDetails} detail
   * @returns HTMLElement
   */
  _renderDetail(detail) {
    return html`
      <div class="detail">
        <span class="detail-icon"><cc-icon .icon="${detail.icon}" size="md"></cc-icon></span>
        <span class="detail-value">${detail.value}</span>
      </div>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          border: 2px solid var(--cc-color-border-neutral);
          border-radius: var(--cc-border-radius-default);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        :host .title {
          flex: 1 1 auto;
        }

        :host .details {
          flex: 0 0 auto;
        }

        :host(:hover) {
          border-color: var(--cc-color-border-neutral-hovered);
        }

        :host(:hover:not([disabled])) {
          border-color: var(--cc-color-border-neutral-hovered);
        }

        :host(:not([selected], [disabled])) {
          cursor: pointer;
        }

        :host([disabled]) {
          border-color: var(--cc-color-border-neutral-disabled);
          opacity: var(--cc-opacity-when-disabled);
        }

        :host(:focus-visible) {
          outline: var(--cc-focus-outline);
          outline-offset: 2px;
        }

        :host([selected]) {
          border-color: var(--cc-color-bg-primary);
        }

        :host([selected]) .icon-selected {
          opacity: 1;
        }

        :host([selected]) .name {
          color: var(--cc-color-text-primary-strongest);
        }

        :host([selected]) .details {
          background-color: var(--cc-color-bg-primary-weak);
        }

        :host([selected]) .detail-icon {
          color: var(--cc-color-text-primary);
        }

        :host([selected]) .detail-value {
          color: var(--cc-color-text-primary-strongest);
        }

        .title {
          align-items: center;
          column-gap: 0.375em;
          display: inline-flex;
          flex-wrap: wrap;
          padding: 1em 1em 0.75em;
        }

        .name {
          flex: 0 0 auto;
          font-size: 1.25em;
        }

        .decorator {
          flex: 0 0 auto;
        }

        .icon-selected {
          --cc-icon-color: var(--cc-color-bg-primary);

          opacity: 0;
          position: absolute;
          right: 0.5em;
          top: 0.5em;
        }

        .details {
          background-color: var(--cc-color-bg-neutral);
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          padding: 0.75em 1.125em;
        }

        .detail {
          align-items: center;
          display: inline-flex;
          flex: 0 0 auto;
          gap: 0.5em;
          line-height: 1;
        }

        .detail-con {
          color: var(--cc-color-text-weak);
          flex: 0 0 auto;
        }

        .detail-value {
          color: var(--cc-color-text-weak);
          flex: 1 1 auto;
          font-size: 0.875em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-plan-item', CcPlanItem);
