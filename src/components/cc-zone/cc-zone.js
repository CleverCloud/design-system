import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { getFlagUrl, getInfraProviderLogoUrl } from '../../lib/remote-assets.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-img/cc-img.js';

/** @type {Zone} */
const SKELETON_ZONE = {
  name: 'name',
  country: '????????????',
  countryCode: null,
  lon: 0,
  lat: 0,
  city: '??????????',
  tags: ['????????', '????????????'],
};

const PRIVATE_ZONE = 'scope:private';

/**
 * @typedef {import('./cc-zone.types.js').ZoneState} ZoneState
 * @typedef {import('./cc-zone.types.js').ZoneStateLoaded} ZoneStateLoaded
 * @typedef {import('./cc-zone.types.js').ZoneModeType} ZoneModeType
 * @typedef {import('../common.types.js').Zone} Zone
 */

/**
 * A display component to show information about a zone.
 *
 * ## Details
 *
 * * When a tag prefixed with `infra:` is used, the corresponding logo is displayed.
 * * When the `scope:private` tag is used, the optional `displayName` of the zone will be used instead of the City + Country.
 * * If the browser supports it, the `countryCode` will be used to display a translated version of the country's name.
 *
 * @cssdisplay flex
 *
 * @cssprop {Color} --cc-zone-default-text-color - Default text color (title and tags) (defaults to #000)
 * @cssprop {Color} --cc-zone-subtitle-color - Text color of the subtitle (country name) (defaults to #555)
 * @cssprop {Color} --cc-zone-tag-bdcolor - Border color of the tags (defaults to transparent)
 * @cssprop {Color} --cc-zone-tag-bgcolor - Background color of the tags (defaults to rgba(50, 50, 255, 0.15))
 * @cssprop {FontWeight} --cc-zone-tag-category-font-weight - Font weight of the first half of the tag (defaults to `normal`)
 * @cssprop {FontFamily} --cc-zone-tag-font-family - Font Family of the tags (defaults to --cc-ff-monospace)
 * @cssprop {Color} --cc-zone-tag-textcolor - Text color of the tags (defaults to --cc-color-text-default)
 * @cssprop {Color} --cc-zone-tag-padding - Padding of the tag (defaults to `0.1em 0.3em`)
 */
