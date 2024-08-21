import { getKeys } from '@clevercloud/client/esm/api/v2/github.js';
import { get as getUser } from '@clevercloud/client/esm/api/v2/organisation.js';
import {
  todo_addSshKey as addSshKey,
  todo_getSshKeys as getSshKeys,
  todo_removeSshKey as removeSshKey,
} from '@clevercloud/client/esm/api/v2/user.js';
import { ONE_DAY } from '@clevercloud/client/esm/with-cache.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { notifyError, notifySuccess } from '../../lib/notifications.js';
import { sendToApi } from '../../lib/send-to-api.js';
import { i18n } from '../../translations/translation.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-ssh-key-list.js';

/**
 * @typedef {import('./cc-ssh-key-list.js').CcSshKeyList} CcSshKeyList
 * @typedef {import('./cc-ssh-key-list.types.js').SshKey} SshKey
 * @typedef {import('./cc-ssh-key-list.types.js').CreateSshKeyFormState} CreateSshKeyFormState
 * @typedef {import('./cc-ssh-key-list.types.js').KeyDataStateLoadedAndUnlinked} KeyDataStateLoadedAndUnlinked
 * @typedef {import('./cc-ssh-key-list.types.js').KeyDataStateLoadedAndLinked} KeyDataStateLoadedAndLinked
 * @typedef {import('../../lib/send-to-api.types.js').ApiConfig} ApiConfig
 */

defineSmartComponent({
  selector: 'cc-ssh-key-list',
  params: {
    apiConfig: { type: Object },
  },

  /**
   *
   * @param {Object} settings
   * @param {CcSshKeyList} settings.component
   * @param {{apiConfig: ApiConfig}} settings.context
   * @param {(type: string, listener: (detail: any) => void) => void} settings.onEvent
   * @param {function} settings.updateComponent
   * @param {AbortSignal} settings.signal
   */
  onContextUpdate({ component, context, onEvent, updateComponent, signal }) {
    const { apiConfig } = context;

    // Retrieving SSH keys is done in two steps, hidden in the `fetchAllKeys()` implementation:
    // - first, we retrieve the current user information to check if their GitHub account is linked to their main account;
    // - then, we fetch the personal SSH keys and the GitHub keys if needed.
    // Note: we intentionally show `loading` state only on initial load and not on further actions, to keep a responsive UI.
    function refreshList() {
      return fetchAllKeys({ apiConfig, signal, cacheDelay: 0 })
        .then(({ isGithubLinked, personalKeys, githubKeys }) => {
          updateComponent('keyData', {
            state: 'loaded',
            // linked (or unlinked) GitHub account state passed to the component
            isGithubLinked,
            // internal key states initialization (to `idle`) after API fetch, to separate fetched data from UI infos
            personalKeys: personalKeys.map((key) => ({ ...key, state: 'idle' })),
            githubKeys: githubKeys?.map((key) => ({ ...key, state: 'idle' })),
          });
        })
        .catch((error) => {
          console.error(error);
          updateComponent('keyData', { state: 'error' });
        });
    }

    onEvent('cc-ssh-key-list:create', ({ name, publicKey }) => {
      component.createKeyFormState = { type: 'creating' };

      addKey({ apiConfig, key: { name: name.trim(), key: publicKey.trim() } })
        .then(() => {
          // re-fetching keys because we need fingerprint info sent from API to properly display newly created keys
          refreshList().then(() => {
            notifySuccess(i18n('cc-ssh-key-list.success.add', { name }));
            component.resetCreateKeyForm();
          });
        })
        .catch((error) => {
          console.error(error);
          notifyError(error, i18n('cc-ssh-key-list.error.add', { name }));
        })
        .finally(() => {
          component.createKeyFormState = { type: 'idle' };
        });
    });

    onEvent('cc-ssh-key-list:delete', ({ name }) => {
      updateComponent(
        'keyData',
        /** @param {KeyDataStateLoadedAndUnlinked|KeyDataStateLoadedAndLinked} keyData */
        (keyData) => {
          const key = keyData.personalKeys.find((key) => key.name === name);
          key.state = 'deleting';
        },
      );

      deleteKey({ apiConfig, key: { name } })
        .then(() => {
          // refreshing both personal and GitHub keys because we don't know if we should add the deleting key back to the GitHub list
          refreshList().then(() => notifySuccess(i18n('cc-ssh-key-list.success.delete', { name })));
        })
        .catch((error) => {
          console.error(error);
          notifyError(error, i18n('cc-ssh-key-list.error.delete', { name }));
          updateComponent(
            'keyData',
            /** @param {KeyDataStateLoadedAndUnlinked|KeyDataStateLoadedAndLinked} keyData */
            (keyData) => {
              const key = keyData.personalKeys.find((key) => key.name === name);
              key.state = 'idle';
            },
          );
        });
    });

    onEvent('cc-ssh-key-list:import', ({ name, key, fingerprint }) => {
      updateComponent(
        'keyData',
        /** @param {KeyDataStateLoadedAndLinked} keyData */
        (keyData) => {
          const key = keyData.githubKeys.find((key) => key.name === name);
          key.state = 'importing';
        },
      );

      importKey({ apiConfig, key: { name, key } })
        .then(() => {
          notifySuccess(i18n('cc-ssh-key-list.success.import', { name }));
          updateComponent(
            'keyData',
            /** @param {KeyDataStateLoadedAndLinked} keyData */
            (keyData) => {
              keyData.personalKeys.push({ state: 'idle', name, fingerprint });
              keyData.githubKeys = keyData.githubKeys.filter((k) => k.name !== name);
            },
          );
        })
        .catch((error) => {
          console.error(error);
          notifyError(error, i18n('cc-ssh-key-list.error.import', { name }));
          updateComponent(
            'keyData',
            /** @param {KeyDataStateLoadedAndLinked} keyData */
            (keyData) => {
              const key = keyData.githubKeys.find((key) => key.name === name);
              key.state = 'idle';
            },
          );
        });
    });

    updateComponent('keyData', { state: 'loading' });
    component.createKeyFormState = { type: 'idle' };
    component.resetCreateKeyForm();

    refreshList();
  },
});

