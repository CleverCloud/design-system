import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconCleverMailLine as iconMail,
  iconCleverMailStarLine as iconMailPrimary,
} from '../../assets/cc-clever.icons.js';
import {
  iconRemixDeleteBinFill as iconDelete,
  iconRemixSpam_2Fill as iconUnverified,
  iconRemixCheckboxCircleFill as iconVerified,
} from '../../assets/cc-remix.icons.js';
import { LostFocusController } from '../../controllers/lost-focus-controller.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { fakeString } from '../../lib/fake-strings.js';
import { focusBySelector } from '../../lib/focus-helper.js';
import { FormErrorFocusController } from '../../lib/form/form-error-focus-controller.js';
import { formSubmit } from '../../lib/form/form-submit-directive.js';
import { sortBy } from '../../lib/utils.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-badge/cc-badge.js';
import '../cc-block-section/cc-block-section.js';
import '../cc-block/cc-block.js';
import '../cc-button/cc-button.js';
import '../cc-icon/cc-icon.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-notice/cc-notice.js';

/** @type {PrimaryAddressState} */
const SKELETON_PRIMARY_EMAIL = {
  state: 'idle',
  address: fakeString(35),
  verified: false,
};

/** @type {SecondaryAddressState[]} */
const SKELETON_SECONDARY_EMAILS = [];

/**
 * @typedef {import('./cc-email-list.types.js').EmailListState} EmailListState
 * @typedef {import('./cc-email-list.types.js').PrimaryAddressState} PrimaryAddressState
 * @typedef {import('./cc-email-list.types.js').SecondaryAddressState} SecondaryAddressState
 * @typedef {import('./cc-email-list.types.js').AddEmailFormState} AddEmailFormState
 * @typedef {import('./cc-email-list.types.js').AddEmailError} AddEmailError
 * @typedef {import('../cc-input-text/cc-input-text.js').CcInputText} CcInputText
 * @typedef {import('lit/directives/ref.js').Ref<CcInputText>} CcInputTextRef
 * @typedef {import('lit/directives/ref.js').Ref<HTMLFormElement>} HTMLFormElementRef
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 * @typedef {import('../../lib/form/form.types.js').FormDataMap} FormDataMap
 * @typedef {import('../../lib/form/validation.types.js').ErrorMessage} ErrorMessage
 */

/**
 * A component displaying the email addresses associated with a user account.
 *
 * ## Details
 *
 * The component gives the ability to:
 *
 * * Resend the confirmation email to the primary address (if it has not been verified yet)
 * * Add a secondary email address
 * * Delete a secondary email address
 * * Promote a secondary email address to primary.
 *
 * ## secondary email address input validation
 *
 * * The component is responsible for validating the secondary email address entered by the user.
 * * This validation is triggered whenever the add button is clicked.
 * * If the validation doesn't succeed, an error message is displayed below the text input. Otherwise, the custom event `cc-email-list:add` is fired.
 * * The validation handles only two cases:
 *   - the input is empty
 *   - the input is not a valid email address.
 * * For the other error cases, you'll need to pass the right `addEmailForm` property manually.
 *
 * ## Marking as primary
 *
 * * Unlike secondary email address deletion, marking as primary is exclusive: Only one email address can be marked as primary at a time.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<string>} cc-email-list:add - Fires whenever the add button is clicked. If the validation doesn't succeed, the event is not fired.
 * @fires {CustomEvent<string>} cc-email-list:send-confirmation-email - Fires whenever the send confirmation email link is clicked.
 * @fires {CustomEvent<string>} cc-email-list:delete - Fires whenever the delete button is clicked.
 * @fires {CustomEvent<string>} cc-email-list:mark-as-primary - Fires whenever the 'mark as primary' button is clicked.
 */