export class CcZone extends LitElement {
  static get properties() {
    return {
      mode: { type: String, reflect: true },
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {ZoneModeType} Sets the mode of the component. */
    this.mode = 'default';

    /** @type {ZoneState} Sets the state of the component. */
    this.state = { type: 'loading' };
  }

  // This is a bit irregular to do this but we need to reuse this text logic in a <select>.
  // Moving this to a separated module feels overkill right now.
  /**
   * @param {Zone} zone
   * @returns {string}
   */
  static getText(zone) {
    const { title, subtitle, infra } = CcZone._getTextParts(zone);
    const titleAndSubtitle = [title, subtitle].filter((a) => a != null).join(', ');
    return infra != null ? `${titleAndSubtitle} (${infra})` : titleAndSubtitle;
  }

  /**
   * @param {Zone} zone
   * @returns {{ title: string, subtitle?: string, infra?: string }}
   * @private
   */
  static _getTextParts(zone) {
    if (zone.tags.includes(PRIVATE_ZONE) && zone.displayName != null) {
      return { title: zone.displayName };
    }

    const infraTag = zone.tags.find((t) => t.startsWith('infra:'));
    const infraSlug = infraTag?.split(':')[1] ?? null;
    return {
      title: zone.city,
      subtitle: i18n('cc-zone.country', { code: zone.countryCode, name: zone.country }),
      infra: infraSlug,
    };
  }

  render() {
    const skeleton = this.state.type === 'loading';
    const zone = this.state.type === 'loaded' ? this.state : SKELETON_ZONE;
    const { title, subtitle, infra } = CcZone._getTextParts(zone);

    return html`
      <cc-img
        class="flag"
        ?skeleton=${skeleton}
        src=${ifDefined(getFlagUrl(zone.countryCode))}
        a11y-name=${ifDefined(zone.countryCode)}
      ></cc-img>
      <div class="wrapper-details-logo">
        <div class="wrapper-details">
          <div class="details">
            <span class="title ${classMap({ skeleton })}">${title}</span>
            <span class="subtitle ${classMap({ skeleton })}">${subtitle}</span>
          </div>
          ${infra != null
            ? html`
                <cc-img
                  class="infra-logo ${classMap({ skeleton })}"
                  src=${getInfraProviderLogoUrl(infra)}
                  a11y-name=${infra}
                ></cc-img>
              `
            : ''}
        </div>
        <div class="tag-list">${zone.tags.map((tag) => this._renderTag(tag, skeleton))}</div>
      </div>
    `;
  }

  /**
   * @param {string} tag - the tag to render
   * @param {boolean} skeleton - display as skeleton or not
   * @private
   */
  _renderTag(tag, skeleton) {
    if (tag.includes(':')) {
      // Most of tags are strings separated by ":" but we need to split them in case
      // implementers want to emphasize the category (what is before ":") using `--cc-zone-tag-category-font-weight`
      const [category, value] = tag.split(':');

      return html`
        <span class="tag ${classMap({ skeleton })}">
          <span class="tag__category">${category}:</span>
          <span>${value}</span>
        </span>
      `;
    }

    // When the tag is not made of two parts, we don't want any specific styling
    return html` <span class="tag ${classMap({ skeleton })}">${tag}</span> `;
  }

  static get styles() {
    return [
      skeletonStyles,
      // language=CSS
      css`
        :host {
          --lh: 1.5em;

          display: flex;
        }

        :host([mode='small']),
        :host([mode='small-infra']) {
          --lh: 1em;
        }

        .flag {
          border-radius: var(--cc-border-radius-small, 0.15em);
          box-shadow: 0 0 3px rgb(0 0 0 / 40%);
          display: inline-block;
          height: var(--lh);
          margin-right: 1em;
          width: 2em;
        }

        :host([mode='small']) .flag,
        :host([mode='small-infra']) .flag {
          margin-right: 0.5em;
          width: 1.33em;
        }

        .wrapper-details-logo {
          flex: 1 1 0;
          min-height: var(--lh);
        }

        .wrapper-details {
          display: flex;
        }

        .details {
          align-self: center;
          flex: 1 1 0;
          line-height: var(--lh);
        }

        :host([mode='small']) .title,
        :host([mode='small']) .subtitle,
        :host([mode='small-infra']) .title,
        :host([mode='small-infra']) .subtitle {
          font-size: 0.8em;
        }

        .title {
          font-weight: bold;
        }

        .subtitle {
          color: var(--cc-zone-subtitle-color, var(--cc-color-text-weak));
        }

        .infra-logo {
          --cc-img-fit: contain;

          height: var(--lh);
          margin-left: 0.5em;
          width: 4em;
        }

        :host([mode='small']) .tag-list,
        :host([mode='small']) .infra-logo,
        :host([mode='small-infra']) .tag-list {
          display: none;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          margin-top: 0.1em;
        }

        .tag {
          background-color: var(--cc-zone-tag-bgcolor, var(--cc-color-bg-soft, #eee));
          border: 1px solid var(--cc-zone-tag-bdcolor, transparent);
          border-radius: var(--cc-border-radius-default, 0.25em);
          box-sizing: border-box;
          color: var(--cc-zone-tag-textcolor, var(--cc-color-text-default, #000));
          display: flex;
          font-family: var(--cc-zone-tag-font-family, var(--cc-ff-monospace));
          font-size: 0.8em;
          line-height: 1.5;
          padding: var(--cc-zone-tag-padding, 0.1em 0.3em);
        }

        .tag__category {
          font-weight: var(--cc-zone-tag-category-font-weight, normal);
        }

        .skeleton {
          color: transparent !important;
        }

        .skeleton:not(.tag) {
          background-color: #bbb;
        }
      `,
    ];
  }
}

window.customElements.define('cc-zone', CcZone);
