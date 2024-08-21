import { css, html, LitElement } from 'lit';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';
import '../cc-badge/cc-badge.js';
import '../cc-block/cc-block.js';
import '../cc-notice/cc-notice.js';
import '../cc-tcp-redirection/cc-tcp-redirection.js';

/** @type {TcpRedirectionStateLoading[]} */
const SKELETON_REDIRECTIONS = [{ type: 'loading' }, { type: 'loading' }];

/**
 * @typedef {import('./cc-tcp-redirection-form.types.js').TcpRedirectionFormContextType} TcpRedirectionFormContextType
 * @typedef {import('./cc-tcp-redirection-form.types.js').TcpRedirectionFormState} TcpRedirectionFormState
 * @typedef {import('../cc-tcp-redirection/cc-tcp-redirection.types.js').TcpRedirectionStateLoading} TcpRedirectionStateLoading
 * @typedef {import('../cc-tcp-redirection/cc-tcp-redirection.types.js').CreateTcpRedirection} CreateTcpRedirection
 * @typedef {import('../cc-tcp-redirection/cc-tcp-redirection.types.js').DeleteTcpRedirection} DeleteTcpRedirection
 */

/**
 * An interface to create / delete TCP redirections in the context of an application.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<CreateTcpRedirection>} cc-tcp-redirection:create - Fires a redirection namespace whenever the create button is clicked.
 * @fires {CustomEvent<DeleteTcpRedirection>} cc-tcp-redirection:delete - Fires a redirection whenever the delete button is clicked.
 */
export class CcTcpRedirectionForm extends LitElement {
  static get properties() {
    return {
      context: { type: String },
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {TcpRedirectionFormContextType} Defines in which context the form is used so it can show the appropriate description or lack thereof (defaults to user). */
    this.context = 'user';

    /** @type {TcpRedirectionFormState} Sets the state of the component. */
    this.state = { type: 'loading' };
  }

  render() {
    const blockState = this.context === 'admin' ? 'close' : 'off';

    return html`
      <cc-block state="${blockState}">
        <div slot="title">${i18n('cc-tcp-redirection-form.title')} ${this._renderRedirectionCountBadge()}</div>

        ${this.context === 'user'
          ? html` <div class="description">${i18n('cc-tcp-redirection-form.description')}</div> `
          : ''}
        ${this.state.type === 'error'
          ? html` <cc-notice intent="warning" message="${i18n('cc-tcp-redirection-form.error')}"></cc-notice> `
          : ''}
        ${this.state.type === 'loading'
          ? html`
              ${SKELETON_REDIRECTIONS.map(
                (skeletonRedirectionState) => html`
                  <cc-tcp-redirection .state=${skeletonRedirectionState}></cc-tcp-redirection>
                `,
              )}
            `
          : ''}
        ${this.state.type === 'loaded'
          ? html`
              ${this.state.redirections.map(
                (redirectionState) => html` <cc-tcp-redirection .state=${redirectionState}></cc-tcp-redirection> `,
              )}
              ${this.state.redirections.length === 0
                ? html` <div class="cc-block_empty-msg">${i18n('cc-tcp-redirection-form.empty')}</div> `
                : ''}
            `
          : ''}
      </cc-block>
    `;
  }

  /** @private */
  _renderRedirectionCountBadge() {
    if (this.context === 'admin' && this.state.type === 'loaded') {
      const redirectionCount = this.state.redirections.filter(({ sourcePort }) => sourcePort != null).length;
      if (redirectionCount >= 1) {
        return html` <cc-badge circle weight="strong">${redirectionCount}</cc-badge> `;
      }
    }
    return '';
  }

  static get styles() {
    return [
      linkStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        cc-badge {
          /* cc-block title changes the font-size to 1.2em, which makes our badge way too big */
          font-size: 0.8em;
          margin-left: 0.5em;
          vertical-align: middle;
        }

        .description {
          line-height: 1.6;
        }

        .description p {
          margin: 0;
          margin-bottom: 1em;
        }

        .description code {
          background-color: var(--cc-color-bg-neutral);
          border-radius: var(--cc-border-radius-default, 0.25em);
          font-family: var(--cc-ff-monospace);
          padding: 0.15em 0.3em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-tcp-redirection-form', CcTcpRedirectionForm);
