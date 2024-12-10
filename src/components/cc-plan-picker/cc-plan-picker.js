import { css, html } from 'lit';
import { iconRemixServerLine as labelIcon } from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { CcFormControlElement } from '../../lib/form/cc-form-control-element.abstract.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { accessibilityStyles } from '../../styles/accessibility.js';
import '../cc-plan-item/cc-plan-item.js';

/**
 * @typedef {import('./cc-plan-picker.types.js').PlanItem} PlanItem
 * @typedef {import('../../lib/events.types.js').EventWithTarget} EventWithTarget
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 * @typedef {import('../../lib/events.types.js').GenericEventWithTarget<InputEvent, HTMLInputElement>} HTMLInputElementEvent
 */

/**
 * A component that allows you to select a plan from a list of plans.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<string>} cc-plan-picker:input - Fires the id of the selected plan
 */
export class CcPlanPicker extends CcFormControlElement {
  static get properties() {
    return {
      ...super.properties,
      legend: { type: String },
      plans: { type: Array },
      readonly: { type: Boolean },
      value: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {string} The legend of the form control **/
    this.legend = null;

    /** @type {string} The name of the form control  **/
    this.name = 'plan';

    /** @type {PlanItem[]} List of plans **/
    this.plans = [];

    /** @type {boolean} Whether all the form controls should be readonly **/
    this.readonly = false;

    /** @type {string} current selected plan value  **/
    this.value = null;

    /** @type {string}  **/
    this._currentPlan = null;
  }

  // @ts-expect-error: We override this setter as the component doesn't handle error for now.
  set errorMessage(_) {}

  /**
   * @param {HTMLInputElementEvent} e
   * @private
   */
  _onChangePlan(e) {
    this.value = e.target.value;
    dispatchCustomEvent(this, 'input', this.value);
  }

  render() {
    const legendName = this.legend != null ? this.legend : i18n('cc-plan-picker.legend');

    return html`
      <fieldset @input="${this._onChangePlan}">
        <legend>
          <cc-icon class="plan-legend-icon" .icon="${labelIcon}" size="lg"></cc-icon>
          <span class="plan-legend-text">${legendName}</span>
        </legend>
        <div class="form-controls">${this.plans.map((plan) => this._renderPlan(plan, this.name, this.value))}</div>
      </fieldset>
    `;
  }

  /**
   * @param {PlanItem} plan - A plan object
   * @param {string} name - Form control name
   * @param {string} currentPlanId - Currently selected plan ID
   * @returns {TemplateResult} The rendered plan radio input and label
   * @private
   */
  _renderPlan(plan, name, currentPlanId) {
    const isSelected = currentPlanId === plan.id;
    const disabled = plan.disabled || (this.readonly && !isSelected);

    return html`
      <div>
        <input
          class="visually-hidden"
          type="radio"
          name="${name}"
          .value="${plan.id}"
          ?disabled=${disabled}
          .checked="${isSelected}"
          id="${plan.id}"
        />
        <label for="${plan.id}">
          <cc-plan-item
            name="${plan.name}"
            ?disabled=${disabled}
            .details="${plan.details}"
            ?selected=${isSelected}
            .badge="${plan.badge}"
          >
          </cc-plan-item>
        </label>
      </div>
    `;
  }

  static get styles() {
    return [
      accessibilityStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        legend {
          display: flex;
          gap: 0.25em;
        }

        fieldset {
          border: none;
          margin: 0;
          padding: 0;
        }

        input[type='radio']:focus-visible + label cc-plan-item {
          border-radius: var(--cc-border-radius-default, 0.25em);
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .plan-legend-icon {
          --cc-icon-color: var(--cc-color-text-primary);

          align-self: center;
        }

        .plan-legend-text {
          --ct-form-label-font-family: 'Source Sans 3';
          --ct-form-label-font-size: 1.625em;
          --ct-form-label-font-weight: 500;
          --ct-form-input-font-size: 1.25em;

          color: var(--cc-color-text-primary-strongest);
          font-family: var(--ct-form-label-font-family), sans-serif;
          font-size: var(--ct-form-label-font-size);
          font-weight: var(--ct-form-label-font-weight);
        }

        .form-controls {
          display: grid;
          gap: 1em;
          grid-template-columns: repeat(auto-fill, minmax(12.5em, 1fr));
          margin: 1em 2em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-plan-picker', CcPlanPicker);
