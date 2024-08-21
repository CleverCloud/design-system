import {
  todo_addEmailAddress as addEmailAddress,
  todo_getEmailAddresses as getEmailAddresses,
  todo_removeEmailAddress as removeEmailAddress,
  todo_getConfirmationEmail as sendConfirmationEmail,
} from '@clevercloud/client/esm/api/v2/user.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { notify, notifyError, notifySuccess } from '../../lib/notifications.js';
import { sendToApi } from '../../lib/send-to-api.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-email-list.js';

/**
 * @typedef {import('./cc-email-list.js').CcEmailList} CcEmailList
 * @typedef {import('./cc-email-list.types.js').EmailListStateLoaded} EmailListStateLoaded
 * @typedef {import('./cc-email-list.types.js').SecondaryAddressState} SecondaryAddressState
 * @typedef {import('./cc-email-list.types.js').AddEmailFormState} AddEmailFormState
 * @typedef {import('./cc-email-list.types.js').AddEmailError} AddEmailError
 * @typedef {import('../../lib/send-to-api.types.js').ApiConfig} ApiConfig
 */

defineSmartComponent({
  selector: 'cc-email-list',
  params: {
    apiConfig: { type: Object },
  },
  /**
   *
   * @param {Object} settings
   * @param {CcEmailList} settings.component
   * @param {{apiConfig: ApiConfig}} settings.context
   * @param {(type: string, listener: (detail: any) => void) => void} settings.onEvent
   * @param {function} settings.updateComponent
   * @param {AbortSignal} settings.signal
   */
  onContextUpdate({ component, context, onEvent, updateComponent, signal }) {
    updateComponent('emails', { state: 'loading' });
    updateComponent('addEmailFormState', { state: 'idle' });
    component.resetAddEmailForm();

    const api = getApi(context.apiConfig, signal);

    /**
     *
     * @param {string} address
     * @param {(state: SecondaryAddressState) => void}callback
     */
    function updateSecondary(address, callback) {
      updateComponent(
        'emails',
        /** @param {EmailListStateLoaded} emails */
        (emails) => {
          const secondaryState = emails.value.secondaryAddresses.find((a) => a.address === address);
          if (secondaryState != null) {
            callback(secondaryState);
          }
        },
      );
    }

    api
      .fetchEmailAddresses()
      .then(({ self, secondary }) => {
        updateComponent('emails', {
          state: 'loaded',
          value: {
            primaryAddress: {
              state: 'idle',
              address: self.email,
              verified: self.emailValidated,
            },
            secondaryAddresses: secondary.map((secondaryAddress) => ({
              state: 'idle',
              address: secondaryAddress,
              verified: true,
            })),
          },
        });
      })
      .catch((error) => {
        console.error(error);
        updateComponent('emails', { state: 'error' });
      });

    onEvent('cc-email-list:send-confirmation-email', (address) => {
      updateComponent(
        'emails',
        /** @param {EmailListStateLoaded} emails */
        (emails) => {
          emails.value.primaryAddress.state = 'sending-confirmation-email';
        },
      );

      api
        .sendConfirmationEmail()
        .then(() => {
          notify({
            intent: 'info',
            title: i18n('cc-email-list.primary.action.resend-confirmation-email.success.title'),
            message: i18n('cc-email-list.primary.action.resend-confirmation-email.success.message', { address }),
            options: {
              timeout: 0,
              closeable: true,
            },
          });
        })
        .catch(
          /** @param {Error} error */
          (error) => {
            console.error(error);
            notifyError(i18n('cc-email-list.primary.action.resend-confirmation-email.error', { address }));
          },
        )
        .finally(() => {
          updateComponent(
            'emails',
            /** @param {EmailListStateLoaded} emails */
            (emails) => {
              emails.value.primaryAddress.state = 'idle';
            },
          );
        });
    });

    onEvent('cc-email-list:add', (address) => {
      updateComponent(
        'addEmailFormState',
        /** @param {AddEmailFormState} state */
        (state) => {
          state.type = 'adding';
        },
      );

      api
        .addSecondaryEmailAddress(address)
        .then(() => {
          notify({
            intent: 'info',
            title: i18n('cc-email-list.secondary.action.add.success.title'),
            message: i18n('cc-email-list.secondary.action.add.success.message', { address }),
            options: {
              timeout: 0,
              closeable: true,
            },
          });

          component.resetAddEmailForm();
        })
        .catch(
          /** @param {Error & {id?: number}} error */
          (error) => {
            const errorCode = convertApiError(error.id);

            if (errorCode == null) {
              console.error(error);
              notifyError(i18n('cc-email-list.secondary.action.add.error', { address }));
            } else {
              updateComponent(
                'addEmailFormState',
                /** @param {AddEmailFormState} state */
                (state) => {
                  state.errors = {
                    email: errorCode,
                  };
                },
              );
            }
          },
        )
        .finally(() => {
          updateComponent(
            'addEmailFormState',
            /** @param {AddEmailFormState} state */
            (state) => {
              state.type = 'idle';
            },
          );
        });
    });

    onEvent('cc-email-list:delete', (address) => {
      updateSecondary(address, (secondaryAddressState) => {
        secondaryAddressState.state = 'deleting';
      });

      api
        .deleteSecondaryEmailAddress(address)
        .then(() => {
          notifySuccess(i18n('cc-email-list.secondary.action.delete.success', { address }));

          updateComponent(
            'emails',
            /** @param {EmailListStateLoaded} emails */
            (emails) => {
              emails.value.secondaryAddresses = emails.value.secondaryAddresses.filter((a) => a.address !== address);
            },
          );
        })
        .catch(
          /** @param {Error} error */
          (error) => {
            console.error(error);
            notifyError(i18n('cc-email-list.secondary.action.delete.error', { address }));
            updateSecondary(address, (secondaryAddressState) => {
              secondaryAddressState.state = 'idle';
            });
          },
        );
    });

    onEvent('cc-email-list:mark-as-primary', (address) => {
      updateSecondary(address, (secondaryAddressState) => {
        secondaryAddressState.state = 'marking-as-primary';
      });

      api
        .markSecondaryEmailAddressAsPrimary(address)
        .then(() => {
          notifySuccess(i18n('cc-email-list.secondary.action.mark-as-primary.success', { address }));

          if (component.emails.state === 'loaded') {
            const primaryAddress = component.emails.value.primaryAddress.address;

            updateComponent(
              'emails',
              /** @param {EmailListStateLoaded} emails */
              (emails) => {
                emails.value.primaryAddress.address = address;
              },
            );
            updateSecondary(address, (secondaryAddressState) => {
              secondaryAddressState.state = 'idle';
              secondaryAddressState.address = primaryAddress;
            });
          }
        })
        .catch(
          /** @param {Error} error */
          (error) => {
            console.error(error);
            notifyError(i18n('cc-email-list.secondary.action.mark-as-primary.error', { address }));
            updateSecondary(address, (secondaryAddressState) => {
              secondaryAddressState.state = 'idle';
            });
          },
        );
    });
  },
});

