import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { fakeString } from '../../lib/fake-strings.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-img/cc-img.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-notice/cc-notice.js';
import '../cc-zone/cc-zone.js';

/** @type {Addon} */
const SKELETON_ADDON = {
  id: null,
  realId: null,
  name: fakeString(20),
  provider: {
    name: null,
    logoUrl: null,
  },
  plan: {
    name: fakeString(10),
  },
  creationDate: new Date(),
};

const SKELETON_VERSION = fakeString(5);

/**
 * @typedef {import('./cc-header-addon.types.js').HeaderAddonState} HeaderAddonState
 * @typedef {import('../cc-zone/cc-zone.types.js').ZoneState} ZoneState
 * @typedef {import('../common.types.js').Addon} Addon
 */

/**
 * A component to display various info about an add-on (name, plan, version...).
 *
 * @cssdisplay block
 */
export class CcHeaderAddon extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {HeaderAddonState} Sets the state of addon information and the component in general */
    this.state = { type: 'loading', hasVersion: true };
  }

  render() {
    const addonInfo = this.state.type === 'loaded' ? this.state : SKELETON_ADDON;
    const skeleton = this.state.type === 'loading';
    const creationDateShort = i18n('cc-header-addon.creation-date.short', { date: addonInfo.creationDate });
    const creationDateFull =
      this.state.type === 'loaded'
        ? i18n('cc-header-addon.creation-date.full', { date: addonInfo.creationDate })
        : null;
    const version = this.state.type === 'loaded' && this.state.hasVersion ? this.state.version : SKELETON_VERSION;
    const zoneState = this.state.type === 'loaded' ? { type: 'loaded', ...this.state.zone } : { type: 'loading' };

    if (this.state.type === 'error') {
      return html` <cc-notice intent="warning" message="${i18n('cc-header-addon.error')}"></cc-notice> `;
    }

    return html`
      <div class="wrapper">
        <div class="main">
          <cc-img
            class="logo"
            src="${ifDefined(addonInfo.provider.logoUrl)}"
            a11y-name="${addonInfo.provider.name}"
            title="${ifDefined(addonInfo.provider.name)}"
            skeleton
          ></cc-img>
          <div class="details">
            <div class="name"><span class="${classMap({ skeleton })}">${addonInfo.name}</span></div>
            <div class="addon-id-inputs">
              <cc-input-text
                label=${i18n('cc-header-addon.id-label')}
                hidden-label
                readonly
                clipboard
                value="${ifDefined(addonInfo.id)}"
                ?skeleton=${skeleton}
              ></cc-input-text>
              <cc-input-text
                .label=${i18n('cc-header-addon.id-label-alternative')}
                hidden-label
                readonly
                clipboard
                value="${ifDefined(addonInfo.realId)}"
                ?skeleton=${skeleton}
              ></cc-input-text>
            </div>
          </div>

          <div class="description">
            <div class="description-item">
              <div class="description-label">${i18n('cc-header-addon.plan')}</div>
              <div class="${classMap({ skeleton })}">${addonInfo.plan.name}</div>
            </div>
            ${this.state.hasVersion
              ? html`
                  <div class="description-item">
                    <div class="description-label">${i18n('cc-header-addon.version')}</div>
                    <div class="${classMap({ skeleton })}">${version}</div>
                  </div>
                `
              : ''}
            <div class="description-item">
              <div class="description-label">${i18n('cc-header-addon.creation-date')}</div>
              <div class="${classMap({ skeleton })}" title="${ifDefined(creationDateFull)}">${creationDateShort}</div>
            </div>
          </div>
        </div>

        <div class="messages">
          <cc-zone .state=${zoneState} mode="small-infra"></cc-zone>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      skeletonStyles,
      // language=CSS
      css`
        :host {
          --cc-gap: 1em;

          display: block;
        }

        .wrapper {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          overflow: hidden;
        }

        .main {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
          padding: 1em;
        }

        .logo {
          border-radius: var(--cc-border-radius-default, 0.25em);
          height: 3.25em;
          width: 3.25em;
        }

        .details {
          flex: 1 1 11em;
        }

        .name,
        .description-label {
          margin-bottom: 0.35em;
        }

        .name {
          font-size: 1.1em;
          font-weight: bold;
        }

        .addon-id-inputs {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        .description {
          align-self: center;
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        .description-item {
          flex: 1 1 auto;
        }

        .description-label {
          font-weight: bold;
        }

        .messages {
          align-items: center;
          background-color: var(--cc-color-bg-neutral);
          box-shadow: inset 0 6px 6px -6px rgb(0 0 0 / 40%);
          box-sizing: border-box;
          display: flex;
          flex-wrap: wrap;
          font-size: 0.9em;
          gap: 0.57em;
          justify-content: end;
          padding: 0.7em 1.1em;
        }

        cc-zone {
          font-style: normal;
          white-space: nowrap;
        }

        [title] {
          cursor: help;
        }

        cc-input-text {
          --cc-input-font-family: var(--cc-ff-monospace, monospace);
        }

        /* SKELETON */

        .skeleton {
          background-color: #bbb;
        }
      `,
    ];
  }
}

window.customElements.define('cc-header-addon', CcHeaderAddon);
