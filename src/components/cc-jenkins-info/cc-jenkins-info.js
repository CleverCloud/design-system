import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { iconRemixInformationFill as iconInfo } from '../../assets/cc-remix.icons.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';
import '../cc-block-section/cc-block-section.js';
import '../cc-block/cc-block.js';
import '../cc-icon/cc-icon.js';
import '../cc-img/cc-img.js';
import '../cc-notice/cc-notice.js';

const JENKINS_LOGO_URL = 'https://assets.clever-cloud.com/logos/jenkins.svg';
const JENKINS_DOCUMENTATION = 'https://www.clever-cloud.com/doc/deploy/addon/jenkins/';

/**
 * @typedef {import('./cc-jenkins-info.types.js').JenkinsInfoState} JenkinsInfoState
 */

/**
 * A component to display various information (Documentation, access, updates, ...) for a Jenkins service.
 *
 * @cssdisplay block
 */
export class CcJenkinsInfo extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {JenkinsInfoState} Sets the Jenkins info state. */
    this.state = { type: 'loading' };
  }

  render() {
    if (this.state.type === 'error') {
      return html`<cc-notice intent="warning" message="${i18n('cc-jenkins-info.error')}"></cc-notice>`;
    }

    const skeleton = this.state.type === 'loading';
    const jenkinsLink = this.state.type === 'loaded' ? this.state.jenkinsLink : null;
    const jenkinsManageLink = this.state.type === 'loaded' ? this.state.jenkinsManageLink : null;
    const versions = this.state.type === 'loaded' ? this.state.versions : {};
    const hasNewVersion = versions.current !== versions.available;

    return html`
      <cc-block ribbon=${i18n('cc-jenkins-info.info')} no-head>
        <div class="info-text">${i18n('cc-jenkins-info.text')}</div>

        <cc-block-section>
          <div slot="title">${i18n('cc-jenkins-info.open-jenkins.title')}</div>
          <div slot="info">${i18n('cc-jenkins-info.open-jenkins.text')}</div>
          <div class="one-line-form">
            ${ccLink(
              jenkinsLink,
              html`
                <cc-img src="${JENKINS_LOGO_URL}"></cc-img
                ><span class="${classMap({ skeleton })}">${i18n('cc-jenkins-info.open-jenkins.link')}</span>
              `,
            )}
          </div>
        </cc-block-section>

        <cc-block-section>
          <div slot="title">${i18n('cc-jenkins-info.documentation.title')}</div>
          <div slot="info">${i18n('cc-jenkins-info.documentation.text')}</div>
          <div class="one-line-form">
            ${ccLink(
              JENKINS_DOCUMENTATION,
              html`
                <cc-icon size="lg" .icon=${iconInfo}></cc-icon
                ><span>${i18n('cc-jenkins-info.documentation.link')}</span>
              `,
            )}
          </div>
        </cc-block-section>

        <cc-block-section>
          <div slot="title">${i18n('cc-jenkins-info.update.title')}</div>
          <div slot="info">${i18n('cc-jenkins-info.update.text')}</div>
          <div class="one-line-form">
            ${ccLink(
              jenkinsManageLink,
              html`
                <cc-icon size="lg" .icon=${iconInfo}></cc-icon>
                <span class="${classMap({ skeleton })}">
                  ${hasNewVersion
                    ? i18n('cc-jenkins-info.update.new-version', { version: versions.available })
                    : i18n('cc-jenkins-info.update.up-to-date')}
                </span>
              `,
            )}
          </div>
        </cc-block-section>
      </cc-block>
    `;
  }

  static get styles() {
    return [
      linkStyles,
      skeletonStyles,
      // language=CSS
      css`
        :host {
          --cc-gap: 1em;

          display: block;
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

window.customElements.define('cc-jenkins-info', CcJenkinsInfo);
