import { css, html, LitElement } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-block/cc-block.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-notice/cc-notice.js';

/**
 * @typedef {import('./cc-addon-credentials.types.js').Credential} Credential
 * @typedef {import('../common.types.js').ToggleStateType} ToggleStateType
 * @typedef {import('./cc-addon-credentials.types.js').AddonType} AddonType
 */

/**
 * A component to display an add-on credentials.
 *
 * ## Details
 *
 * * When the `value` of a credential is nullish, a skeleton UI pattern is displayed (loading hint).
 *
 * @cssdisplay block
 */
export class CcAddonCredentials extends LitElement {
  static get properties() {
    return {
      credentials: { type: Array },
      error: { type: Boolean },
      image: { type: String },
      name: { type: String },
      toggleState: { type: Boolean, attribute: 'toggle-state' },
      type: { type: String },
    };
  }

  constructor() {
    super();

    /** @type {Credential[]|null} Sets the list of add-on credentials. */
    this.credentials = null;

    /** @type {boolean} Displays an error message. */
    this.error = false;

    /** @type {string|null} Sets the URL of the image to use. An icon image is expected. */
    this.image = null;

    /** @type {string|null} Sets the display name of the add-on. */
    this.name = null;

    /** @type {ToggleStateType} Sets the toggle state of the inner block. */
    this.toggleState = 'off';

    /** @type {AddonType}  Sets the type of the add-on. */
    this.type = null;
  }

  _getDescription(addonType) {
    switch (addonType) {
      case 'apm':
        return i18n('cc-addon-credentials.description.apm');
      case 'elasticsearch':
        return i18n('cc-addon-credentials.description.elasticsearch');
      case 'kibana':
        return i18n('cc-addon-credentials.description.kibana');
      case 'pulsar':
        return i18n('cc-addon-credentials.description.pulsar');
      case 'materia-kv':
        return i18n('cc-addon-credentials.description.materia-kv');
      default:
        return '';
    }
  }

  _getFieldName(fieldType) {
    switch (fieldType) {
      case 'auth-token':
        return i18n('cc-addon-credentials.field.auth-token');
      case 'host':
        return i18n('cc-addon-credentials.field.host');
      case 'password':
        return i18n('cc-addon-credentials.field.password');
      case 'url':
        return i18n('cc-addon-credentials.field.url');
      case 'user':
        return i18n('cc-addon-credentials.field.user');
      case 'port':
        return i18n('cc-addon-credentials.field.port');
      default:
        return '';
    }
  }

  render() {
    return html`
      <cc-block image=${ifDefined(this.image ?? undefined)} state=${this.toggleState}>
        <div slot="title">${i18n('cc-addon-credentials.title', { name: this.name })}</div>

        ${!this.error
          ? html`
              <div>${this._getDescription(this.type)}</div>

              ${this.credentials != null
                ? html`
                    <div class="credential-list">
                      ${this.credentials.map(
                        ({ type, secret, value }) => html`
                          <cc-input-text
                            readonly
                            clipboard
                            ?secret=${secret}
                            ?skeleton=${value == null}
                            value=${ifDefined(value)}
                            label=${this._getFieldName(type)}
                          ></cc-input-text>
                        `,
                      )}
                    </div>
                  `
                : ''}
            `
          : ''}
        ${this.error
          ? html` <cc-notice intent="warning" message="${i18n('cc-addon-credentials.loading-error')}"></cc-notice> `
          : ''}
      </cc-block>
    `;
  }

  static get styles() {
    return [
      skeletonStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .credential-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        cc-input-text {
          --cc-input-font-family: var(--cc-ff-monospace, monospace);

          flex: 1 1 18em;
        }

        /* SKELETON */

        .skeleton {
          background-color: #bbb;
        }
      `,
    ];
  }
}

window.customElements.define('cc-addon-credentials', CcAddonCredentials);
