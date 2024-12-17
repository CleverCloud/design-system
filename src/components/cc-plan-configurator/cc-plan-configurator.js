import { css, html } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { CcFormControlElement } from '../../lib/form/cc-form-control-element.abstract.js';
import { i18n } from '../../translations/translation.js';
import '../cc-plan-picker/cc-plan-picker.js';

/**
 * @typedef {import('../cc-plan-picker/cc-plan-picker.types.js').PlanItem} PlanItem
 * @typedef {import('./cc-plan-configurator.types.js').ConfiguratorPlan} ConfiguratorPlan
 * @typedef {import('lit').PropertyValues<CcPlanConfigurator>} CcPlanConfiguratorPropertyValues
 * @typedef {import('../../lib/events.types.js').GenericEventWithTarget<InputEvent, HTMLInputElement>} HTMLInputElementEvent
 */

/**
 * A component that allows you to select a plan from a list of plans and refine your choice in a sub picker if needed.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<string>} cc-plan-configurator:input - Fires the id of the selected plan
 */
export class CcPlanConfigurator extends CcFormControlElement {
  static get properties() {
    return {
      ...super.properties,
      plans: { type: Array },
      readonly: { type: Boolean },
      value: { type: String },
      _currentPlanId: { type: String, state: true },
      _currentRelatedPlans: { type: Array, state: true },
    };
  }

  constructor() {
    super();

    /** @type {ConfiguratorPlan[]} List of plans and their possible related plans **/
    this.plans = [];

    /** @type {boolean} Whether all the form controls should be readonly **/
    this.readonly = false;

    /** @type {string} Current selected plan */
    this.value = '';

    /** @type {string}  **/
    this._currentPlanId = null;

    /** @type {PlanItem[]}  **/
    this._currentRelatedPlans = [];
  }

  /**
   * @param {HTMLInputElementEvent} e
   * @private
   */
  _onChangePlan(e) {
    const currentPlan = this._findPlan(this.plans, e.target.value);
    this._currentPlanId = e.target.value;
    if (currentPlan.relatedPlans != null && currentPlan.relatedPlans.length > 0) {
      this.value = currentPlan.relatedPlans[0].id;
      this._currentRelatedPlans = currentPlan.relatedPlans;
    } else {
      this.value = this._currentPlanId;
      this._currentRelatedPlans = [];
    }

    dispatchCustomEvent(this, 'input', this.value);
  }

  /**
   * @param {HTMLInputElementEvent} e
   * @private
   */
  _onChangeRelatedPlan(e) {
    this.value = e.target.value;
    dispatchCustomEvent(this, 'input', this.value);
  }

  /**
   * Find a plan by its ID in a list of plans.
   *
   * @param {ConfiguratorPlan[]} plans - List of plans to search through
   * @param {string} planId - ID of the plan to find
   * @returns {ConfiguratorPlan} The found plan or the first plan in the list if not found
   * @private
   */
  _findPlan(plans, planId) {
    // We're trying to find if the plan is a related plan or if the plan is a plan with no related plans
    const exactPlan = plans.find((plan) => {
      if (plan.relatedPlans == null || plan.relatedPlans.length === 0) {
        return plan.id === planId;
      }
      return plan.relatedPlans.find((relatedPlan) => relatedPlan.id === planId) != null;
    });

    // If it was the case we return the plan
    if (exactPlan != null) {
      return exactPlan;
    }

    // If it's not one of the case above we try to find the "parent" plan
    const parentPlan = this.plans.find((plan) => {
      return plan.id === planId;
    });

    if (parentPlan != null) {
      return parentPlan;
    }

    // If we don't find anything, the id provided wasn't correct so we default to the first plan of the list
    return plans[0];
  }

  /**
   * @param {CcPlanConfiguratorPropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('plans') && changedProperties.has('value')) {
      const currentPlan = this._findPlan(this.plans, this.value);
      if (currentPlan.relatedPlans != null && currentPlan.relatedPlans.length > 0) {
        const valueExistsInRelated = currentPlan.relatedPlans.some((plan) => plan.id === this.value);
        this.value = valueExistsInRelated ? this.value : currentPlan.relatedPlans[0].id;
      } else {
        this.value = currentPlan.id;
      }
      this._currentPlanId = currentPlan.id;
      this._currentRelatedPlans = currentPlan.relatedPlans;
    }
  }

  render() {
    return html`
      <cc-plan-picker
        @cc-plan-picker:input="${this._onChangePlan}"
        name="plan"
        .plans=${this.plans}
        value="${this._currentPlanId}"
        ?readonly="${this.readonly}"
      ></cc-plan-picker>
      ${this._currentRelatedPlans != null && this._currentRelatedPlans.length > 0
        ? html`
            <cc-plan-picker
              @cc-plan-picker:input="${this._onChangeRelatedPlan}"
              name="customize-plans"
              .plans="${this._currentRelatedPlans}"
              value="${this.value}"
              legend="${i18n('cc-plan-configurator.legend.customize')}"
              ?readonly="${this.readonly}"
            ></cc-plan-picker>
          `
        : ''}
    `;
  }

  static get styles() {
    return [
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
      `,
    ];
  }
}

window.customElements.define('cc-plan-configurator', CcPlanConfigurator);
