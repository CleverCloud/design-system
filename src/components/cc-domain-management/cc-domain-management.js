import { LitElement, css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  iconRemixDeleteBinLine as iconDelete,
  iconRemixLockUnlockFill as iconHttpOnly,
  iconRemixExternalLinkLine as iconLink,
  iconRemixStarLine as iconPrimary,
  iconRemixFlaskLine as iconTest,
} from '../../assets/cc-remix.icons.js';
import { LostFocusController } from '../../controllers/lost-focus-controller.js';
import {
  DomainParseError,
  getDomainUrl,
  getHostWithWildcard,
  isTestDomain,
  isTestDomainWithSubdomain,
  parseDomain,
  sortDomains,
} from '../../lib/domain.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { focusBySelector } from '../../lib/focus-helper.js';
import { accessibilityStyles } from '../../styles/accessibility.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';
import '../cc-badge/cc-badge.js';
import '../cc-block-section/cc-block-section.js';
import '../cc-block/cc-block.js';
import '../cc-button/cc-button.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';

/**
 * @typedef {import('./cc-domain-management.types.js').DomainManagementDnsInfoState} DomainManagementDnsInfoState
 * @typedef {import('./cc-domain-management.types.js').DomainManagementListState} DomainManagementListState
 * @typedef {import('./cc-domain-management.types.js').DomainManagementFormState} DomainManagementFormState
 * @typedef {import('./cc-domain-management.types.js').DomainManagementFormStateIdle} DomainManagementFormStateIdle
 * @typedef {import('./cc-domain-management.types.js').FormattedDomainInfo} FormattedDomainInfo
 * @typedef {import('./cc-domain-management.types.js').DomainInfo} DomainInfo
 * @typedef {import('./cc-domain-management.types.js').FormError} FormError
 * @typedef {import('../cc-input-text/cc-input-text.js').CcInputText} CcInputText
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 * @typedef {import('lit/directives/ref.js').Ref<CcInputText>} RefCcInputText
 * @typedef {import('lit/directives/ref.js').Ref<HTMLParagraphElement>} RefHTMLParagraphElement
 * @typedef {import('lit').PropertyValues<CcDomainManagement>} CcDomainManagementPropertyValues
 */

/**
 * A component to manage domains associated to an application.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<{ hostname: string, pathPrefix: string }>} cc-domain-management:add - Fires when clicking the "Add a domain" button.
 * @fires {CustomEvent<DomainInfo>} cc-domain-management:mark-as-primary - Fires when clicking a "mark as primary" button.
 * @fires {CustomEvent<DomainInfo>} cc-domain-management:delete - Fires when clicking a "delete" button.
 */
export class CcDomainManagement extends LitElement {
  static get properties() {
    return {
      dnsInfoState: { type: Object, attribute: 'dns-info-state' },
      domainFormState: { type: Object, attribute: 'domain-form-state' },
      domainListState: { type: Object, attribute: 'domain-list-state' },
      _sortedDomains: { type: Array, state: true },
    };
  }

  /**
   * @returns {DomainManagementFormStateIdle}
   */
  static get INIT_DOMAIN_FORM_STATE() {
    return {
      type: 'idle',
      hostname: {
        value: '',
      },
      pathPrefix: {
        value: '',
      },
    };
  }

  constructor() {
    super();

    /** @type {DomainManagementDnsInfoState} Sets the state of the DNS info section */
    this.dnsInfoState = { type: 'loading' };

    /** @type {DomainManagementFormState} Sets the state of the form section */
    this.domainFormState = CcDomainManagement.INIT_DOMAIN_FORM_STATE;

    /** @type {DomainManagementListState} Sets the state of the domain list section. */
    this.domainListState = { type: 'loading' };

    /** @type {RefCcInputText} */
    this._domainInputRef = createRef();

    /** @type {RefHTMLParagraphElement} */
    this._emptyMessageRef = createRef();

    /** @type {FormattedDomainInfo[]|null} */
    this._sortedDomains = null;

    new LostFocusController(this, '.delete-domain', ({ suggestedElement }) => {
      if (suggestedElement != null) {
        suggestedElement.focus();
      } else {
        this._emptyMessageRef.value?.focus();
      }
    });

    new LostFocusController(this, '.mark-primary', () => {
      focusBySelector(this.shadowRoot, '.primary');
    });
  }