/**
 * @param {number} apiErrorId
 * @return {null|AddEmailError}
 */
function convertApiError(apiErrorId) {
  if (apiErrorId === 550) {
    return 'invalid';
  }
  if (apiErrorId === 101) {
    return 'already-defined';
  }
  if (apiErrorId === 1004) {
    return 'used';
  }
  return null;
}

// -- API calls
/**
 *
 * @param {ApiConfig} apiConfig
 * @param {AbortSignal} signal
 */
function getApi(apiConfig, signal) {
  return {
    /**
     * @return {Promise<{self: {email: string, emailValidated: boolean}, secondary: Array<string>}>}
     */
    fetchEmailAddresses() {
      return Promise.all([this.fetchPrimaryEmailAddress(), this.fetchSecondaryEmailAddresses()]).then(
        ([self, secondary]) => {
          return { self, secondary };
        },
      );
    },

    /**
     * @return {Promise<{email: string, emailValidated: boolean}>}
     */
    fetchPrimaryEmailAddress() {
      return Promise.resolve({
        method: 'get',
        url: `/v2/self`,
        headers: { Accept: 'application/json' },
      }).then(sendToApi({ apiConfig, signal }));
    },

    /**
     * @return {Promise<Array<string>>}
     */
    fetchSecondaryEmailAddresses() {
      return getEmailAddresses().then(sendToApi({ apiConfig, signal }));
    },

    sendConfirmationEmail() {
      return sendConfirmationEmail().then(sendToApi({ apiConfig }));
    },

    /**
     * @param {string} address
     */
    addSecondaryEmailAddress(address) {
      return addEmailAddress({ email: address }, {}).then(sendToApi({ apiConfig }));
    },

    /**
     * @param {string} address
     */
    deleteSecondaryEmailAddress(address) {
      return removeEmailAddress({ email: address }).then(sendToApi({ apiConfig }));
    },

    /**
     * @param {string} address
     */
    markSecondaryEmailAddressAsPrimary(address) {
      return addEmailAddress(
        { email: address },
        {
          // eslint-disable-next-line camelcase
          make_primary: true,
        },
      ).then(sendToApi({ apiConfig }));
    },
  };
}
