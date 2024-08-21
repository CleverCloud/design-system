import { css, html, LitElement } from 'lit';
import { iconRemixAlertFill as iconAlert } from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { ccAddonEncryptionAtRestOption } from '../../templates/cc-addon-encryption-at-rest-option/cc-addon-encryption-at-rest-option.js';
import { i18n } from '../../translations/translation.js';
import '../cc-addon-option-form/cc-addon-option-form.js';

const KIBANA_LOGO_URL = 'https://assets.clever-cloud.com/logos/elasticsearch-kibana.svg';
const APM_LOGO_URL = 'https://assets.clever-cloud.com/logos/elasticsearch-apm.svg';

/**
 * @typedef {import('../common.types.js').AddonOption} AddonOption
 */

/**
 * A component that displays the available options of an elasticsearch add-on.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<AddonOption>} cc-addon-elasticsearch-options:submit - Fires when the form is submitted.
 */
export class CcAddonElasticsearchOptions extends LitElement {
  static get properties() {
    return {
      options: { type: Array, attribute: 'options' },
    };
  }

  constructor() {
    super();

    /** @type {AddonOption[]} List of options for this add-on. */
    this.options = [];
  }

  _onFormOptionsSubmit({ detail }) {
    dispatchCustomEvent(this, 'submit', detail);
  }

  _getApmOption({ enabled, flavor }) {
    const description = html`
      <div class="option-details">${i18n('cc-addon-elasticsearch-options.description.apm')}</div>
      <div class="option-warning">
        <cc-icon
          .icon="${iconAlert}"
          a11y-name="${i18n('cc-addon-elasticsearch-options.error.icon-a11y-name')}"
          class="icon-warning"
        ></cc-icon>
        <p>
          ${i18n('cc-addon-elasticsearch-options.warning.apm')}
          ${flavor != null ? html` ${i18n('cc-addon-elasticsearch-options.warning.apm.details', flavor)} ` : ''}
        </p>
      </div>
    `;

    return {
      title: 'APM',
      logo: APM_LOGO_URL,
      description,
      enabled,
      name: 'apm',
    };
  }

  _getKibanaOption({ enabled, flavor }) {
    const description = html`
      <div class="option-details">${i18n('cc-addon-elasticsearch-options.description.kibana')}</div>
      <div class="option-warning">
        <cc-icon
          .icon="${iconAlert}"
          a11y-name="${i18n('cc-addon-elasticsearch-options.error.icon-a11y-name')}"
          class="icon-warning"
        ></cc-icon>
        <p>
          ${i18n('cc-addon-elasticsearch-options.warning.kibana')}
          ${flavor != null ? html` ${i18n('cc-addon-elasticsearch-options.warning.kibana.details', flavor)} ` : ''}
        </p>
      </div>
    `;

    return {
      title: 'Kibana',
      logo: KIBANA_LOGO_URL,
      description,
      enabled,
      name: 'kibana',
    };
  }

  _getFormOptions() {
    return this.options
      .map((option) => {
        switch (option.name) {
          case 'apm':
            return this._getApmOption(option);
          case 'kibana':
            return this._getKibanaOption(option);
          case 'encryption':
            return ccAddonEncryptionAtRestOption(option);
          default:
            return null;
        }
      })
      .filter((option) => option != null);
  }

  render() {
    const options = this._getFormOptions();
    const title = i18n('cc-addon-elasticsearch-options.title');

    return html`
      <cc-addon-option-form
        title="${title}"
        .options=${options}
        @cc-addon-option-form:submit="${this._onFormOptionsSubmit}"
      >
        <div slot="description">${i18n('cc-addon-elasticsearch-options.description')}</div>
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
