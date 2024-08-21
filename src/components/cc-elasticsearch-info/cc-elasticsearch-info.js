import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { iconRemixInformationFill as iconInfo } from '../../assets/cc-remix.icons.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-block/cc-block.js';
import '../cc-icon/cc-icon.js';
import '../cc-img/cc-img.js';
import '../cc-notice/cc-notice.js';

const ELASTICSEARCH_LOGO_URL = 'https://assets.clever-cloud.com/logos/elastic.svg';
const KIBANA_LOGO_URL = 'https://assets.clever-cloud.com/logos/elasticsearch-kibana.svg';
const APM_LOGO_URL = 'https://assets.clever-cloud.com/logos/elasticsearch-apm.svg';
const ELASTICSEARCH_DOCUMENTATION = 'https://www.clever-cloud.com/doc/addons/elastic/';
const linksSortOrder = ['elasticsearch', 'kibana', 'apm'];

/**
 * @typedef {import('./cc-elasticsearch-info.types.js').ElasticSearchInfoState} ElasticSearchInfoState
 * @typedef {import('./cc-elasticsearch-info.types.js').ElasticSearchInfoStateLoaded} ElasticSearchInfoStateLoaded
 * @typedef {import('./cc-elasticsearch-info.types.js').ElasticSearchInfoStateLoading} ElasticSearchInfoStateLoading
 * @typedef {import('./cc-elasticsearch-info.types.js').LinkType} LinkType
 * @typedef {import('./cc-elasticsearch-info.types.js').LinkLoading} LinkLoading
 * @typedef {import('./cc-elasticsearch-info.types.js').LinkLoaded} LinkLoaded
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 */

/**
 * A component to display various links (Documentation, kibana, APM) for an elasticsearch service.
 *
 * ## Details
 *
 * * You need to list the links you want to display in `links`.
 *
 * @cssdisplay block
 */
export class CcElasticsearchInfo extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {ElasticSearchInfoState} Sets the state of the component */
    this.state = {
      type: 'loading',
      links: [{ type: 'elasticsearch' }, { type: 'kibana' }, { type: 'apm' }],
    };
  }

  /**
   * @param {LinkType} linkType
   * @returns {string} the corresponding translation
   * @private
   */
  _getLinkText(linkType) {
    switch (linkType) {
      case 'elasticsearch':
        return i18n('cc-elasticsearch-info.link.elasticsearch');
      case 'kibana':
        return i18n('cc-elasticsearch-info.link.kibana');
      case 'apm':
        return i18n('cc-elasticsearch-info.link.apm');
    }
  }

  /**
   * @param {LinkType} linkType
   * @returns {string} the corresponding logo URL
   * @private
   */
  _getLogo(linkType) {
    switch (linkType) {
      case 'elasticsearch':
        return ELASTICSEARCH_LOGO_URL;
      case 'kibana':
        return KIBANA_LOGO_URL;
      case 'apm':
        return APM_LOGO_URL;
    }
  }

  /**
   * @param {Array<LinkLoaded|LinkLoading>} links
   * @returns {Array<LinkLoaded|LinkLoading>} sorted Links
   */
  _getSortedLinks(links) {
    return links.sort((a, b) => {
      return linksSortOrder.indexOf(a.type) - linksSortOrder.indexOf(b.type);
    });
  }

  render() {
    const skeleton = this.state.type === 'loading';

    if (this.state.type === 'error') {
      return html`<cc-notice intent="warning" message="${i18n('cc-elasticsearch-info.error')}"></cc-notice>`;
    }

    return html`
      <cc-block ribbon=${i18n('cc-elasticsearch-info.info')} no-head>
        <div class="info-text">${i18n('cc-elasticsearch-info.text')}</div>

        <div class="link-list">
          ${ccLink(
            ELASTICSEARCH_DOCUMENTATION,
            html`
              <cc-icon size="lg" .icon=${iconInfo}></cc-icon>
              <span>${i18n('cc-elasticsearch-info.link.doc')}</span>
            `,
          )}
          ${this._renderLinks(this.state.links, skeleton)}
        </div>
      </cc-block>
    `;
  }

  /**
   * @param {LinkLoaded[]|LinkLoading[]} links
   * @param {Boolean} skeleton
   * @returns {TemplateResult[]}
   * @private
   */
  _renderLinks(links, skeleton) {
    const sortedLinks = this._getSortedLinks(links);

    return sortedLinks.map(({ href, type }) =>
      ccLink(
        href,
        html`
          <cc-img src="${this._getLogo(type)}"></cc-img>
          <span class="${classMap({ skeleton })}">${this._getLinkText(type)}</span>
        `,
      ),
    );
  }

  static get styles() {
    return [
      skeletonStyles,
      linkStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .link-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        .cc-link {
          align-items: center;
          display: flex;
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

        /* SKELETON */

        .skeleton {
          background-color: #bbb;
        }
      `,
    ];
  }
}

window.customElements.define('cc-elasticsearch-info', CcElasticsearchInfo);