  /**
   * @param {string} hostnameValue
   * @returns {FormError|null} The error code or `null` if no error
   */
  _getFormError(hostnameValue) {
    try {
      const { pathname } = parseDomain(hostnameValue?.trim());

      if (!hostnameValue.match(/.+\..+/)) {
        return { code: 'invalid-format' };
      }
      if (pathname !== '/') {
        /** We store the path so we can tell users to move this part to the "Path" input field instead. */
        return { code: 'hostname-contains-path', pathWithinHostname: pathname };
      }

      return null;
    } catch (error) {
      if (error instanceof DomainParseError) {
        return { code: error.code };
      }

      return { code: 'invalid-format' };
    }
  }

  /**
   * @param {FormError|null} error
   * @returns {string}
   */
  _getErrorMessage(error) {
    switch (error?.code) {
      case 'empty':
        return i18n('cc-domain-management.form.domain.error.empty');
      case 'invalid-format':
        return i18n('cc-domain-management.form.domain.error.format');
      case 'invalid-wildcard':
        return i18n('cc-domain-management.form.domain.error.wildcard');
      case 'hostname-contains-path':
        return i18n('cc-domain-management.form.domain.error.contains-path', { path: error.pathWithinHostname });
    }
  }

  /** @param {ClipboardEvent} event */
  _onDomainPaste(event) {
    if (this.domainFormState.type !== 'idle' || this.domainFormState.hostname.value.trim() !== '') {
      return;
    }

    event.preventDefault();

    const clipboardValue = event.clipboardData.getData('text');

    try {
      const { hostname, pathname, isWildcard } = parseDomain(clipboardValue);

      this.domainFormState = {
        ...this.domainFormState,
        hostname: {
          ...this.domainFormState.hostname,
          value: getHostWithWildcard(hostname, isWildcard),
        },
        pathPrefix: {
          ...this.domainFormState.pathPrefix,
          value: pathname.replace(/\/$/, ''),
        },
      };
    } catch {
      this.domainFormState = {
        ...this.domainFormState,
        hostname: {
          ...this.domainFormState.hostname,
          value: clipboardValue,
        },
      };
    }
  }

  /** @param {SubmitEvent} e */
  _onDomainSubmit(e) {
    e.preventDefault();

    if (this.domainFormState.type !== 'idle') {
      return;
    }

    // we trim and we'll send this value to the API but we don't change what is displayed within the input
    const hostnameValue = this.domainFormState.hostname.value.trim();
    const pathPrefixValue = this.domainFormState.pathPrefix.value.trim();
    const error = this._getFormError(hostnameValue);

    if (error != null) {
      this.domainFormState = {
        ...this.domainFormState,
        hostname: {
          ...this.domainFormState.hostname,
          error,
        },
      };

      this._domainInputRef.value.focus();
      return;
    }

    this.domainFormState = {
      ...this.domainFormState,
      hostname: {
        value: this.domainFormState.hostname.value,
      },
    };

    // we do this to strip off unwanted parts like query parameters for instance
    const { hostname, pathname, isWildcard } = parseDomain(hostnameValue + pathPrefixValue);

    dispatchCustomEvent(this, 'add', {
      hostname,
      pathPrefix: pathname,
      isWildcard,
    });
  }

  /** @param {FormattedDomainInfo} domainInfo */
  _onMarkPrimary(domainInfo) {
    const { id, hostname, pathPrefix, isWildcard, isPrimary } = domainInfo;
    return () => dispatchCustomEvent(this, 'mark-as-primary', { id, hostname, pathPrefix, isWildcard, isPrimary });
  }

  /** @param {FormattedDomainInfo} domainInfo */
  _onDelete(domainInfo) {
    const { id, hostname, pathPrefix, isWildcard, isPrimary } = domainInfo;
    return () => dispatchCustomEvent(this, 'delete', { id, hostname, pathPrefix, isWildcard, isPrimary });
  }

