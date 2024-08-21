import { css, html, LitElement } from 'lit';
import { i18n } from '../../lib/i18n/i18n.js';
import '../cc-env-var-form/cc-env-var-form.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';

/**
 * @typedef {import('./cc-env-var-linked-services.types.js').EnvVarLinkedServicesState} EnvVarLinkedServicesState
 * @typedef {import('./cc-env-var-linked-services.types.js').EnvVarLinkedServicesType} EnvVarLinkedServicesType
 */

/**
 * A component to display groups of readonly `<cc-env-var-form>` for linked apps of add-ons.
 *
 * ## Details
 *
 * @cssdisplay block
 */
export class CcEnvVarLinkedServices extends LitElement {
  static get properties() {
    return {
      appName: { type: String, attribute: 'app-name' },
      state: { type: Object },
      type: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {string|null} Sets name of the main app to which services are linked. */
    this.appName = null;

    /** @type {EnvVarLinkedServicesState} Linked services state. */
    this.state = { type: 'loading' };

    /** @type {EnvVarLinkedServicesType} Type of env vars to display linked add-ons or linked apps. */
    this.type = null;
  }

  _getLoadingMessage() {
    const i18nParams = { appName: this.appName };
    switch (this.type) {
      case 'addon':
        return i18n('cc-env-var-linked-services.loading.addon', i18nParams);
      case 'app':
        return i18n('cc-env-var-linked-services.loading.app', i18nParams);
      default:
        return '';
    }
  }

  _getServiceHeading(name) {
    switch (this.type) {
      case 'addon':
        return i18n('cc-env-var-linked-services.heading.addon', { name });
      case 'app':
        return i18n('cc-env-var-linked-services.heading.app', { name });
      default:
        return '';
    }
  }

  _getServiceDescription(serviceName) {
    const i18nParams = { serviceName, appName: this.appName };
    switch (this.type) {
      case 'addon':
        return i18n('cc-env-var-linked-services.description.addon', i18nParams);
      case 'app':
        return i18n('cc-env-var-linked-services.description.app', i18nParams);
      default:
        return '';
    }
  }

  _getEmptyMessage() {
    const i18nParams = { appName: this.appName };
    switch (this.type) {
      case 'addon':
        return i18n('cc-env-var-linked-services.empty.addon', i18nParams);
      case 'app':
        return i18n('cc-env-var-linked-services.empty.app', i18nParams);
      default:
        return '';
    }
  }

  _getErrorMessage() {
    const i18nParams = { appName: this.appName };
    switch (this.type) {
      case 'addon':
        return i18n('cc-env-var-linked-services.error.addon', i18nParams);
      case 'app':
        return i18n('cc-env-var-linked-services.error.app', i18nParams);
      default:
        return '';
    }
  }

  /**
   * @param {LinkedServiceState} linkedServiceState
   * @return {EnvVarFormState}
   */
  _getEnvVarFormState(linkedServiceState) {
    if (linkedServiceState.type === 'loading') {
      return { type: 'loading' };
    }
    if (linkedServiceState.type === 'error') {
      return { type: 'error' };
    }
    return { type: 'loaded', variables: linkedServiceState.variables, validationMode: 'simple' };
  }

  render() {
    if (this.state.type === 'error') {
      return html`
        <div class="error">
          <cc-notice intent="warning" .message="${this._getErrorMessage()}"></cc-notice>
        </div>
      `;
    }

    if (this.state.type === 'loading') {
      return html` <div class="loading"><cc-loader></cc-loader><span>${this._getLoadingMessage()}</span></div> `;
    }

    const servicesStates = this.state.servicesStates;

    if (servicesStates.length === 0) {
      return html` <div class="empty-msg">${this._getEmptyMessage()}</div> `;
    }

    return html`
      <div class="service-list">
        ${servicesStates.map(
          (serviceState) => html`
            <cc-env-var-form
              readonly
              .state=${this._getEnvVarFormState(serviceState)}
              heading=${this._getServiceHeading(serviceState.name)}
            >
              ${this._getServiceDescription(serviceState.name)}
            </cc-env-var-form>
          `,
        )}
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

        .loading,
        .empty-msg {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          box-sizing: border-box;
          padding: 1em;
        }

        .loading {
          display: flex;
        }

        cc-loader {
          height: 1.5em;
          margin-right: 1em;
          width: 1.5em;
        }

        .service-list {
          display: grid;
          grid-gap: 1em;
        }

        .empty-msg {
          color: var(--cc-color-text-weak);
          font-style: italic;
        }
      `,
    ];
  }
}

window.customElements.define('cc-env-var-linked-services', CcEnvVarLinkedServices);
