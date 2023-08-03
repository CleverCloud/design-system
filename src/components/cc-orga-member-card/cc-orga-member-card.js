import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconRemixErrorWarningFill as iconError,
  iconRemixCheckFill as iconCheck,
  iconRemixCloseFill as iconCross,
  iconRemixEditFill as iconPen,
  iconRemixDeleteBin_5Fill as iconBin,
  iconRemixAccountCircleFill as iconAvatar,
} from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n.js';
import { withResizeObserver } from '../../mixins/with-resize-observer/with-resize-observer.js';
import '../cc-button/cc-button.js';
import '../cc-img/cc-img.js';
import '../cc-icon/cc-icon.js';
import '../cc-badge/cc-badge.js';
import '../cc-notice/cc-notice.js';
import '../cc-select/cc-select.js';
import '../cc-stretch/cc-stretch.js';

const BREAKPOINT_MEDIUM = 740;
const BREAKPOINT_SMALL = 580;
const BREAKPOINT_TINY = 350;

/**
 * @typedef {import('./cc-orga-member-card.types.js').Authorisations} Authorisations
 * @typedef {import('./cc-orga-member-card.types.js').OrgaMemberCardState} OrgaMemberCardState
 * @typedef {import('./cc-orga-member-card.types.js').ToggleEditing} ToggleEditing
 * @typedef {import('./cc-orga-member-card.types.js').UpdateMember} UpdateMember
 */

/**
 * A component showing information about a member from a given organisation.
 *
 * With the right authorisations:
 * - This component provides a way to delete the member from the organisation.
 * - This component provides a way to edit the role of the member within a given organisation.
 *
 * ## Technical Details
 *
 * This component heavily relies on `cc-stretch` to make sure all cards look the same whatever the role and MFA status may be.
 * This component also heavily relies on CSS `grid` and the `withResizeObserver` mixin to switch from a "table" like design to a card design when the card width shrinks.
 *
 * @cssdisplay block
 *
 * @event {CustomEvent<ToggleEditing>} cc-orga-member-card:toggle-editing - Fires the `id` of the member related to the card and the new state (`editing` or `loaded`) to specify when card is in edit mode or not.
 * This allows the list component to close all other cards in edit mode to leave only one in edit mode at once.
 * @event {CustomEvent<OrgaMemberCardState>} cc-orga-member-card:delete - Fires when the user clicks on a remove member button.
 * @event {CustomEvent<OrgaMemberCardState>} cc-orga-member-card:leave - Fires when the user clicks on a leave button (only possible if `isCurrentUser = true`).
 * We don't fire a delete event so that it can be processed differently by the smart component (leaving the org means the user has to be redirected).
 * @event {CustomEvent<UpdateMember>} cc-orga-member-card:update - Fires when the user clicks on a validate button after editing member role.
 */
export class CcOrgaMemberCard extends withResizeObserver(LitElement) {

  static get properties () {
    return {
      authorisations: { type: Object },
      member: { type: Object },
      _size: { type: String, state: true },
      _newRole: { type: String, state: true },
    };
  }

  constructor () {
    super();

    /** @type {Authorisations} Sets the authorisations that control the display of the edit / delete buttons. */
    this.authorisations = {
      edit: false,
      delete: false,
    };

    /** @type {OrgaMemberCardState} Sets the state and data of the member. */
    this.member = {
      state: 'loaded',
      id: '',
      email: '',
      role: 'DEVELOPER',
      isMfaEnabled: false,
      isCurrentUser: false,
    };

    /**
     * used to:
     * - wrap buttons when the component width is below 740.
     * - switch to a vertical card layout when the width is below 580.
     * - show buttons and badges below each other when the width is below 350.
     *
     * @protected
     */
    this.breakpoints = {
      width: [BREAKPOINT_TINY, BREAKPOINT_SMALL, BREAKPOINT_MEDIUM],
    };

    /** @type {Ref<CcInputText>} */
    this._deleteButtonRef = createRef();

    this._newRole = null;

    /** @type {Ref<CcSelect>} */
    this._roleRef = createRef();

    /** @type {string} Set by `withResizeObserver` mixin. See the `onResize` method for more info. */
    this._size = '';
  }

  /**
   * Focus the delete button within the card.
   * To be used when a card is removed, and you want to focus another card (LostFocusController used in `cc-orga-member-list`).
   */
  focusDeleteBtn () {
    this._deleteButtonRef.value.focus();
  }

  /* Used by the `withResizeObserver` mixin. */
  onResize ({ width }) {
    this._size = width;
  }