export class CcEmailList extends LitElement {
  static get properties() {
    return {
      addEmailFormState: { type: Object, attribute: false },
      emails: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {AddEmailFormState} */
    this.addEmailFormState = { type: 'idle' };

    /** @type {EmailListState} State of the component. */
    this.emails = { state: 'loading' };

    /** @type {CcInputTextRef} */
    this._addressInputRef = createRef();

    /** @type {HTMLFormElementRef} */
    this._formRef = createRef();

    new LostFocusController(this, '.secondary', ({ suggestedElement }) => {
      focusBySelector(suggestedElement, '.delete-button', () => {
        this._addressInputRef.value.focus();
      });
    });

    new FormErrorFocusController(this, this._formRef, () => this.addEmailFormState.errors);
  }

  resetAddEmailForm() {
    this._formRef.value?.reset();
  }

  /**
   * @param {boolean} verified
   * @return {TemplateResult}
   */
  _getVerifiedTagLabel(verified) {
    const label = verified
      ? i18n('cc-email-list.primary.email.verified')
      : i18n('cc-email-list.primary.email.unverified');
    // Label wrapping into a <span> is because of a Safari Bug: https://github.com/CleverCloud/clever-components/pull/473#issuecomment-1323895088
    return html`<span>${label}</span>`;
  }

  _onSendConfirmationEmail() {
    if (this.emails.state === 'loaded') {
      dispatchCustomEvent(this, 'send-confirmation-email', this.emails.value.primaryAddress.address);
    }
  }

  /**
   * @param {string} address
   */
  _onDelete(address) {
    dispatchCustomEvent(this, 'delete', address);
  }

  /**
   * @param {string} address
   */
  _onMarkAsPrimary(address) {
    dispatchCustomEvent(this, 'mark-as-primary', address);
  }

  /**
   * @param {FormDataMap} formData
   */
  _onAddFormSubmit(formData) {
    this.addEmailFormState = { ...this.addEmailFormState, errors: null };
    dispatchCustomEvent(this, 'add', formData.address);
  }

  /**
   *
   * @param {AddEmailError} errorCode
   * @return {ErrorMessage}
   */
  _getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'invalid':
        return i18n('cc-input-text.error.bad-email');
      case 'already-defined':
        return i18n('cc-email-list.secondary.address-input.error.already-defined');
      case 'used':
        return i18n('cc-email-list.secondary.address-input.error.used');
    }
  }

  render() {
    return html`
      <cc-block>
        <div slot="header-title">${i18n('cc-email-list.title')}</div>

        ${this.emails.state === 'loading'
          ? html`
              ${this._renderPrimarySection(SKELETON_PRIMARY_EMAIL, true)}
              ${this._renderSecondarySection(SKELETON_SECONDARY_EMAILS)}
            `
          : ''}
        ${this.emails.state === 'loaded'
          ? html`
              ${this._renderPrimarySection(this.emails.value.primaryAddress)}
              ${this._renderSecondarySection(this.emails.value.secondaryAddresses)}
            `
          : ''}
        ${this.emails.state === 'error'
          ? html`
              <cc-notice slot="content" intent="warning" message="${i18n('cc-email-list.loading.error')}"></cc-notice>
            `
          : ''}
      </cc-block>
    `;
  }

  /**
   * @param {PrimaryAddressState} primaryAddressState
   * @param {boolean} [skeleton]
   * @return {TemplateResult}
   */
  _renderPrimarySection(primaryAddressState, skeleton = false) {
    const address = primaryAddressState.address;
    const verified = primaryAddressState.verified;
    const shouldDisplayResendConfirmationEmail = !skeleton && !verified;

    const badgeIntent = verified ? 'success' : 'danger';
    const badgeIcon = verified ? iconVerified : iconUnverified;

    return html`
      <cc-block-section slot="content-body">
        <div slot="title">${i18n('cc-email-list.primary.title')}</div>
        <div slot="info">${i18n('cc-email-list.primary.description')}</div>

        <div class="address-line primary">
          <div class="address">
            <cc-icon class="icon--auto" .icon=${iconMailPrimary} size="lg"></cc-icon>
            <span class="${classMap({ skeleton })}">${address}</span>
          </div>
          <cc-badge intent="${badgeIntent}" weight="outlined" ?skeleton="${skeleton}" .icon="${badgeIcon}"
            >${this._getVerifiedTagLabel(primaryAddressState.verified)}
          </cc-badge>
        </div>
        ${shouldDisplayResendConfirmationEmail
          ? html`
              <cc-button
                @cc-button:click=${this._onSendConfirmationEmail}
                ?waiting=${primaryAddressState.state === 'sending-confirmation-email'}
                link
              >
                ${i18n('cc-email-list.primary.action.resend-confirmation-email')}
              </cc-button>
            `
          : ''}
      </cc-block-section>
    `;
  }

  /**
   * @param {Array<SecondaryAddressState>} secondaryAddressStates
   * @return {TemplateResult}
   */
  _renderSecondarySection(secondaryAddressStates) {
    const addresses = [...secondaryAddressStates].sort(sortBy('address'));
    const markingAsPrimary = addresses.some((item) => item.state === 'marking-as-primary');

    return html`
      <cc-block-section slot="content-body">
        <div slot="title">${i18n('cc-email-list.secondary.title')}</div>
        <div slot="info">${i18n('cc-email-list.secondary.description')}</div>

        <ul class="secondary-addresses">
          ${addresses.map((secondaryAddress) => {
            const isBusy = secondaryAddress.state === 'marking-as-primary' || secondaryAddress.state === 'deleting';

            return html`
              <li class="address-line secondary">
                <div class="address ${classMap({ loading: isBusy })}">
                  <cc-icon class="icon--auto" .icon=${iconMail} size="lg"></cc-icon>
                  <span>${secondaryAddress.address}</span>
                </div>
                <div class="buttons">
                  <cc-button
                    @cc-button:click=${() => this._onMarkAsPrimary(secondaryAddress.address)}
                    ?waiting="${secondaryAddress.state === 'marking-as-primary'}"
                    ?disabled="${markingAsPrimary || isBusy}"
                    a11y-name="${i18n('cc-email-list.secondary.action.mark-as-primary.accessible-name', {
                      address: secondaryAddress.address,
                    })}"
                  >
                    ${i18n('cc-email-list.secondary.action.mark-as-primary.name')}
                  </cc-button>
                  <cc-button
                    class="delete-button"
                    danger
                    outlined
                    .icon=${iconDelete}
                    @cc-button:click=${() => this._onDelete(secondaryAddress.address)}
                    ?waiting="${secondaryAddress.state === 'deleting'}"
                    ?disabled="${isBusy}"
                    a11y-name="${i18n('cc-email-list.secondary.action.delete.accessible-name', {
                      address: secondaryAddress.address,
                    })}"
                  >
                    ${i18n('cc-email-list.secondary.action.delete.name')}
                  </cc-button>
                </div>
              </li>
            `;
          })}
        </ul>

        ${this._renderAddEmailForm()}
      </cc-block-section>
    `;
  }

  _renderAddEmailForm() {
    const isAdding = this.addEmailFormState.type === 'adding';

    return html`
      <form ${ref(this._formRef)} ${formSubmit(this._onAddFormSubmit.bind(this))}>
        <cc-input-text
          label="${i18n('cc-email-list.secondary.address-input.label')}"
          name="address"
          type="email"
          required
          ?readonly=${isAdding}
          .errorMessage=${this._getErrorMessage(this.addEmailFormState.errors?.email)}
          ${ref(this._addressInputRef)}
        >
          <p slot="help">${i18n('cc-email-list.secondary.address-input.format')}</p>
        </cc-input-text>
        <cc-button primary ?waiting=${isAdding} type="submit">
          ${i18n('cc-email-list.secondary.action.add')}
        </cc-button>
      </form>
    `;
  }

  static get styles() {
    return [
      skeletonStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .secondary-addresses {
          margin: 0;
          padding: 0;
        }

        /* region address-line */

        .address-line {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        .address-line.secondary {
          margin-bottom: 0.8em;
        }

        .address {
          align-items: center;
          display: flex;
          gap: 1em;
        }

        .address.loading {
          opacity: var(--cc-opacity-when-disabled);
        }

        .address-line.secondary .address {
          flex: 1 1 0;
        }

        .address span {
          word-break: break-all;
        }

        .address-line.secondary .address span {
          min-width: 15em;
        }

        /* endregion */

        .buttons {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        /* region FORM */

        form {
          align-items: start;
          display: flex;
          flex-wrap: wrap;
          gap: 0 1em;
          justify-content: flex-end;
        }

        form > cc-input-text {
          flex: 1 1 19em;
        }

        form > cc-button {
          margin-top: var(--cc-margin-top-btn-horizontal-form);
        }

        /* endregion */

        .skeleton {
          background-color: #bbb;
          color: transparent !important;
        }

        .icon--auto {
          flex: auto 0 0;
        }
      `,
    ];
  }
}

window.customElements.define('cc-email-list', CcEmailList);