  /** @param {Event & { detail: string }} event */
  _onDomainInput({ detail: value }) {
    if (this.domainFormState.type !== 'idle') {
      return;
    }

    this.domainFormState = {
      ...this.domainFormState,
      hostname: {
        ...this.domainFormState.hostname,
        value,
      },
    };
  }

  /** @param {Event & { detail: string }} event */
  _onPathPrefixInput({ detail: value }) {
    // add "/" at the beginning in case the user forgot to type it
    if (value.length > 0 && !value.startsWith('/')) {
      value = '/' + value;
    }
    this.domainFormState = {
      ...this.domainFormState,
      pathPrefix: {
        ...this.domainFormState.pathPrefix,
        value,
      },
    };
  }

  /** @param {CcDomainManagementPropertyValues} changedProperties */
  willUpdate(changedProperties) {
    if (
      changedProperties.has('domainFormState') &&
      changedProperties.get('domainFormState')?.hostname.error == null &&
      this.domainFormState.hostname.error != null
    ) {
      this.updateComplete.then(() => this._domainInputRef.value?.focus());
    }

    if (changedProperties.has('domainListState') && this.domainListState.type === 'loaded') {
      // Make sure we use a copy before using .sort() which modifies the array in place
      this._sortedDomains = [...this.domainListState.domains].sort(sortDomains).map((domainState) => {
        const { hostname } = domainState;

        /** @type {FormattedDomainInfo} */
        const formattedDomain = {
          ...domainState,
          isHttpOnly: isTestDomainWithSubdomain(hostname),
          isTestingOnly: isTestDomain(hostname),
        };

        return formattedDomain;
      });
    }
  }

  render() {
    return html`
      <div class="wrapper">
        <cc-block>
          <div slot="title">${i18n('cc-domain-management.main-heading')}</div>

          <cc-block-section>
            <div class="form-info">
              <p>${i18n('cc-domain-management.form.info.docs')}</p>
              <p>${i18n('cc-domain-management.form.info.cleverapps')}</p>
            </div>
            <div>${this._renderForm(this.domainFormState)}</div>
          </cc-block-section>

          <cc-block-section>
            <div slot="title">
              ${i18n('cc-domain-management.list.heading')}
              ${this.domainListState.type === 'loaded'
                ? html` <cc-badge class="domain-count" circle>${this._sortedDomains.length}</cc-badge> `
                : ''}
            </div>

            ${this.domainListState.type === 'error'
              ? html`
                  <cc-notice intent="warning" message="${i18n('cc-domain-management.list.loading-error')}"></cc-notice>
                `
              : ''}
            ${this.domainListState.type === 'loading' ? html` <cc-loader></cc-loader> ` : ''}
            ${this.domainListState.type === 'loaded' ? this._renderDomains(this._sortedDomains) : ''}
          </cc-block-section>
        </cc-block>

        <cc-block>
          <div slot="title">${i18n('cc-domain-management.certif.heading')}</div>
          <div class="certif-info">
            <p>${i18n('cc-domain-management.certif.automated')}</p>
            <p>${i18n('cc-domain-management.certif.custom')}</p>
          </div>
        </cc-block>

        <cc-block class="dns-info">
          <div slot="title">${i18n('cc-domain-management.dns.heading')}</div>
          <div>
            <div class="dns-info__desc">${i18n('cc-domain-management.dns.desc')}</div>
            <cc-notice intent="info" heading="${i18n('cc-domain-management.dns.info.heading')}">
              <div slot="message">
                <p>${i18n('cc-domain-management.dns.info.load-balancer')}</p>
                <p>${i18n('cc-domain-management.dns.info.apex')}</p>
              </div>
            </cc-notice>
          </div>

          ${this.dnsInfoState.type === 'loading' ? html` <cc-loader></cc-loader> ` : ''}
          ${this.dnsInfoState.type === 'error'
            ? html`
                <cc-notice intent="warning" message="${i18n('cc-domain-management.dns.loading-error')}"></cc-notice>
              `
            : ''}
          ${this.dnsInfoState.type === 'loaded'
            ? this._renderDnsInfo(this.dnsInfoState.cnameRecord, this.dnsInfoState.aRecords)
            : ''}
        </cc-block>
      </div>
    `;
  }

