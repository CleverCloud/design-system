import { css, html, LitElement } from 'lit';
import { iconRemixInformationFill as iconInfo } from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-block-section/cc-block-section.js';
import '../cc-block/cc-block.js';
import '../cc-icon/cc-icon.js';
import '../cc-img/cc-img.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';

const GRAFANA_LOGO_URL = 'https://assets.clever-cloud.com/logos/grafana.svg';
const GRAFANA_HOME_SCREEN = 'https://assets.clever-cloud.com/grafana/screens/home.png';
const GRAFANA_RUNTIME_SCREEN = 'https://assets.clever-cloud.com/grafana/screens/runtime.png';
const GRAFANA_ADDON_SCREEN = 'https://assets.clever-cloud.com/grafana/screens/addon.png';
const GRAFANA_DOCUMENTATION = 'https://www.clever-cloud.com/doc/administrate/metrics/overview/';

/**
 * @typedef {import('./cc-grafana-info.types.js').GrafanaInfoState} GrafanaInfoState
 */

/**
 * A component to display information about grafana and allow some actions: enable, disable, reset.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent} cc-grafana-info:enable - Fires when the enable button is clicked.
 * @fires {CustomEvent} cc-grafana-info:disable - Fires when the disable button is clicked.
 * @fires {CustomEvent} cc-grafana-info:reset - Fires when the reset button is clicked.
 */
