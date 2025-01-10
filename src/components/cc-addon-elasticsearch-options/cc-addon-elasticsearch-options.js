import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { iconRemixAlertFill as iconAlert } from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { ccAddonEncryptionAtRestOption } from '../../templates/cc-addon-encryption-at-rest-option/cc-addon-encryption-at-rest-option.js';
import { i18n } from '../../translations/translation.js';
import '../cc-addon-option-form/cc-addon-option-form.js';

const KIBANA_LOGO_URL = 'https://assets.clever-cloud.com/logos/elasticsearch-kibana.svg';
const APM_LOGO_URL = 'https://assets.clever-cloud.com/logos/elasticsearch-apm.svg';

/** @type {Flavor} */
const SKELETON_FLAVOR_WITHOUT_MONTHLY_COST = {
  name: '?',
  mem: 0,
  cpus: 0,
  gpus: 0,
  microservice: false,
};

/** @type {FlavorWithMonthlyCost} */
const SKELETON_FLAVOR_WITH_MONTHLY_COST = {
  ...SKELETON_FLAVOR_WITHOUT_MONTHLY_COST,
  monthlyCost: { amount: 0, currency: 'EUR' },
};

/**
 * @typedef {import('./cc-addon-elasticsearch-options.types.js').AddonElasticsearchOptionsState} AddonElasticsearchOptionsState
 * @typedef {import('../common.types.js').AddonOptionStates} AddonOptionStates
 * @typedef {import('../common.types.js').EncryptionAddonOption} AddonOption
 * @typedef {import('../common.types.js').AddonOptionWithMetadata} AddonOptionWithMetadata
 * @typedef {import('../common.types.js').FlavorWithMonthlyCost} FlavorWithMonthlyCost
 * @typedef {import('../common.types.js').ElasticAddonOption<Flavor | FlavorWithMonthlyCost | null>} ElasticAddonOption
 * @typedef {import('../common.types.js').Flavor} Flavor
 */

/**
 * A component that displays the available options of an elasticsearch add-on.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<AddonOptionStates>} cc-addon-elasticsearch-options:submit - Fires when the form is submitted.
 */
export class CcAddonElasticsearchOptions extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {AddonElasticsearchOptionsState} Sets the state of the component */
    this.state = { type: 'loading', hasMonthlyCost: true, options: [] };
  }

  /** @param {CustomEvent<AddonOptionStates>} event */
  _onFormOptionsSubmit({ detail }) {
    dispatchCustomEvent(this, 'submit', detail);
  }

  /**
   * Returns the metadata for an Elasticsearch option (APM or Kibana) including title, warning message, details, and logo URL
   *
   * @param {ElasticAddonOption['name']} elasticOptionName
   * @returns {{ title: string, warning: string, details: Node, logo: string }}
   */
  _getElasticsearchOptionData(elasticOptionName) {
    switch (elasticOptionName) {
      case 'apm':
        return {
          title: 'APM',
          warning: i18n('cc-addon-elasticsearch-options.warning.apm'),
          details: i18n('cc-addon-elasticsearch-options.details.apm'),
          logo: APM_LOGO_URL,
        };
      case 'kibana':
        return {
          title: 'Kibana',
          warning: i18n('cc-addon-elasticsearch-options.warning.kibana'),
          details: i18n('cc-addon-elasticsearch-options.details.kibana'),
          logo: KIBANA_LOGO_URL,
        };
    }
  }

  /**
   * Returns the appropriate flavor object based on skeleton state and whether monthly cost is enabled
   *
   * @param {boolean} skeleton - Whether the component is in loading state
   * @param {boolean} hasMonthlyCost - Whether monthly cost should be included
   * @param {Flavor|FlavorWithMonthlyCost} [flavor] - The flavor object to return if not in skeleton state
   * @returns {Flavor|FlavorWithMonthlyCost} The appropriate flavor object
   */
  _getElasticsearchOptionFlavor(skeleton, hasMonthlyCost, flavor) {
    if (skeleton && hasMonthlyCost) {
      return SKELETON_FLAVOR_WITH_MONTHLY_COST;
    }

    if (skeleton) {
      return SKELETON_FLAVOR_WITHOUT_MONTHLY_COST;
    }

    return flavor;
  }

  /**
   * @param {ElasticAddonOption} addonOption
   * @returns {AddonOptionWithMetadata}
   */
  _getElasticAddonOption(addonOption) {
    const { title, warning, details, logo } = this._getElasticsearchOptionData(addonOption.name);
    const skeleton = this.state.type === 'loading';
    const flavor = this._getElasticsearchOptionFlavor(
      this.state.type === 'loading',
      this.state.hasMonthlyCost,
      addonOption.flavor,
    );

    const description = html`
      <div class="option-details">${details}</div>
      <div class="option-warning">
        <cc-icon
          .icon="${iconAlert}"
          a11y-name="${i18n('cc-addon-elasticsearch-options.error.icon-a11y-name')}"
          class="icon-warning"
        ></cc-icon>
        <div>
          <p>${warning}</p>
          <p>
            <span class="options-warning ${classMap({ skeleton })}">
              ${i18n('cc-addon-elasticsearch-options.warning.flavor', flavor)}
            </span>
            ${this.state.hasMonthlyCost && 'monthlyCost' in flavor
              ? html`
                  <span class="options-warning ${classMap({ skeleton })}">
                    ${i18n('cc-addon-elasticsearch-options.warning.monthly-cost', flavor.monthlyCost)}
                  </span>
                `
              : ''}
          </p>
        </div>
      </div>
    `;

    return {
      title,
      logo,
      description,
      enabled: addonOption.enabled,
      name: addonOption.name,
    };
  }

  _getFormOptions() {
    return this.state.options
      .map((option) => {
        switch (option.name) {
          case 'apm':
          case 'kibana':
            return this._getElasticAddonOption(option);
          case 'encryption':
            return ccAddonEncryptionAtRestOption(option);
          default:
            return null;
        }
      })
      .filter((option) => option != null);
  }

  render() {
    return html`
      <cc-addon-option-form
        heading="${i18n('cc-addon-elasticsearch-options.title')}"
        .options=${this._getFormOptions()}
        @cc-addon-option-form:submit="${this._onFormOptionsSubmit}"
      >
        <div slot="description">
          ${i18n('cc-addon-elasticsearch-options.description')}
          ${this.state.hasMonthlyCost ? i18n('cc-addon-elasticsearch-options.additional-cost') : ''}
        </div>
      </cc-addon-option-form>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }
      `,
    ];
  }
}

window.customElements.define('cc-addon-elasticsearch-options', CcAddonElasticsearchOptions);