  /**
   * @param {DomainManagementFormState} formState
   * @returns {TemplateResult}
   */
  _renderForm({ type, hostname: domain, pathPrefix }) {
    const isDisabled = type === 'adding';

    return html`
      <form novalidate @submit=${this._onDomainSubmit}>
        <div class="fieldgroup">
          <cc-input-text
            class="fieldgroup__domain"
            label="${i18n('cc-domain-management.form.domain.label')}"
            required
            .value="${domain.value}"
            ?disabled="${isDisabled}"
            .errorMessage=${this._getErrorMessage(domain.error)}
            ${ref(this._domainInputRef)}
            @cc-input-text:input=${this._onDomainInput}
            @paste=${this._onDomainPaste}
          >
            <p slot="help">${i18n('cc-domain-management.form.domain.help')}</p>
          </cc-input-text>
          <cc-input-text
            class="fieldgroup__path"
            label="${i18n('cc-domain-management.form.path.label')}"
            .value="${pathPrefix.value}"
            ?disabled="${isDisabled}"
            @cc-input-text:input=${this._onPathPrefixInput}
          >
            <p slot="help">${i18n('cc-domain-management.form.path.help')}</p>
          </cc-input-text>
        </div>
        <cc-button primary ?waiting="${type === 'adding'}" type="submit"
          >${i18n('cc-domain-management.form.submit')}</cc-button
        >
      </form>
    `;
  }

  /**
   * @param {FormattedDomainInfo[]} domains
   * @returns {TemplateResult}
   */
  _renderDomains(domains) {
    const hasDomains = domains.length > 0;
    const isOneRowMarkingPrimary = domains.filter((domain) => domain.type === 'marking-primary').length > 0;
    const hasHttpOnlyDomains = domains.filter((domain) => domain.isHttpOnly).length > 0;

    if (!hasDomains) {
      return html`
        <p class="empty" tabindex="-1" ${ref(this._emptyMessageRef)}>${i18n('cc-domain-management.list.empty')}</p>
      `;
    }

    return html`
      ${hasHttpOnlyDomains
        ? html`
            <cc-notice no-icon intent="warning">
              <div slot="message" class="http-only-info">
                <cc-badge intent="warning" weight="outlined">
                  <div class="badge-content">
                    <cc-icon
                      .icon=${iconHttpOnly}
                      a11y-name=${i18n('cc-domain-management.list.badge.http-only.alt')}
                    ></cc-icon>
                    ${i18n('cc-domain-management.list.badge.http-only.text')}
                  </div>
                </cc-badge>
                ${i18n('cc-domain-management.list.http-only.notice')}
              </div>
            </cc-notice>
          `
        : ''}

      <div class="domains">
        ${repeat(
          domains,
          ({ id }) => id,
          (domain) => this._renderDomain(domain, isOneRowMarkingPrimary),
        )}
      </div>
    `;
  }

