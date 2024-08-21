import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import {
  iconRemixForbid_2Line as iconRedirectionOff,
  iconRemixLoginCircleFill as iconRedirectionOn,
} from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { waitingStyles } from '../../styles/waiting.js';
import '../cc-button/cc-button.js';
import '../cc-icon/cc-icon.js';
import '../cc-loader/cc-loader.js';

/** @type {TcpRedirection} */
const SKELETON_REDIRECTION = { namespace: 'default', isPrivate: false };

/**
 * @typedef {import('./cc-tcp-redirection.types.js').TcpRedirectionState} TcpRedirectionState
 * @typedef {import('./cc-tcp-redirection.types.js').TcpRedirectionStateLoaded} TcpRedirectionStateLoaded
 * @typedef {import('./cc-tcp-redirection.types.js').TcpRedirectionStateWaiting} TcpRedirectionStateWaiting
 * @typedef {import('./cc-tcp-redirection.types.js').CreateTcpRedirection} CreateTcpRedirection
 * @typedef {import('./cc-tcp-redirection.types.js').DeleteTcpRedirection} DeleteTcpRedirection
 * @typedef {import('./cc-tcp-redirection.types.js').TcpRedirection} TcpRedirection
 */

/**
 * A small form to create or delete a TCP redirection.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<CreateTcpRedirection>} cc-tcp-redirection:create - Fires a redirection namespace whenever the create button is clicked.
 * @fires {CustomEvent<DeleteTcpRedirection>} cc-tcp-redirection:delete - Fires a redirection whenever the delete button is clicked.
 */
export class CcTcpRedirection extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {TcpRedirectionState} Sets the state of the component. */
    this.state = { type: 'loading' };
  }

  /**
   * @param {number|null} sourcePort
   * @returns {string}
   * @private
   */
  _getButtonText(sourcePort) {
    return sourcePort != null ? i18n('cc-tcp-redirection.delete-button') : i18n('cc-tcp-redirection.create-button');
  }

  /**
   * @param {string} namespace
   * @param {number|null} sourcePort
   * @returns {string}
   * @private
   */
  _getHelpText(namespace, sourcePort) {
    return sourcePort != null
      ? i18n('cc-tcp-redirection.redirection-defined', { namespace, sourcePort })
      : i18n('cc-tcp-redirection.redirection-not-defined', { namespace });
  }

  /**
   * @param {string} namespace
   * @param {boolean} isPrivate
   * @returns {string}
   * @private
   */
  _getHelpTextAddendum(namespace, isPrivate) {
    if (isPrivate) {
      return i18n('cc-tcp-redirection.namespace-private');
    }
    switch (namespace) {
      case 'default':
        return i18n('cc-tcp-redirection.namespace-additionaldescription-default');
      case 'cleverapps':
        return i18n('cc-tcp-redirection.namespace-additionaldescription-cleverapps');
      default:
        return null;
    }
  }

  /**
   * @param {TcpRedirectionState} state
   * @returns {state is (TcpRedirectionStateLoaded | TcpRedirectionStateWaiting)}
   * @private
   */
  _isStateLoadedOrWaiting(state) {
    return state.type === 'loaded' || state.type === 'waiting';
  }

  /** @private */
  _onCreate() {
    if (this._isStateLoadedOrWaiting(this.state)) {
      const { namespace } = this.state;
      dispatchCustomEvent(this, 'create', { namespace });
    }
  }

  /** @private */
  _onDelete() {
    if (this._isStateLoadedOrWaiting(this.state)) {
      const { namespace, sourcePort } = this.state;
      dispatchCustomEvent(this, 'delete', { namespace, sourcePort });
    }
  }

  render() {
    const skeleton = this.state.type === 'loading';

    // Use a fake redirection for skeleton mode
    const { namespace, sourcePort, isPrivate } = this.state.type === 'loading' ? SKELETON_REDIRECTION : this.state;

    const isRedirectionDefined = sourcePort != null;
    const helpTextAddendum = this._getHelpTextAddendum(namespace, isPrivate);

    return html`
      <div class="wrapper">
        ${skeleton ? html` <div class="icon skeleton"></div> ` : ''}
        ${this.state.type === 'loaded'
          ? html`
              <div class="icon">
                ${isRedirectionDefined
                  ? html`<cc-icon .icon=${iconRedirectionOn} class="on"></cc-icon>`
                  : html`<cc-icon .icon=${iconRedirectionOff} class="off"></cc-icon>`}
              </div>
            `
          : ''}
        ${this.state.type === 'waiting'
          ? html`
              <div class="icon">
                <cc-loader></cc-loader>
              </div>
            `
          : ''}

        <div class="text-button ${classMap({ 'cc-waiting': skeleton })}">
          <div class="text-wrapper">
            <span class="text ${classMap({ skeleton })}">${this._getHelpText(namespace, sourcePort)}</span>
            ${helpTextAddendum != null
              ? html`
                  <br />
                  <span class="text-addendum ${classMap({ skeleton })}">${helpTextAddendum}</span>
                `
              : ''}
          </div>

          <cc-button
            outlined
            ?skeleton=${skeleton}
            ?waiting=${this.state.type === 'waiting'}
            ?danger=${isRedirectionDefined}
            delay=${isRedirectionDefined ? 3 : 0}
            ?primary=${!isRedirectionDefined}
            @cc-button:click=${isRedirectionDefined ? this._onDelete : this._onCreate}
          >
            ${this._getButtonText(sourcePort)}
          </cc-button>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      skeletonStyles,
      waitingStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8em;
        }

        .icon {
          flex: 0 0 auto;
          height: 1.5em;
          width: 1.5em;
        }

        .icon cc-icon {
          height: 100%;
          width: 100%;
        }

        .icon cc-icon.off {
          --cc-icon-color: #999;
        }

        .icon cc-icon.on {
          --cc-icon-color: var(--cc-color-bg-success);
        }

        .icon cc-loader {
          --cc-loader-color: #999;
        }

        .text-button {
          display: flex;
          flex: 1 1 0;
          flex-wrap: wrap;
          gap: 1em;
        }

        .text-wrapper {
          flex: 1 1 30em;
          line-height: 1.6em;
        }

        .text strong {
          white-space: nowrap;
        }

        .text:not(.skeleton) code {
          background-color: var(--cc-color-bg-neutral);
          border-radius: var(--cc-border-radius-default, 0.25em);
          font-family: var(--cc-ff-monospace);
          padding: 0.15em 0.3em;
        }

        .text-addendum:not(.skeleton) {
          color: var(--cc-color-text-weak);
        }

        .skeleton {
          background-color: #bbb;
        }
      `,
    ];
  }
}

window.customElements.define('cc-tcp-redirection', CcTcpRedirection);