  /*
   * Get the accessible name for the button that could be `edit` / `cancel editing`.
   * The accessible name provides more info than the visible text. It mentions the member being edited / to be edited.
   */
  _getFirstBtnAccessibleName () {
    const memberIdentity = this.member.name ?? this.member.email;
    if (this.member.state === 'editing' || this.member.state === 'updating') {
      return i18n('cc-orga-member-card.btn.cancel.accessible-name', { memberIdentity });
    }
    else {
      return i18n('cc-orga-member-card.btn.edit.accessible-name', { memberIdentity });
    }
  }

  /*
   * Get the accessible name for the button that could be `leave` / `delete` / `confirm editing`.
   * The accessible name provides more info than the visible text. It mentions the member to delete if relevant (no need to specify it for the "leave" button).
   */
  _getSecondBtnAccessibleName () {
    const memberIdentity = this.member.name ?? this.member.email;
    if (this.member.state === 'editing' || this.member.state === 'updating') {
      return i18n('cc-orga-member-card.btn.validate.accessible-name', { memberIdentity });
    }

    if (this.member.isCurrentUser) {
      return i18n('cc-orga-member-card.btn.leave.accessible-name');
    }

    return i18n('cc-orga-member-card.btn.delete.accessible-name', { memberIdentity });
  }

  _getRoleOptions () {
    return [
      { value: 'ADMIN', label: i18n('cc-orga-member-card.role.admin') },
      { value: 'DEVELOPER', label: i18n('cc-orga-member-card.role.developer') },
      { value: 'ACCOUNTING', label: i18n('cc-orga-member-card.role.accounting') },
      { value: 'MANAGER', label: i18n('cc-orga-member-card.role.manager') },
    ];
  }

  /**
   * @param isEditing
   * @returns {string}
   * @private
   */
  _getSecondBtnVisibleElementId (isEditing) {
    if (isEditing) {
      return 'btn-content-validate';
    }

    if (this.member.isCurrentUser) {
      return 'btn-content-leave';
    }

    return 'btn-content-delete';
  }

  _onDeleteMember () {
    const eventName = this.member.isCurrentUser ? 'leave' : 'delete';
    // since not every member has set a name, we send either the name or the email to provide context in the toast message
    dispatchCustomEvent(this, eventName, this.member);
  }

  /**
   * Update the newRole value when the select changes value.
   * We need to do this because we want to be able to reset the newRole when the user toggles the edit mode. (cancel editing)
   */
  _onRoleInput ({ detail: value }) {
    this._newRole = value;
  }

  /**
   * Switch the state between `loaded` and `editing`.
   * Dispatch a `toggle-editing` event so that `cc-orga-member-list` may close all other cards in edit mode.
   * Focus the role `select` element after entering edit mode.
   */
  async _onToggleEdit () {
    const newState = this.member.state === 'loaded' ? 'editing' : 'loaded';

    // switch the component state
    this.member = {
      ...this.member,
      state: newState,
    };
    this._newRole = this.member.role;

    // warn the `cc-orga-member-list` component so that it closes all other cards.
    dispatchCustomEvent(this, 'toggle-editing', {
      memberId: this.member.id,
      newState,
    });

    /* Focus the `<select>` element when entering edit mode */
    if (newState === 'editing') {
      await this.updateComplete;
      this._roleRef.value.focus();
    }
  }

  _onUpdateMember () {
    if (this._newRole === this.member.role) {
      this._onToggleEdit();
      return;
    }

    dispatchCustomEvent(this, 'update', {
      ...this.member,
      newRole: this._newRole,
    });
  }