  /**
   * @param {FormattedDomainInfo} domainInfo
   * @param {boolean} isOneRowMarkingPrimary
   * @returns {TemplateResult}
   **/
  _renderDomain(domainInfo, isOneRowMarkingPrimary) {
    const {
      type: domainItemStateType,
      hostname,
      pathPrefix,
      isWildcard,
      isPrimary,
      isHttpOnly,
      isTestingOnly,
    } = domainInfo;
    const waiting = domainItemStateType === 'deleting' || domainItemStateType === 'marking-primary';
    const isMarkingPrimaryDisabled = isOneRowMarkingPrimary || domainItemStateType === 'deleting';
    const hostWithWildcard = getHostWithWildcard(hostname, isWildcard);
    const domainUrl = getDomainUrl(hostname, pathPrefix, isWildcard, isHttpOnly);

    return html`
      <!--
        Caution: the primary class is used to focus the primary domain when it changes, do not remove or change this class
        (see LostFocusController within the constructor for more info) 
      -->
      <div class="domain ${classMap({ primary: isPrimary, waiting })}" tabindex="-1">
        <span class="domain-name-with-path">
          <!-- These tags need to remain on the same line so there is no white-space when pasting domain+path -->
          <span>${hostWithWildcard}</span><span class="path-prefix">${pathPrefix}</span>
          <a
            class="domain-link"
            href="${domainUrl}"
            title="${i18n('cc-domain-management.list.link.title', { domainUrl })}"
            target="_blank"
          >
            <span class="visually-hidden">${domainUrl}</span>
            <cc-icon .icon=${iconLink} a11y-name="${i18n('cc-domain-management.new-window')}"></cc-icon>
          </a>
        </span>

        <div class="badges">
          ${isPrimary
            ? html`
                <cc-badge>
                  <div class="badge-content">
                    <cc-icon .icon=${iconPrimary}></cc-icon>
                    ${i18n('cc-domain-management.list.badge.primary')}
                  </div>
                </cc-badge>
              `
            : ''}
          ${isTestingOnly
            ? html`
                <cc-badge intent="info" weight="outlined">
                  <div class="badge-content">
                    <cc-icon .icon=${iconTest}></cc-icon>
                    ${i18n('cc-domain-management.list.badge.testing-only')}
                  </div>
                </cc-badge>
              `
            : ''}
          ${isHttpOnly
            ? html`
                <cc-badge intent="warning" weight="outlined">
                  <div class="badge-content">
                    <cc-icon
                      .icon=${iconHttpOnly}
                      a11y-name=${i18n('cc-domain-management.list.badge.http-only.alt')}
                    ></cc-icon>
                    ${i18n('cc-domain-management.list.badge.http-only.text')}
                  </div>
                </cc-badge>
              `
            : ''}
        </div>

        <div class="actions">
          ${!isPrimary
            ? html`
                <cc-button
                  class="mark-primary"
                  primary
                  outlined
                  ?disabled=${isMarkingPrimaryDisabled}
                  ?waiting="${domainItemStateType === 'marking-primary'}"
                  a11y-name="${i18n('cc-domain-management.list.btn.primary.a11y-name', { domain: hostWithWildcard })}"
                  .icon=${iconPrimary}
                  hide-text
                  circle
                  @cc-button:click=${this._onMarkPrimary(domainInfo)}
                >
                  ${i18n('cc-domain-management.list.btn.primary.text')}
                </cc-button>
              `
            : ''}
          <cc-button
            class="delete-domain"
            danger
            outlined
            ?disabled="${domainItemStateType === 'marking-primary'}"
            ?waiting="${domainItemStateType === 'deleting'}"
            a11y-name="${i18n('cc-domain-management.list.btn.delete.a11y-name', { domain: hostWithWildcard })}"
            .icon=${iconDelete}
            hide-text
            circle
            @cc-button:click=${this._onDelete(domainInfo)}
          >
            ${i18n('cc-domain-management.list.btn.delete.text')}
          </cc-button>
        </div>
      </div>
    `;
  }

  /**
   * @param {string} cnameRecord
   * @param {string[]} aRecords
   * @returns {TemplateResult}
   */
  _renderDnsInfo(cnameRecord, aRecords) {
    return html`
      <cc-block-section>
        <div slot="title">${i18n('cc-domain-management.dns.cname.heading')}</div>
        <div slot="info">${i18n('cc-domain-management.dns.cname.desc')}</div>
        <cc-input-text
          hidden-label
          label="${i18n('cc-domain-management.dns.cname.label')}"
          readonly
          clipboard
          value=${cnameRecord}
        ></cc-input-text>
      </cc-block-section>
      <cc-block-section>
        <div slot="title">${i18n('cc-domain-management.dns.a.heading')}</div>
        <div slot="info">${i18n('cc-domain-management.dns.a.desc')}</div>
        <div class="a-records">
          ${aRecords.map(
            (aRecord, index) => html`
              <cc-input-text
                hidden-label
                label="${i18n('cc-domain-management.dns.a.label', { index: index + 1 })}"
                readonly
                clipboard
                value=${aRecord}
              ></cc-input-text>
            `,
          )}
        </div>
      </cc-block-section>
    `;
  }