/**
 * @param {Object} args
 * @param {ApiConfig} args.apiConfig
 * @param {AbortSignal} args.signal
 * @param {number} args.cacheDelay
 * @return {Promise<{
 *   isGithubLinked: boolean,
 *   personalKeys: Array<SshKey>,
 *   githubKeys: Array<SshKey>,
 * }>}
 */
async function fetchAllKeys({ apiConfig, signal, cacheDelay }) {
  const [user, personalKeys] = await Promise.all([
    getUser({}).then(sendToApi({ apiConfig, signal, cacheDelay: ONE_DAY })),
    getSshKeys().then(sendToApi({ apiConfig, signal, cacheDelay })),
  ]);

  const isGithubLinked = user.oauthApps.includes('github');
  let githubKeys;
  if (isGithubLinked) {
    githubKeys = await getKeys().then(sendToApi({ apiConfig, signal, cacheDelay }));
  }

  return { isGithubLinked, personalKeys, githubKeys };
}

/**
 * @param {Object} args
 * @param {ApiConfig} args.apiConfig
 * @param {{name: string, key: string}} args.key
 * @return {Promise<any>}
 */
async function addKey({ apiConfig, key }) {
  const name = encodeURIComponent(key.name);
  const publicKey = key.key;
  return addSshKey({ key: name }, JSON.stringify(publicKey)).then(sendToApi({ apiConfig }));
}

const importKey = addKey;

/**
 * @param {Object} args
 * @param {ApiConfig} args.apiConfig
 * @param {{name: string}} args.key
 * @return {Promise<any>}
 */
async function deleteKey({ apiConfig, key }) {
  const name = encodeURIComponent(key.name);
  return removeSshKey({ key: name }).then(sendToApi({ apiConfig }));
}
