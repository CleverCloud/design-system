import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { iconRemixAlertFill as iconAlert } from '../../assets/cc-remix.icons.js';
import { instanceDetailsStyles, tileStyles } from '../../styles/info-tiles.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-icon/cc-icon.js';

/** @type {Scalability} */
const SKELETON_SCALABILITY = {
  minFlavor: { name: '??', cpus: 0, gpus: 0, mem: 0, microservice: false, monthlyCost: 0 },
  maxFlavor: { name: '?', cpus: 0, gpus: 0, mem: 0, microservice: false, monthlyCost: 0 },
  minInstances: 0,
  maxInstances: 0,
};

/**
 * @typedef {import('./cc-tile-scalability.types.js').TileScalabilityState} TileScalabilityState
 * @typedef {import('./cc-tile-scalability.types.js').TileScalabilityStateLoading} TileScalabilityStateLoading
 * @typedef {import('./cc-tile-scalability.types.js').TileScalabilityStateLoaded} TileScalabilityStateLoaded
 * @typedef {import('../common.types.js').Scalability} Scalability
 * @typedef {import('../common.types.js').Flavor} Flavor
 */

/**
 * A "tile" component to display the current config of scalability for a given app.
 *
 * @cssdisplay grid
 */
export class CcTileScalability extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {TileScalabilityState} Sets the state of the component. */
    this.state = { type: 'loading' };
  }

  /**
   * @param {string} name
   * @returns {string}
   * @private
   */
  _formatFlavorName(name) {
    // For now, we strip the ML_ prefix from ML VMs, this may change in the future
    return name.replace(/^ML_/, '');
  }

  /**
   * @param {Flavor} flavor
   * @returns {string|null}
   * @private
   */
  _getFlavorDetails(flavor) {
    if (flavor.cpus == null) {
      return null;
    }
    return i18n('cc-tile-scalability.flavor-info', { ...flavor });
  }

  render() {
    const skeleton = this.state.type === 'loading';
    const { minFlavor, maxFlavor, minInstances, maxInstances } =
      this.state.type === 'loaded' ? this.state : SKELETON_SCALABILITY;
    const isLoadedOrLoading = this.state.type === 'loaded' || this.state.type === 'loading';

    return html`
      <div class="tile_title">${i18n('cc-tile-scalability.title')}</div>

      ${this.state.type === 'error'
        ? html`
            <div class="tile_message">
              <div class="error-message">
                <cc-icon
                  .icon="${iconAlert}"
                  a11y-name="${i18n('cc-tile-scalability.error.icon-a11y-name')}"
                  class="icon-warning"
                ></cc-icon>
                <p>${i18n('cc-tile-scalability.error')}</p>
              </div>
            </div>
          `
        : ''}
      ${isLoadedOrLoading
        ? html`
            <div class="tile_body">
              <div class="label">${i18n('cc-tile-scalability.size')}</div>
              <div class="info">
                <div class="size-label ${classMap({ skeleton })}" title=${ifDefined(this._getFlavorDetails(minFlavor))}>
                  ${this._formatFlavorName(minFlavor.name)}
                </div>
                <div class="separator"></div>
                <div class="size-label ${classMap({ skeleton })}" title=${ifDefined(this._getFlavorDetails(maxFlavor))}>
                  ${this._formatFlavorName(maxFlavor.name)}
                </div>
              </div>
              <div class="label">${i18n('cc-tile-scalability.number')}</div>
              <div class="info">
                <div class="count-bubble ${classMap({ skeleton })}">${minInstances}</div>
                <div class="separator"></div>
                <div class="count-bubble ${classMap({ skeleton })}">${maxInstances}</div>
              </div>
            </div>
          `
        : ''}
    `;
  }

  static get styles() {
    return [
      tileStyles,
      instanceDetailsStyles,
      skeletonStyles,
      // language=CSS
      css`
        .tile_body {
          align-items: center;
          grid-column-gap: 2em;
          grid-row-gap: 1em;
          grid-template-columns: auto 1fr;
        }

        .info {
          align-items: center;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .separator {
          border-top: 1px dashed var(--cc-color-border-neutral-strong, #8c8c8c);
          flex: 1 1 0;
          width: 1.5em;
        }

        [title] {
          cursor: help;
        }

        .error-message {
          display: grid;
          gap: 0.75em;
          grid-template-columns: min-content 1fr;
          text-align: left;
        }

        .error-message p {
          margin: 0;
        }

        .icon-warning {
          align-self: center;
          color: var(--cc-color-text-warning);

          --cc-icon-size: 1.25em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-tile-scalability', CcTileScalability);