  render () {

    const waiting = this.member.state === 'updating' || this.member.state === 'deleting';
    const hasName = this.member.name != null;
    const hasError = this.member.error;
    const hasAdminRights = this.authorisations.edit && this.authorisations.delete;

    return html`
      <div class="wrapper ${classMap({ 'has-actions': hasAdminRights, 'has-error': hasError })}">
        ${this.member.avatar == null ? html`
          <cc-icon class="avatar ${classMap({ waiting })}" .icon=${iconAvatar}></cc-icon>
        ` : html`
          <cc-img class="avatar ${classMap({ waiting })}" src=${this.member.avatar}></cc-img>
        `}
        <div
            class="identity ${classMap({ waiting })}"
            title="${ifDefined(this.member.jobTitle ?? undefined)}"
        >
          ${hasName || this.member.isCurrentUser ? html`
            <p class="name">
              ${hasName ? html`<strong>${this.member.name}</strong>` : ''}
              ${this.member.isCurrentUser ? html`
                <cc-badge>${i18n('cc-orga-member-card.current-user')}</cc-badge>
              ` : ''}
            </p>
          ` : ''}
          <p class="email">${this.member.email}</p>
        </div>

        ${this._renderStatusArea()}

        ${hasAdminRights ? this._renderActionBtns() : ''}

        <!-- 
          a11y: we need the live region to be present within the DOM from the start and insert content dynamically inside it.
          We have to add a conditional class to the wrapper when it does not contain any message to cancel the gap applied automatically within the grid. 
         -->
        <div class="error-wrapper ${classMap({ 'out-of-flow': !hasError })}" aria-live="polite" aria-atomic="true">
          ${hasError ? html`
              <cc-notice 
                intent="danger" 
                heading="${i18n('cc-orga-member-card.error.last-admin.heading')}"
                message="${i18n('cc-orga-member-card.error.last-admin.text')}"
                no-icon>
                </cc-notice>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * This sub render heavily relies on `cc-stretch`:
   *
   * - to make sure all badges are centered in desktop within a column which size is based on the longest text present inside.
   * - to make sure there is no layout shifts when switching between edit and readonly modes.
   */
  _renderStatusArea () {

    const isEditing = this.member.state === 'editing' || this.member.state === 'updating';
    const waiting = this.member.state === 'updating' || this.member.state === 'deleting';

    return html`
      <cc-stretch
        class="status ${classMap({ waiting })}"
        visible-element-id=${isEditing ? 'status-editing' : 'status-readonly'}
      >
        <div id="status-readonly" class="status__role-mfa">
          <cc-stretch
            visible-element-id=${this.member.role}
          >
            ${this._getRoleOptions().map((role) => html`
              <cc-badge id="${role.value}" intent="info" weight="dimmed">${role.label}</cc-badge>
            `)}
          </cc-stretch>

          <cc-stretch
            visible-element-id=${this.member.isMfaEnabled ? 'badge-mfa-enabled' : 'badge-mfa-disabled'}
          >
            <cc-badge id="badge-mfa-enabled" intent="success" weight="outlined" .icon="${iconCheck}">
              ${i18n('cc-orga-member-card.mfa-enabled')}
            </cc-badge>
            <cc-badge id="badge-mfa-disabled" intent="danger" weight="outlined" .icon="${iconError}">
              ${i18n('cc-orga-member-card.mfa-disabled')}
            </cc-badge>
          </cc-stretch>
        </div>

        <cc-select
          id="status-editing"
          label="${i18n('cc-orga-member-card.role.label')}"
          .options=${this._getRoleOptions()}
          .value=${this._newRole ?? this.member.role}
          ?inline=${this._size > BREAKPOINT_TINY}
          ?disabled=${this.member.state === 'updating'}
          @cc-select:input=${this._onRoleInput}
          ${ref(this._roleRef)}
        >
        </cc-select>
      </cc-stretch>
    `;
  }

  /**
   * This sub render also relies on `cc-stretch` to make sure buttons have the same size whatever their visible text may be (edit vs readonly mode).
   * We rely on the `accessible-name` prop on `cc-button` to make sure assistive get the relevant text with some context in addition.
   */
  _renderActionBtns () {

    const isBtnImgOnly = (this._size >= BREAKPOINT_MEDIUM);
    const waiting = this.member.state === 'updating' || this.member.state === 'deleting';
    const isEditing = this.member.state === 'editing' || this.member.state === 'updating';
    const hasError = this.member.error;
    const firstBtnIcon = isEditing ? iconCross : iconPen;
    const secondBtnIcon = isEditing ? iconCheck : iconBin;

    return html`
      
      <div class="actions">
        <cc-button
          ?primary=${!isEditing}
          outlined
          .icon=${firstBtnIcon}
          ?circle=${isBtnImgOnly}
          ?disabled=${waiting}
          ?hide-text=${isBtnImgOnly}
          accessible-name=${this._getFirstBtnAccessibleName()}
          @cc-button:click=${this._onToggleEdit}
        >
          <cc-stretch visible-element-id=${isEditing ? 'btn-content-cancel' : 'btn-content-edit'}>
            <span id="btn-content-edit">${i18n('cc-orga-member-card.btn.edit.visible-text')}</span>
            <span id="btn-content-cancel">${i18n('cc-orga-member-card.btn.cancel.visible-text')}</span>
          </cc-stretch>
        </cc-button>
        
        <cc-button
          ?danger=${!isEditing}
          ?primary=${isEditing}
          outlined
          .icon=${secondBtnIcon}
          ?disabled=${hasError}
          ?circle=${isBtnImgOnly}
          ?hide-text=${isBtnImgOnly}
          ?waiting=${waiting}
          accessible-name=${this._getSecondBtnAccessibleName()}
          @cc-button:click=${isEditing ? this._onUpdateMember : this._onDeleteMember}
          ${ref(this._deleteButtonRef)}
        >
          <cc-stretch visible-element-id=${this._getSecondBtnVisibleElementId(isEditing)}>
            <span id="btn-content-leave">${i18n('cc-orga-member-card.btn.leave.visible-text')}</span>
            <span id="btn-content-delete">${i18n('cc-orga-member-card.btn.delete.visible-text')}</span>
            <span id="btn-content-validate">${i18n('cc-orga-member-card.btn.validate.visible-text')}</span>
          </cc-stretch>
        </cc-button>
      </div>
    `;
  }

  static get styles () {
    return [
      // language=CSS
      css`
        /* region big (>= 740) & global */

        :host {
          display: block;
        }

        .wrapper {
          display: grid;
          align-items: center;
          gap: 0.8em 1em;
        }

        :host([w-gte-740]) .wrapper {
          grid-template-areas: 'avatar identity status';
          grid-template-columns: max-content 1fr max-content;
        }

        :host([w-gte-740]) .wrapper.has-actions {
          grid-template-areas: 'avatar identity status actions';
          grid-template-columns: max-content 1fr max-content max-content;
        }

        :host([w-gte-740]) .wrapper.has-actions.has-error {
          grid-template-areas: 
            'avatar identity status actions'
            '. error error error';
        }

        :host(.editing) .actions cc-button {
          --cc-icon-size: 1.4em;
        }

        p {
          margin: 0;
        }

        .avatar {
          --cc-icon-color: #595959;

          width: 3em;
          height: 3em;
          clip-path: circle(50% at 50% 50%);
          grid-area: avatar;
        }

        .identity {
          display: flex;
          flex-direction: column;
          gap: 0.3em;
          grid-area: identity;
          /* makes the email address wrap if needed */
          word-break: break-all;
        }
        
        .name {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
        }

        .status {
          grid-area: status;
        }
        
        .status cc-badge {
          width: 100%;
          white-space: nowrap;
        }

        .actions {
          display: flex;
          min-width: 4em;
          justify-content: space-evenly;
          gap: 0.5em;
          grid-area: actions;
        }

        .status__role-mfa {
          display: flex;
          align-items: center;
          gap: 0.5em 1em;
        }

        .error-wrapper {
          display: flex;
          justify-content: end;
          /* always leave the first column containing only the avatar. */
          grid-area: error;
        }

        /* This is to cancel the grid gap when there is no error message. */

        .error-wrapper.out-of-flow {
          grid-area: avatar;
        }

        .waiting {
          opacity: var(--cc-opacity-when-disabled, 0.65);
        }
        /* endregion */

        /* region medium (< 740) */

        :host([w-lt-740]) .wrapper {
          grid-template-areas: 'avatar identity status';
          grid-template-columns: max-content 1fr;
        }

        :host([w-lt-740]) .wrapper.has-actions {
          grid-template-areas: 
            'avatar identity status'
            '. . actions';
        }

        :host([w-lt-740]) .wrapper.has-actions.has-error {
          grid-template-areas:
            'avatar identity status'
            '. . actions'
            '. error error';
        }

        :host([w-lt-740]) .status,
        :host([w-lt-740]) .actions {
          justify-self: end;
        }

        :host([w-lt-740]) .error {
          margin-top: 0.5em;
        }
        /* endregion */

        /* region small (< 580) */

        :host([w-lt-580]) .wrapper {
          grid-template-areas:
            'avatar identity'
            '. status';
          grid-template-columns: max-content 1fr;
        }

        :host([w-lt-580]) .wrapper.has-actions {
          grid-template-areas:
            'avatar identity'
            '. status'
            '. actions';
        }

        :host([w-lt-580]) .wrapper.has-actions.has-error {
          grid-template-areas:
            'avatar identity'
            '. status'
            '. actions'
            '. error';
        }
        
        :host([w-lt-580]) .status {
          justify-self: start;
        }

        :host([w-lt-580]) .actions {
          justify-self: start;
        }
        /* endregion */

        /* region tiny (< 350) */

        :host([w-lt-350]) .status,
        :host([w-lt-350]) cc-select {
          width: 100%;
        }

        :host([w-lt-350]) .actions {
          flex-direction: column;
          justify-self: stretch;
        }

        :host([w-lt-350]) .status__role-mfa {
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
        }
        /* endregion */
      `,
    ];
  }
}

window.customElements.define('cc-orga-member-card', CcOrgaMemberCard);
