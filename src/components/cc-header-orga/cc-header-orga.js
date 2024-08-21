import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import {
  iconRemixVerifiedBadgeFill as iconBadge,
  iconRemixPhoneFill as iconPhone,
} from '../../assets/cc-remix.icons.js';
import '../cc-badge/cc-badge.js';
import '../cc-img/cc-img.js';
import '../cc-notice/cc-notice.js';

import { skeletonStyles } from '../../styles/skeleton.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';

/**
 * @typedef {import('./cc-header-orga.types.js').HeaderOrgaState} HeaderOrgaState
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 */

/**
 * A component to display various info about an orga (name and enterprise status).
 *
 * @slot footer - An area displayed at the bottom of the header. Content should be short. The element you slot gets a default styling (background color, top border and padding).
 *
 * @cssdisplay block
 */
export class CcHeaderOrga extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {HeaderOrgaState} Sets the component state. */
    this.state = {
      type: 'loading',
    };
  }

  /**
   * @param {string} name
   * @returns {string}
   * @private
   */
  _getInitials(name) {
    return name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((a) => a[0].toUpperCase())
      .join('');
  }

  render() {
    if (this.state.type === 'error') {
      return html` <cc-notice intent="warning" message="${i18n('cc-header-orga.error')}"></cc-notice> `;
    }

    if (this.state.type === 'loading') {
      return this._renderHeader({
        name: '??????????????????????????',
        skeleton: true,
      });
    }

    if (this.state.type === 'loaded') {
      return this._renderHeader({
        name: this.state.name,
        avatar: this.state.avatar,
        cleverEnterprise: this.state.cleverEnterprise,
        emergencyNumber: this.state.emergencyNumber,
        skeleton: false,
      });
    }

    return '';
  }

  /**
   * @param {Object} param
   * @param {string} param.name
   * @param {string} [param.avatar]
   * @param {boolean} [param.cleverEnterprise]
   * @param {string} [param.emergencyNumber]
   * @param {boolean} [param.skeleton]
   * @returns {TemplateResult}
   * @private
   */
  _renderHeader({ name, avatar = null, cleverEnterprise = false, emergencyNumber = null, skeleton = false }) {
    return html`
      <div class="wrapper">
        <div class="header-body">
          <p class="identity">
            ${this._renderAvatar(skeleton, avatar, name)}
            <span class="name ${classMap({ skeleton })}">${name}</span>
          </p>
          <div class="enterprise">
            <p class="enterprise-row">
              ${cleverEnterprise
                ? html`
                    <cc-icon .icon=${iconBadge}></cc-icon>
                    <span lang="en">Clever Cloud Enterprise</span>
                  `
                : ''}
            </p>
            ${emergencyNumber != null
              ? html`
                  <p class="enterprise-row">
                    <cc-icon .icon=${iconPhone}>${emergencyNumber}</cc-icon>
                    <span>
                      ${i18n('cc-header-orga.hotline')}
                      <a class="cc-link" href="tel:${emergencyNumber}">${emergencyNumber}</a>
                    </span>
                  </p>
                `
              : ''}
          </div>
        </div>
        <slot name="footer"></slot>
      </div>
    `;
  }

  /**
   * @param {boolean} skeleton
   * @param {string} avatar
   * @param {string} name
   * @returns {TemplateResult}
   * @private
   */
  _renderAvatar(skeleton, avatar, name) {
    if (skeleton) {
      return html` <cc-img class="logo" skeleton></cc-img> `;
    }

    if (avatar == null) {
      return html`
        <span class="initials" aria-hidden="true">
          <span>${this._getInitials(name)}</span>
        </span>
      `;
    }

    return html` <cc-img class="logo" src="${avatar}"></cc-img> `;
  }

  static get styles() {
    return [
      linkStyles,
      skeletonStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        p {
          margin: 0;
        }

        cc-notice {
          width: 100%;
        }

        .wrapper {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          overflow: hidden;
        }

        .header-body {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
          justify-content: space-between;
          padding: 1em;
        }

        .identity {
          align-items: center;
          display: flex;
          gap: 1em;
        }

        .logo,
        .initials {
          border-radius: var(--cc-border-radius-default, 0.25em);
          flex: 0 0 auto;
          height: 3.25em;
          width: 3.25em;
        }

        .initials {
          align-items: center;
          background-color: var(--cc-color-bg-neutral);
          display: flex;
          justify-content: center;
        }

        .initials span {
          font-size: 0.85em;
        }

        .name {
          font-size: 1.3em;
          font-weight: bold;
        }

        .enterprise {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }

        .enterprise-row {
          align-items: center;
          display: flex;
          gap: 0.5em;
        }

        .enterprise-row cc-icon {
          --cc-icon-color: var(--cc-color-text-primary-highlight);

          flex: 0 0 auto;
        }

        ::slotted([slot='footer']) {
          background-color: var(--cc-color-bg-neutral);
          border-top: solid 1px var(--cc-color-border-neutral-weak);
          padding: 0.5em 1em;
        }

        /* SKELETON */

        .skeleton {
          background-color: #bbb;
        }
      `,
    ];
  }
}

window.customElements.define('cc-header-orga', CcHeaderOrga);
