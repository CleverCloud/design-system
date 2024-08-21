import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  iconCleverGit as iconGit,
  iconCleverRestartFailed as iconRestartFailed,
  iconCleverRestarting as iconRestarting,
  iconCleverRunning as iconRunning,
  iconCleverStartFailed as iconStartFailed,
  iconCleverStarting as iconStarting,
  iconCleverUnknown as iconUnknown,
} from '../../assets/cc-clever.icons.js';
import { iconRemixStopFill as iconStopped } from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { waitingStyles } from '../../styles/waiting.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-button/cc-button.js';
import '../cc-icon/cc-icon.js';
import '../cc-notice/cc-notice.js';
import '../cc-zone/cc-zone.js';

const COMMIT_ICON = {
  git: iconGit,
  running: iconRunning,
  starting: iconStarting,
};

/** @type {{ [Property in AppStatus]: IconModel }} */
const STATUS_ICON = {
  'restart-failed': iconRestartFailed,
  restarting: iconRestarting,
  'restarting-with-downtime': iconStarting,
  running: iconRunning,
  'start-failed': iconStartFailed,
  starting: iconStarting,
  stopped: iconStopped,
  unknown: iconUnknown,
};

/** @type {Omit<HeaderAppStateLoaded, 'zone'|'type'>} */
const SKELETON_APP_INFO = {
  name: '??????????????????????????',
  commit: '????????????????????????????????????????',
  variantLogo: null,
  variantName: null,
  status: 'unknown',
};

/**
 * @typedef {import('./cc-header-app.types.js').HeaderAppState} HeaderAppState
 * @typedef {import('./cc-header-app.types.js').LastUserAction} LastUserAction
 * @typedef {import('./cc-header-app.types.js').HeaderAppStateLoaded} HeaderAppStateLoaded
 * @typedef {import('../cc-zone/cc-zone.types.js').ZoneState} ZoneState
 * @typedef {import('../common.types.js').IconModel} IconModel
 * @typedef {import('../common.types.js').App} App
 * @typedef {import('lit').PropertyValues<CcHeaderApp>} CcHeaderAppChangedProperties
 * @typedef {import('../common.types.js').AppStatus} AppStatus
 */

/**
 * A component to display various info about an app (name, commits, status...).
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent} cc-header-app:cancel - Fires whenever the cancel button is clicked.
 * @fires {CustomEvent} cc-header-app:restart - Fires whenever one of the 3 restart buttons is clicked.
 * @fires {CustomEvent} cc-header-app:start - Fires whenever one of the 3 start buttons is clicked.
 * @fires {CustomEvent} cc-header-app:stop - Fires whenever the stop button is clicked (after the delay).
 */