export class CcGrafanaInfo extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {GrafanaInfoState} Sets the grafana info state. */
    this.state = { type: 'loading' };
  }

  _getDashboards() {
    return [
      {
        title: i18n('cc-grafana-info.screenshot.organisation.title'),
        url: GRAFANA_HOME_SCREEN,
        description: i18n('cc-grafana-info.screenshot.organisation.description'),
        alt: i18n('cc-grafana-info.screenshot.organisation.alt'),
      },
      {
        title: i18n('cc-grafana-info.screenshot.runtime.title'),
        url: GRAFANA_RUNTIME_SCREEN,
        description: i18n('cc-grafana-info.screenshot.runtime.description'),
        alt: i18n('cc-grafana-info.screenshot.runtime.alt'),
      },
      {
        title: i18n('cc-grafana-info.screenshot.addon.title'),
        url: GRAFANA_ADDON_SCREEN,
        description: i18n('cc-grafana-info.screenshot.addon.description'),
        alt: i18n('cc-grafana-info.screenshot.addon.alt'),
      },
    ];
  }

  _onEnableSubmit() {
    dispatchCustomEvent(this, 'enable');
  }

  _onResetSubmit() {
    dispatchCustomEvent(this, 'reset');
  }

  _onDisableSubmit() {
    dispatchCustomEvent(this, 'disable');
  }

  render() {
    const isSwitchingGrafanaStatus =
      this.state.type === 'loaded' && (this.state.info.action === 'enabling' || this.state.info.action === 'disabling');
    const isFormDisabled =
      this.state.type === 'error' || (this.state.type === 'loaded' && this.state.info.action != null);
    const isGrafanaDisabled = this.state.type === 'loaded' && this.state.info.status === 'disabled';
    const isGrafanaEnabled = this.state.type === 'loaded' && this.state.info.status === 'enabled';
    const isResetting =
      this.state.type === 'loaded' && this.state.info.status === 'enabled' && this.state.info.action === 'resetting';

    return html`
      <cc-block>
        <div slot="title">${i18n('cc-grafana-info.main-title')}</div>

        ${isSwitchingGrafanaStatus ? html` <cc-loader slot="overlay"></cc-loader> ` : ''}

        <cc-block-section>
          <div slot="title">${i18n('cc-grafana-info.documentation-title')}</div>
          <div slot="info">${i18n('cc-grafana-info.documentation-description')}</div>
          <div>
            ${ccLink(
              GRAFANA_DOCUMENTATION,
              html`
                <cc-icon size="lg" .icon=${iconInfo}></cc-icon>
                <span>${i18n('cc-grafana-info.link.doc')}</span>
              `,
            )}
          </div>
        </cc-block-section>

        ${this.state.type === 'loading'
          ? html`
              <cc-block-section>
                <div slot="title">${i18n('cc-grafana-info.loading-title')}</div>
                <div>
                  <cc-loader></cc-loader>
                </div>
              </cc-block-section>
            `
          : ''}
        ${this.state.type === 'error'
          ? html`
              <cc-block-section>
                <div slot="title">${i18n('cc-grafana-info.loading-title')}</div>
                <cc-notice intent="warning" message="${i18n('cc-grafana-info.error-loading')}"></cc-notice>
              </cc-block-section>
            `
          : ''}
        ${isGrafanaDisabled
          ? html`
              <cc-block-section>
                <div slot="title">${i18n('cc-grafana-info.enable-title')}</div>
                <div slot="info">
                  <p>${i18n('cc-grafana-info.enable-description')}</p>
                </div>
                <div>
                  <cc-button success ?disabled=${isFormDisabled} @cc-button:click=${this._onEnableSubmit}>
                    ${i18n('cc-grafana-info.enable-title')}
                  </cc-button>
                </div>
              </cc-block-section>
            `
          : ''}
        ${isGrafanaEnabled
          ? html`
              <cc-block-section>
                <div slot="title">${i18n('cc-grafana-info.grafana-link-title')}</div>
                <div slot="info">
                  <p>${i18n('cc-grafana-info.grafana-link-description')}</p>
                </div>
                ${this.state.info.link == null
                  ? html`
                      <cc-notice intent="warning" message="${i18n('cc-grafana-info.error-link-grafana')}"></cc-notice>
                    `
                  : html`
                      <div>
                        ${ccLink(
                          this.state.info.link,
                          html`
                            <cc-img src="${GRAFANA_LOGO_URL}"></cc-img
                            ><span>${i18n('cc-grafana-info.link.grafana')}</span>
                          `,
                        )}
                      </div>
                    `}
              </cc-block-section>

              <cc-block-section>
                <div slot="title">${i18n('cc-grafana-info.reset-title')}</div>
                <div slot="info">${i18n('cc-grafana-info.reset-description')}</div>
                <div>
                  <cc-button
                    primary
                    ?disabled=${isFormDisabled}
                    ?waiting=${isResetting}
                    @cc-button:click=${this._onResetSubmit}
                  >
                    ${i18n('cc-grafana-info.reset-title')}
                  </cc-button>
                </div>
              </cc-block-section>
            `
          : ''}
        ${!isSwitchingGrafanaStatus
          ? html`
              ${this._getDashboards().map(
                (item) => html`
                  <cc-block-section>
                    <div slot="title">${item.title}</div>
                    <div slot="info">${item.description}</div>
                    <div>
                      ${ccLink(
                        item.url,
                        html` <img class="dashboard-screenshot" src="${item.url}" alt="${item.alt}" /> `,
                      )}
                    </div>
                  </cc-block-section>
                `,
              )}
            `
          : ''}
        ${isGrafanaEnabled
          ? html`
              <cc-block-section>
                <div slot="title">${i18n('cc-grafana-info.disable-title')}</div>
                <div slot="info">${i18n('cc-grafana-info.disable-description')}</div>
                <div>
                  <cc-button danger delay="3" ?disabled=${isFormDisabled} @cc-button:click=${this._onDisableSubmit}>
                    ${i18n('cc-grafana-info.disable-title')}
                  </cc-button>
                </div>
              </cc-block-section>
            `
          : ''}
      </cc-block>
    `;
  }

  static get styles() {
    return [
      linkStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        cc-img {
          border-radius: var(--cc-border-radius-default, 0.25em);
          flex: 0 0 auto;
          height: 1.5em;
          margin-right: 0.5em;
          width: 1.5em;
        }

        cc-icon {
          flex: 0 0 auto;
          margin-right: 0.5em;
        }

        .cc-link {
          align-items: center;
          display: inline-flex;
        }

        .dashboard-screenshot {
          border-radius: var(--cc-border-radius-default, 0.25em);
          max-width: 50em;
          width: 100%;
        }

        p {
          margin: 0;
        }

        br {
          display: block;
          margin: 0.5em 0;
        }
      `,
    ];
  }
}

window.customElements.define('cc-grafana-info', CcGrafanaInfo);
