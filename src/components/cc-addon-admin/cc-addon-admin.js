import { css, html, LitElement } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../translations/translation.js';
import '../cc-block-section/cc-block-section.js';
import '../cc-block/cc-block.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';

/**
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminState} AddonAdminState
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateLoaded} AddonAdminStateLoaded
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateLoading} AddonAdminStateLoading
 * @typedef {import('./cc-addon-admin.types.js').AddonAdminStateSaving} AddonAdminStateSaving
 * @typedef {import('lit').PropertyValues<CcAddonAdmin>} CcAddonAdminPropertyValues
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 */

/**
 * A component displaying the admin interface of an add-on to edit its name or delete the add-on.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent} cc-addon-admin:delete-addon - Fires when the delete button is clicked.
 * @fires {CustomEvent<string>} cc-addon-admin:update-name - Fires the new name of the add-on when update name button is clicked.
 * @fires {CustomEvent<string[]>} cc-addon-admin:update-tags - Fires the new list of tags when update tags button is clicked.
 */
export class CcAddonAdmin extends LitElement {
  static get properties() {
    return {
      noDangerZoneBackupText: { type: Boolean, attribute: 'no-danger-zone-backup-text' },
      noDangerZoneVmText: { type: Boolean, attribute: 'no-danger-zone-vm-text' },
      state: { type: Object },
      _name: { type: String, state: true },
      _tags: { type: Array, state: true },
    };
  }

  constructor() {
    super();

    /** @type {boolean} Hides the text about backups within the danger zone when set to `true` */
    this.noDangerZoneBackupText = false;

    /** @type {boolean} Hides the text about VM delay within the danger zone when set to `true` */
    this.noDangerZoneVmText = false;

    /** @type {AddonAdminState} Sets the state of the component */
    this.state = { type: 'loading' };

    /** @type {string|null} Sets the value of the `name` input field */
    this._name = null;

    /** @type {string[]|null} Sets the value of the `tags` input field */
    this._tags = null;
  }

  /** @private */
  _onDeleteSubmit() {
    dispatchCustomEvent(this, 'delete-addon');
  }

  /**
   * @param {{ detail: string }} event
   * @private
   */
  _onNameInput({ detail: name }) {
    this._name = name;
  }

  /** @private */
  _onNameSubmit() {
    dispatchCustomEvent(this, 'update-name', { name: this._name });
  }

  /**
   * @param {{ detail: string[] }} event
   * @private
   */
  _onTagsInput({ detail: tags }) {
    this._tags = tags;
  }

  /** @private */
  _onTagsSubmit() {
    dispatchCustomEvent(this, 'update-tags', { tags: this._tags });
  }

  /**
   * @param {CcAddonAdminPropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('state') && 'name' in this.state) {
      this._name = this.state.name;
    }

    if (changedProperties.has('state') && 'tags' in this.state) {
      this._tags = this.state.tags;
    }
  }

  render() {
    return html`
      <cc-block>
        <div slot="title">${i18n('cc-addon-admin.admin')}</div>

        ${this.state.type === 'error'
          ? html` <cc-notice intent="warning" message="${i18n('cc-addon-admin.error-loading')}"></cc-notice> `
          : ''}
        ${this.state.type !== 'error' ? this._renderContent(this.state) : ''}
      </cc-block>
    `;
  }

  /**
   * @param {AddonAdminStateLoaded|AddonAdminStateLoading|AddonAdminStateSaving} state
   * @returns {TemplateResult}
   * @private
   */
  _renderContent(state) {
    const isSkeleton = state.type === 'loading';
    const isSaving = state.type === 'updatingTags' || state.type === 'updatingName' || state.type === 'deleting';
    const isFormDisabled = state.type === 'loading' || isSaving;
    const shouldShowBackupsText = !this.noDangerZoneBackupText;
    const shouldShowVmText = !this.noDangerZoneVmText;

    return html`
      <cc-block-section>
        <div slot="title">${i18n('cc-addon-admin.heading.name')}</div>
        <div slot="info"></div>
        <div class="one-line-form">
          <cc-input-text
            label="${i18n('cc-addon-admin.input.name')}"
            ?skeleton=${isSkeleton}
            ?disabled=${isFormDisabled}
            .value=${this._name}
            @cc-input-text:input=${this._onNameInput}
            @cc-input-text:requestimplicitsubmit=${this._onNameSubmit}
          ></cc-input-text>
          <cc-button
            primary
            ?skeleton=${isSkeleton}
            ?disabled=${isFormDisabled}
            ?waiting=${state.type === 'updatingName'}
            @cc-button:click=${this._onNameSubmit}
            >${i18n('cc-addon-admin.update')}</cc-button
          >
        </div>
      </cc-block-section>

      <cc-block-section>
        <div slot="title">${i18n('cc-addon-admin.heading.tags')}</div>
        <div slot="info">${i18n('cc-addon-admin.tags-description')}</div>
        <div class="one-line-form">
          <cc-input-text
            label="${i18n('cc-addon-admin.input.tags')}"
            ?skeleton=${isSkeleton}
            ?disabled=${isFormDisabled}
            .tags=${this._tags}
            placeholder="${i18n('cc-addon-admin.tags-empty')}"
            @cc-input-text:tags=${this._onTagsInput}
            @cc-input-text:requestimplicitsubmit=${this._onTagsSubmit}
          ></cc-input-text>
          <cc-button
            primary
            ?skeleton=${isSkeleton}
            ?disabled=${isFormDisabled}
            ?waiting=${state.type === 'updatingTags'}
            @cc-button:click=${this._onTagsSubmit}
            >${i18n('cc-addon-admin.tags-update')}</cc-button
          >
        </div>
      </cc-block-section>

      <cc-block-section>
        <div slot="title" class="danger">${i18n('cc-addon-admin.danger-zone')}</div>
        <div slot="info" class="danger-desc">
          <p>${i18n('cc-addon-admin.delete-disclaimer')}</p>
          ${shouldShowVmText ? html`<p>${i18n('cc-addon-admin.delete-vm')}</p>` : ''}
          ${shouldShowBackupsText ? html`<p>${i18n('cc-addon-admin.delete-backups')}</p>` : ''}
        </div>
        <div>
          <cc-button
            danger
            ?skeleton=${isSkeleton}
            ?disabled=${isFormDisabled}
            ?waiting=${state.type === 'deleting'}
            @cc-button:click=${this._onDeleteSubmit}
            >${i18n('cc-addon-admin.delete')}</cc-button
          >
        </div>
      </cc-block-section>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }

        .one-line-form {
          display: flex;
        }

        .one-line-form cc-input-text {
          flex: 1 1 10em;
          margin-right: 0.5em;
        }

        .one-line-form cc-button {
          margin-top: var(--cc-margin-top-btn-horizontal-form);
        }

        .danger-desc p {
          margin: 0;
        }
      `,
    ];
  }
}

window.customElements.define('cc-addon-admin', CcAddonAdmin);