export class CcHeaderApp extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
      disableButtons: { type: Boolean, attribute: 'disable-buttons', reflect: true },
      _lastUserAction: { type: String, state: true },
    };
  }

  constructor() {
    super();

    /** @type {HeaderAppState} Sets the application information state. */
    this.state = { type: 'loading' };

    /** @type {boolean} Disables all buttons (in a "login as" use case). */
    this.disableButtons = false;

    /** @type {LastUserAction|null} */
    this._lastUserAction = null;
  }

  /**
   * @param {'git'|'running'|'starting'} type
   * @param {string|null}  [commit]
   * @returns {string|void}
   * @private
   */
  _getCommitTitle(type, commit) {
    if (commit == null) {
      return;
    }
    if (type === 'git') {
      return i18n('cc-header-app.commits.git', { commit });
    }
    if (type === 'running') {
      return i18n('cc-header-app.commits.running', { commit });
    }
    if (type === 'starting') {
      return i18n('cc-header-app.commits.starting', { commit });
    }
  }

  /**
   * @param {LastUserAction} lastUserAction
   * @returns {string|void}
   * @private
   */
  _getLastUserActionMsg(lastUserAction) {
    if (lastUserAction === 'start') {
      return i18n('cc-header-app.user-action-msg.app-will-start');
    }
    if (lastUserAction === 'restart') {
      return i18n('cc-header-app.user-action-msg.deploy-will-begin');
    }
    if (lastUserAction === 'cancel') {
      return i18n('cc-header-app.user-action-msg.deploy-cancelled');
    }
    if (lastUserAction === 'stop') {
      return i18n('cc-header-app.user-action-msg.app-will-stop');
    }
  }

  /**
   * @param {AppStatus} status
   * @returns {string}
   * @private
   */
  _getStatusMsg(status) {
    if (status === 'restart-failed') {
      return i18n('cc-header-app.state-msg.app-is-running') + ' ' + i18n('cc-header-app.state-msg.last-deploy-failed');
    }
    if (status === 'restarting') {
      return i18n('cc-header-app.state-msg.app-is-restarting');
    }
    if (status === 'restarting-with-downtime') {
      return i18n('cc-header-app.state-msg.app-is-restarting');
    }
    if (status === 'running') {
      return i18n('cc-header-app.state-msg.app-is-running');
    }
    if (status === 'start-failed') {
      return i18n('cc-header-app.state-msg.app-is-stopped') + ' ' + i18n('cc-header-app.state-msg.last-deploy-failed');
    }
    if (status === 'starting') {
      return i18n('cc-header-app.state-msg.app-is-starting');
    }
    if (status === 'stopped') {
      return i18n('cc-header-app.state-msg.app-is-stopped');
    }
    return i18n('cc-header-app.state-msg.unknown-state');
  }

  /** @private */
  _onCancel() {
    this._lastUserAction = 'cancel';
    dispatchCustomEvent(this, 'cancel');
  }

  /**
   * @param {'normal'|'rebuild'|'last-commit'} type
   * @private
   */
  _onRestart(type) {
    this._lastUserAction = 'restart';
    dispatchCustomEvent(this, 'restart', type);
  }

  /**
   * @param {'normal'|'rebuild'|'last-commit'} type
   * @private
   */
  _onStart(type) {
    this._lastUserAction = 'start';
    dispatchCustomEvent(this, 'start', type);
  }

  /** @private */
  _onStop() {
    this._lastUserAction = 'stop';
    dispatchCustomEvent(this, 'stop');
  }

  /**
   * @param {CcHeaderAppChangedProperties} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('state') && this.state.type === 'loading') {
      this._lastUserAction = null;
    }
  }

  render() {
    // Quick short circuit for errors
    if (this.state.type === 'error') {
      return html`<cc-notice intent="warning" message="${i18n('cc-header-app.error')}"></cc-notice>`;
    }

    const skeleton = this.state.type === 'loading';
    const zoneState = this.state.type === 'loaded' ? { type: 'loaded', ...this.state.zone } : { type: 'loading' };
    const appInfo = this.state.type === 'loaded' ? this.state : SKELETON_APP_INFO;

    const isDeploying = ['restarting', 'restarting-with-downtime', 'starting'].includes(appInfo.status);
    const isRunning = ['restart-failed', 'restarting', 'running'].includes(appInfo.status);

    return html`
      <div class="wrapper">
        <div class="main">
          <div class="flavor-logo ${classMap({ skeleton })}" title=${ifDefined(appInfo.variantName)}>
            <!-- image has a presentation role => alt="" -->
            <img class="flavor-logo_img" src=${ifDefined(appInfo.variantLogo)} alt="" />
          </div>

          <div class="details">
            <div class="name"><span class=${classMap({ skeleton })}>${appInfo.name}</span></div>
            <div class="commits">
              ${this._renderCommit(appInfo.commit, 'git', this.state.type === 'loading')}
              ${this.state.type === 'loaded' && isRunning
                ? this._renderCommit(appInfo.runningCommit, 'running', false)
                : ''}
              ${this.state.type === 'loaded' && isDeploying
                ? this._renderCommit(appInfo.startingCommit, 'starting', false)
                : ''}
            </div>
          </div>

          <div class="buttons">${this._renderActions(appInfo.status, isDeploying, skeleton)}</div>
        </div>

        <div class="messages ${classMap({ 'cc-waiting': isDeploying })}">
          ${this._renderFooter(appInfo.status, appInfo.lastDeploymentLogsUrl, skeleton)}

          <cc-zone .state=${zoneState} mode="small-infra"></cc-zone>
        </div>
      </div>
    `;
  }

  /**
   * @param {AppStatus} status
   * @param {boolean} isDeploying
   * @param {boolean} skeleton
   * @private
   */
  _renderActions(status, isDeploying, skeleton) {
    const shouldDisableAllButtons = this._lastUserAction != null || this.disableButtons;
    const shouldDisableStopButton = ['start-failed', 'stopped', 'unknown'].includes(status);
    const canStart = ['start-failed', 'stopped'].includes(status);
    const canRestart = skeleton || ['restart-failed', 'running', 'unknown'].includes(status);
    const disableButtonsTitle = this.disableButtons ? i18n('cc-header-app.disable-buttons') : undefined;

    return html`
      ${canStart
        ? html`
            <cc-button
              title=${ifDefined(disableButtonsTitle)}
              ?disabled=${shouldDisableAllButtons}
              @cc-button:click=${() => this._onStart('normal')}
            >
              ${i18n('cc-header-app.action.start')}
            </cc-button>
            <cc-button
              title=${ifDefined(disableButtonsTitle)}
              ?disabled=${shouldDisableAllButtons}
              @cc-button:click=${() => this._onStart('rebuild')}
            >
              ${i18n('cc-header-app.action.start-rebuild')}
            </cc-button>
            <cc-button
              title=${ifDefined(disableButtonsTitle)}
              ?disabled=${shouldDisableAllButtons}
              @cc-button:click=${() => this._onStart('last-commit')}
            >
              ${i18n('cc-header-app.action.start-last-commit')}
            </cc-button>
          `
        : ''}
      ${canRestart
        ? html`
            <cc-button
              title=${ifDefined(disableButtonsTitle)}
              ?skeleton=${skeleton}
              ?disabled=${shouldDisableAllButtons}
              @cc-button:click=${() => this._onRestart('normal')}
            >
              ${i18n('cc-header-app.action.restart')}
            </cc-button>
            <cc-button
              title=${ifDefined(disableButtonsTitle)}
              ?skeleton=${skeleton}
              ?disabled=${shouldDisableAllButtons}
              @cc-button:click=${() => this._onRestart('rebuild')}
            >
              ${i18n('cc-header-app.action.restart-rebuild')}
            </cc-button>
            <cc-button
              title=${ifDefined(disableButtonsTitle)}
              ?skeleton=${skeleton}
              ?disabled=${shouldDisableAllButtons}
              @cc-button:click=${() => this._onRestart('last-commit')}
            >
              ${i18n('cc-header-app.action.restart-last-commit')}
            </cc-button>
          `
        : ''}
      ${isDeploying
        ? html`
            <cc-button
              warning
              outlined
              title=${ifDefined(disableButtonsTitle)}
              ?disabled=${shouldDisableAllButtons}
              @cc-button:click=${this._onCancel}
            >
              ${i18n('cc-header-app.action.cancel-deployment')}
            </cc-button>
          `
        : ''}

      <cc-button
        danger
        outlined
        delay="3"
        title=${ifDefined(disableButtonsTitle)}
        ?skeleton=${skeleton}
        ?disabled=${shouldDisableAllButtons || shouldDisableStopButton}
        @cc-button:click=${this._onStop}
        >${i18n('cc-header-app.action.stop')}</cc-button
      >
    `;
  }

  /**
   * @param {string} commit
   * @param {'git'|'starting'|'running'} type
   * @param {boolean} skeleton
   * @private
   */
  _renderCommit(commit, type, skeleton) {
    if (commit == null && type !== 'git') {
      return '';
    }
    return html`
      <span
        class="commit ${classMap({ 'cc-waiting': type === 'starting' })}"
        title=${ifDefined(skeleton ? undefined : this._getCommitTitle(type, commit))}
        data-type=${type}
      >
        <cc-icon class="commit_img ${type}" .icon=${COMMIT_ICON[type]}></cc-icon>
        ${commit != null
          ? html`
              <!-- Keep this on one line to ease copy/paste -->
              <span class=${classMap({ skeleton })}
                >${commit.slice(0, 8)}<span class="commit_rest">${commit.slice(8)}</span></span
              >
            `
          : ''}
        ${commit == null ? html` <span>${i18n('cc-header-app.commits.no-commits')}</span> ` : ''}
      </span>
    `;
  }

  /**
   * @param {AppStatus} status
   * @param {string|null} lastDeploymentLogsUrl
   * @param {boolean} skeleton
   * @private
   */
  _renderFooter(status, lastDeploymentLogsUrl, skeleton) {
    const shouldDisplayStatusMessage = this._lastUserAction !== 'start' && this._lastUserAction !== 'stop';
    const shouldDisplayLogsLink = [
      'restart-failed',
      'restarting',
      'restarting-with-downtime',
      'starting',
      'start-failed',
    ].includes(status);

    return html`
      ${shouldDisplayStatusMessage
        ? html`
            <cc-icon class="status-icon ${status}" size="lg" .icon=${STATUS_ICON[status]}></cc-icon>
            <span class=${classMap({ skeleton })}> ${this._getStatusMsg(status)} </span>
            ${shouldDisplayLogsLink ? ccLink(lastDeploymentLogsUrl, i18n('cc-header-app.read-logs')) : ''}
          `
        : ''}
      ${this._lastUserAction != null ? html` ${this._getLastUserActionMsg(this._lastUserAction)} ` : ''}

      <span class="spacer"></span>
    `;
  }

  static get styles() {
    return [
      skeletonStyles,
      linkStyles,
      waitingStyles,
      // language=CSS
      css`
        :host {
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

        .flavor-logo {
          align-self: flex-start;
          border-radius: var(--cc-border-radius-default, 0.25em);
          height: 3.25em;
          overflow: hidden;
          width: 3.25em;
        }

        .flavor-logo_img {
          display: block;
          height: 100%;
          width: 100%;
        }

        .skeleton .flavor-logo_img {
          opacity: 0;
        }

        .details {
          display: flex;
          flex: 1 1 max-content;
          flex-direction: column;
          justify-content: space-between;
        }

        .commits {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        .name {
          font-size: 1.1em;
          font-weight: bold;
        }

        .commit {
          align-items: center;
          display: flex;
        }

        .commit_img {
          margin-right: 0.2em;
        }

        .commit_img.git {
          --cc-icon-color: #555;
          --cc-icon-size: 1.3em;
        }

        .commit_img.running {
          --cc-icon-color: var(--color-legacy-green);
          --cc-icon-size: 1.25em;
        }

        .commit_img.starting {
          --cc-icon-color: var(--color-legacy-blue-icon);
          --cc-icon-size: 1.25em;
        }

        /* We hide the right part of the commit this way so this can be part of a copy/paste */

        .commit_rest {
          font-size: 0;
        }

        .buttons {
          align-self: center;
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        cc-button {
          flex: 1 1 auto;
          min-width: 0;
        }

        :host([disable-buttons]) cc-button {
          cursor: not-allowed;
        }

        .messages {
          align-items: center;
          background-color: var(--cc-color-bg-neutral);
          box-shadow: inset 0 6px 6px -6px rgb(0 0 0 / 40%);
          box-sizing: border-box;
          display: flex;
          flex-wrap: wrap;
          font-size: 0.9em;
          font-style: italic;
          gap: 0.57em;
          padding: 0.5em 1.1em;
        }

        .status-icon {
          font-size: unset;
          margin-block: 0;
          margin-inline-end: 0;
        }

        .status-icon.restarting-with-downtime {
          --cc-icon-color: var(--color-legacy-blue-icon);
          --cc-icon-size: 1.25em;
        }

        .status-icon.running {
          --cc-icon-color: var(--color-legacy-green);
          --cc-icon-size: 1.25em;
        }

        .status-icon.start-failed {
          --cc-icon-color: var(--color-legacy-red);
          --cc-icon-size: 1.25em;
        }

        .status-icon.starting {
          --cc-icon-color: var(--color-legacy-blue-icon);
          --cc-icon-size: 1.25em;
        }

        .status-icon.stopped {
          --cc-icon-color: #ddd;
        }

        .status-icon.unknown {
          --cc-icon-color: #ddd;
        }

        .spacer {
          flex: 1 1 0;
        }

        cc-zone {
          font-style: normal;
          white-space: nowrap;
        }

        [title] {
          cursor: help;
        }

        /* SKELETON */

        .skeleton {
          background-color: #bbb;
        }
      `,
    ];
  }
}

window.customElements.define('cc-header-app', CcHeaderApp);
