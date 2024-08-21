import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { iconRemixAlertFill as iconAlert } from '../../assets/cc-remix.icons.js';
import { tileStyles } from '../../styles/info-tiles.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';
import '../cc-datetime-relative/cc-datetime-relative.js';
import '../cc-icon/cc-icon.js';

const SKELETON_DEPLOYS = [
  { state: '???????', date: '??????????' },
  { state: '??????', date: '???????????' },
];

/**
 * @typedef {import('./cc-tile-deployments.types.js').TileDeploymentsState} TileDeploymentsState
 */

/**
 * A "tile" component to display a list of deployments info (state, humanized time ago and logs link).
 *
 * @cssdisplay grid
 */
export class CcTileDeployments extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {TileDeploymentsState} Sets tile deployments state (it's up to you to only pass 2 or 3 deployments info) */
    this.state = { type: 'loading' };
  }

  _getStateLabel(state, action) {
    if (state === 'OK') {
      return action === 'UNDEPLOY'
        ? i18n('cc-tile-deployments.state.stopped')
        : i18n('cc-tile-deployments.state.started');
    }
    if (state === 'FAIL') {
      return i18n('cc-tile-deployments.state.failed');
    }
    if (state === 'CANCELLED') {
      return i18n('cc-tile-deployments.state.cancelled');
    }
    return state;
  }

  render() {
    return html`
      <div class="tile_title">${i18n('cc-tile-deployments.title')}</div>
      ${this._renderTileContent()}
    `;
  }

  _renderTileContent() {
    if (this.state.type === 'error') {
      return html`
        <div class="tile_message">
          <div class="error-message">
            <cc-icon
              .icon="${iconAlert}"
              a11y-name="${i18n('cc-tile-deployments.error.icon-a11y-name')}"
              class="icon-warning"
            ></cc-icon>
            <p>${i18n('cc-tile-deployments.error')}</p>
          </div>
        </div>
      `;
    }

    const skeleton = this.state.type === 'loading';
    const deploymentsInfo = skeleton ? SKELETON_DEPLOYS : this.state.deploymentsInfo;
    const hasData = deploymentsInfo.length > 0;

    if (!hasData) {
      return html` <div class="tile_message">${i18n('cc-tile-deployments.empty')}</div> `;
    }

    return html`
      <div class="tile_body">
        <!-- We don't really need to repeat and key by -->
        ${deploymentsInfo.map(
          (deploymentInfo) => html`
            <div class="state" data-state=${deploymentInfo.state}>
              <span class=${classMap({ skeleton })}
                >${this._getStateLabel(deploymentInfo.state, deploymentInfo.action)}</span
              >
            </div>
            <div class="date">
              ${skeleton ? html` <span class="skeleton">${deploymentInfo.date}</span> ` : ''}
              ${!skeleton ? html` <cc-datetime-relative datetime=${deploymentInfo.date}></cc-datetime-relative> ` : ''}
            </div>
            <div>${ccLink(deploymentInfo.logsUrl, 'logs', skeleton)}</div>
          `,
        )}
      </div>
    `;
  }

  static get styles() {
    return [
      tileStyles,
      skeletonStyles,
      linkStyles,
      // language=CSS
      css`
        .tile_body {
          align-items: start;
          grid-gap: 1em;
          grid-template-columns: auto auto auto;
          justify-content: space-between;
        }

        .state {
          font-weight: bold;
        }

        .state[data-state='CANCELLED'] {
          color: var(--cc-color-text-warning);
        }

        .state[data-state='FAIL'] {
          color: var(--cc-color-text-danger);
        }

        .state[data-state='OK'] {
          color: var(--cc-color-text-success);
        }

        [title] {
          cursor: help;
        }

        .skeleton {
          background-color: #bbb;
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

window.customElements.define('cc-tile-deployments', CcTileDeployments);