  static get styles() {
    return [
      accessibilityStyles,
      linkStyles,
      css`
        :host {
          display: block;
        }

        .wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5em;
        }

        code {
          background-color: var(--cc-color-bg-neutral);
          border-radius: var(--cc-border-radius-default, 0.25em);
          font-family: var(--cc-ff-monospace);
          padding: 0.15em 0.3em;
          word-break: break-all;
        }

        /** #region form */

        .fieldgroup {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        .fieldgroup__domain {
          flex-grow: 5;
        }

        .fieldgroup__path {
          flex-basis: 16em;
          flex-grow: 2;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.5em;
          justify-content: flex-end;
        }

        form cc-button {
          margin-left: auto;
        }

        .form-info {
          color: var(--cc-color-text-weak);
          line-height: 1.5;
          margin-bottom: 1em;
        }

        .form-info p {
          margin: 0;
        }

        .form-info__cleverapps {
          align-items: center;
          display: flex;
          gap: 0.5em;
        }

        .form-info cc-icon {
          color: var(--cc-color-text-primary);
        }

        /** we need this because the help message contains a <code> tag that has some extra padding */

        [slot='help'] {
          padding-top: 0.3em;
        }

        /** #endregion */

        /** #region domain-list */

        .domain-count {
          font-size: 0.9em;
          margin-left: 0.2em;
        }

        .domains {
          display: grid;
          gap: 1em;
          grid-auto-rows: 1fr;
          grid-template-columns: repeat(auto-fit, minmax(min(25em, 100%), 1fr));
        }

        .domain {
          align-content: center;
          align-items: center;
          border: solid 1px var(--cc-color-border-neutral-weak);
          border-radius: var(--cc-border-radius-default);
          display: grid;
          gap: 0.5em 1em;
          grid-template-areas:
            'domain-info domain-info'
            'badges actions';
          padding: 1em;
        }

        .domain:hover {
          background-color: var(--cc-color-bg-neutral);
        }

        .domain:focus-visible {
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .domain-name-with-path {
          grid-area: domain-info;
          word-break: break-all;
        }

        .path-prefix {
          color: var(--cc-color-text-primary-strongest);
          font-family: var(--cc-ff-monospace);
          font-weight: bold;
          padding-left: 0.5em;
        }

        .domain-link {
          /** fixes icon alignment that differs depending on the font-family */

          font-family: var(--cc-ff-monospace, monospace);
          padding: 0.3em;
          vertical-align: middle;
        }

        .domain-link cc-icon {
          vertical-align: baseline;
        }

        .waiting .domain-name-with-path {
          opacity: var(--cc-opacity-when-disabled, 0.5);
        }

        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          grid-area: badges;
        }

        .badge-content {
          align-items: center;
          display: flex;
          gap: 0.5em;
        }

        .badge-content cc-icon {
          flex: 0 0 auto;
        }

        .actions {
          align-items: center;
          display: flex;
          gap: 0.5em;
          grid-area: actions;
          justify-content: flex-end;
        }

        .empty {
          font-style: italic;
        }

        .empty:focus {
          outline: none;
        }

        .http-only-info cc-badge {
          line-height: normal;
          margin-right: 0.5em;
        }

        .http-only-info {
          line-height: 1.5;
        }

        /** #endregion */

        /** #region certifAndDNS */

        .certif-info {
          display: grid;
          gap: 0.5em;
          line-height: 1.5;
        }

        .certif-info p,
        .dns-info p {
          margin: 0;
        }

        .dns-info__desc {
          display: grid;
          gap: 0.5em;
          margin-bottom: 1em;
        }

        .dns-info div[slot='info'] {
          align-content: flex-start;
          display: grid;
          gap: 0;
        }

        .a-records {
          align-content: baseline;
          display: grid;
          gap: 1em;
          grid-template-columns: repeat(auto-fit, minmax(8em, 1fr));
        }

        .dns-info cc-notice[intent='info'] {
          margin-bottom: 1em;
          margin-top: 1.5em;
        }

        /** #endregion */
      `,
    ];
  }
}

window.customElements.define('cc-domain-management', CcDomainManagement);
