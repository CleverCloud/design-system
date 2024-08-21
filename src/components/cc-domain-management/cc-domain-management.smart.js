import {
  addDomain,
  getAllDomains,
  getFavouriteDomain as getPrimaryDomain,
  markFavouriteDomain as markPrimaryDomain,
  removeDomain,
  unmarkFavouriteDomain as unmarkPrimaryDomain,
} from '@clevercloud/client/esm/api/v2/application.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { getHostWithWildcard, isTestDomain, parseDomain } from '../../lib/domain.js';
import { notify, notifyError, notifySuccess } from '../../lib/notifications.js';
import { sendToApi } from '../../lib/send-to-api.js';
import { i18n } from '../../translations/translation.js';
import '../cc-smart-container/cc-smart-container.js';
import { CcDomainManagement } from './cc-domain-management.js';

/**
 * @typedef {import('./cc-domain-management.types.js').DomainManagementFormState} DomainManagementFormState
 * @typedef {import('./cc-domain-management.types.js').DomainManagementListStateLoaded} DomainManagementListStateLoaded
 * @typedef {import('./cc-domain-management.types.js').DomainStateIdle} DomainStateIdle
 * @typedef {import('./cc-domain-management.types.js').DomainState} DomainState
 * @typedef {import('./cc-domain-management.types.js').DomainInfo} DomainInfo
 * @typedef {import('../../lib/send-to-api.js').ApiConfig} ApiConfig
 * @typedef {{ fqdn: string }} RawDomainFromApi
 * @typedef {Omit<DomainInfo, 'isPrimary'>} DomainInfoWithoutIsPrimary
 */

defineSmartComponent({
  selector: 'cc-domain-management',
  params: {
    apiConfig: { type: Object },
    appId: { type: String },
    ownerId: { type: String },
  },
  onContextUpdate({ context, onEvent, updateComponent, signal }) {
    const { apiConfig, appId, ownerId } = context;

    /**
     * @param {string} id
     * @param {(domainState: DomainState) => void} callback
     **/
    function updateDomain(id, callback) {
      updateComponent(
        'domainListState',
        /** @param {DomainManagementListStateLoaded} domainListState */
        (domainListState) => {
          const domainState = domainListState.domains.find((domain) => domain.id === id);
          if (domainState != null) {
            callback(domainState);
          }
        },
      );
    }

    getDomains({ apiConfig, ownerId, appId, signal })
      .then((domains) => {
        updateComponent('domainListState', { type: 'loaded', domains });
      })
      .catch((error) => {
        console.error(error);
        updateComponent('domainListState', { type: 'error' });
      });

    fetchDnsInfo({ apiConfig, ownerId, appId, signal })
      .then(({ cnameRecord, aRecords }) => {
        updateComponent('dnsInfoState', { type: 'loaded', cnameRecord, aRecords });
      })
      .catch((error) => {
        console.error(error);
        updateComponent('dnsInfoState', { type: 'error' });
      });

    onEvent(
      'cc-domain-management:add',
      /** @param {{ hostname: string, pathPrefix: string, isWildcard: boolean }} domain */
      ({ hostname, pathPrefix, isWildcard }) => {
        const domainWithPathAndWildcard = getHostWithWildcard(hostname + pathPrefix, isWildcard);
        updateComponent(
          'domainFormState',
          /** @param {DomainManagementFormState} domainFormState */
          (domainFormState) => {
            domainFormState.type = 'adding';
          },
        );

        createNewDomain({ apiConfig, ownerId, appId, hostname, pathPrefix, isWildcard })
          .then(() => {
            if (isTestDomain(hostname)) {
              notifySuccess(i18n('cc-domain-management.form.submit.success', { domain: domainWithPathAndWildcard }));
            } else {
              notify({
                intent: 'info',
                message: i18n('cc-domain-management.form.submit.success-config', { domain: domainWithPathAndWildcard }),
                options: {
                  timeout: 0,
                  closeable: true,
                },
              });
            }
            updateComponent('domainFormState', CcDomainManagement.INIT_DOMAIN_FORM_STATE);
            updateComponent(
              'domainListState',
              /** @param {DomainManagementListStateLoaded} domainListState */
              (domainListState) => {
                const hasPathPrefix = pathPrefix != null && pathPrefix !== '/';
                // TODO: once the API returns actual ids, this should be adapted (either refetch or use the API response)
                const id = hasPathPrefix ? hostname + pathPrefix : hostname;

                /** @type {DomainStateIdle} */
                const newDomain = {
                  id,
                  hostname: hostname,
                  type: 'idle',
                  pathPrefix,
                  isWildcard,
                  isPrimary: false,
                };

                domainListState.domains.push(newDomain);
              },
            );
          })
          .catch(
            /** @param {Error} error */
            (error) => {
              console.error(error);
              const errorCode = convertApiError(error);

              updateComponent(
                'domainFormState',
                /** @param {DomainManagementFormState} domainFormState */
                (domainFormState) => {
                  domainFormState.type = 'idle';
                },
              );

              if (errorCode === 'invalid-format') {
                updateComponent(
                  'domainFormState',
                  /** @param {DomainManagementFormState} domainFormState */
                  (domainFormState) => {
                    domainFormState.hostname.error = { code: errorCode };
                  },
                );
                return;
              }

              if (errorCode === 'already-used') {
                notifyError(
                  i18n('cc-domain-management.form.submit.error-duplicate.text', { domain: domainWithPathAndWildcard }),
                  i18n('cc-domain-management.form.submit.error-duplicate.heading'),
                );
                return;
              }

              notifyError(i18n('cc-domain-management.form.submit.error', { domain: domainWithPathAndWildcard }));
            },
          );
      },
    );

    onEvent(
      'cc-domain-management:delete',
      /** @param {DomainInfo} domain */
      ({ id, hostname, pathPrefix, isWildcard }) => {
        const domainWithPathAndWildcard = getHostWithWildcard(hostname + pathPrefix, isWildcard);
        updateDomain(id, (domainState) => {
          domainState.type = 'deleting';
        });

        deleteDomain({ apiConfig, ownerId, appId, id })
          .then(() => {
            updateComponent(
              'domainListState',
              /** @param {DomainManagementListStateLoaded} domainListState */
              (domainListState) => {
                domainListState.domains = domainListState.domains.filter((domain) => domain.id !== id);
              },
            );
            notifySuccess(i18n('cc-domain-management.list.delete.success', { domain: domainWithPathAndWildcard }));
          })
          .catch((error) => {
            console.error(error);

            notifyError(i18n('cc-domain-management.list.delete.error', { domain: domainWithPathAndWildcard }));

            updateDomain(id, (domainState) => {
              domainState.type = 'idle';
            });
          });
      },
    );

    onEvent(
      'cc-domain-management:mark-as-primary',
      /** @param {DomainInfo}  domain */
      ({ id, hostname, pathPrefix, isWildcard }) => {
        const domainWithPathAndWildcard = getHostWithWildcard(hostname + pathPrefix, isWildcard);
        updateDomain(id, (domainState) => {
          domainState.type = 'marking-primary';
        });

        markAsPrimaryDomain({ apiConfig, ownerId, appId, id })
          .then(() => {
            updateComponent(
              'domainListState',
              /** @param {DomainManagementListStateLoaded} domainListState */
              (domainListState) => {
                domainListState.domains = domainListState.domains.map((domainState) => ({
                  ...domainState,
                  type: 'idle',
                  isPrimary: domainState.id === id,
                }));
              },
            );

            // Dispatch event to make the console refresh its UI
            const primaryChangeEvent = new CustomEvent('domain-management-primary-change', {
              detail: id,
            });
            window.dispatchEvent(primaryChangeEvent);

            notifySuccess(i18n('cc-domain-management.list.primary.success', { domain: domainWithPathAndWildcard }));
          })
          .catch((error) => {
            console.error(error);
            updateDomain(id, (domainState) => {
              domainState.type = 'idle';
            });

            if (error.id === 3004) {
              notifyError(
                i18n('cc-domain-management.list.error-not-found.text', { domain: domainWithPathAndWildcard }),
                i18n('cc-domain-management.list.error-not-found.heading'),
              );
              return;
            }

            notifyError(i18n('cc-domain-management.list.primary.error', { domain: domainWithPathAndWildcard }));
          });
      },
    );
  },
});

/**
 * @param {Object} params
 * @param {ApiConfig} params.apiConfig
 * @param {string} params.ownerId
 * @param {string} params.appId
 * @param {AbortSignal} params.signal
 * @returns {Promise<DomainStateIdle[]>}
 */
function getDomains({ apiConfig, ownerId, appId, signal }) {
  return Promise.all([
    fetchPrimaryDomain(ownerId, appId, apiConfig, signal),
    fetchDomains(ownerId, appId, apiConfig),
  ]).then(([primaryDomain, domains]) => {
    /** @type {DomainStateIdle[]} */
    const formattedDomains = domains.map((domainState) => ({
      ...domainState,
      type: 'idle',
      isPrimary: primaryDomain?.fqdn === domainState.id,
    }));

    return formattedDomains;
  });
}

/**
 * @param {Object} params
 * @param {ApiConfig} params.apiConfig
 * @param {string} params.ownerId
 * @param {string} params.appId
 * @param {string} params.hostname
 * @param {string} params.pathPrefix
 * @param {boolean} params.isWildcard
 * @returns {Promise<DomainStateIdle[]>}
 */
function createNewDomain({ apiConfig, ownerId, appId, hostname, pathPrefix, isWildcard }) {
  const domainWithEncodedPathAndWildcard = getHostWithWildcard(hostname, isWildcard) + encodeURIComponent(pathPrefix);
  return addDomain({ id: ownerId, appId, domain: domainWithEncodedPathAndWildcard }).then(sendToApi({ apiConfig }));
}

/**
 * @param {Object} params
 * @param {ApiConfig} params.apiConfig
 * @param {string} params.ownerId
 * @param {string} params.appId
 * @param {string} params.id
 * @returns {Promise<DomainStateIdle[]>}
 */
function deleteDomain({ apiConfig, ownerId, appId, id }) {
  return removeDomain({ id: ownerId, appId, domain: encodeURIComponent(id) }).then(sendToApi({ apiConfig }));
}

/**
 * @param {Object} params
 * @param {ApiConfig} params.apiConfig
 * @param {string} params.ownerId
 * @param {string} params.appId
 * @param {string} params.id
 * @returns {Promise<DomainStateIdle[]>}
 */
function markAsPrimaryDomain({ apiConfig, ownerId, appId, id }) {
  return unmarkPrimaryDomain({ id: ownerId, appId })
    .then(sendToApi({ apiConfig }))
    .then(() => markPrimaryDomain({ id: ownerId, appId }, { fqdn: id }).then(sendToApi({ apiConfig })));
}

/**
 * @param {Object} params
 * @param {ApiConfig} params.apiConfig
 * @param {string} params.ownerId
 * @param {string} params.appId
 * @param {AbortSignal} params.signal
 * @returns {Promise<{ cnameRecord: string, aRecords: string[] }>}
 */
function fetchDnsInfo({ apiConfig, ownerId, appId, signal }) {
  return getDefaultLoadBalancersDnsInfo({ appId, ownerId })
    .then(sendToApi({ apiConfig, signal }))
    .then((defaultLoadBalancers) => {
      const defaultLoadBalancerData = defaultLoadBalancers[0];
      return {
        cnameRecord: defaultLoadBalancerData?.dns?.cname,
        aRecords: defaultLoadBalancerData?.dns?.a,
      };
    });
}

/**
 * TODO: move this to Clever Client
 *
 * @param {Object} params
 * @param {string} params.ownerId
 * @param {string} params.appId
 * @returns {Promise<any>}
 */
function getDefaultLoadBalancersDnsInfo({ appId, ownerId }) {
  return Promise.resolve({
    method: 'get',
    url: `/v4/load-balancers/organisations/${ownerId}/applications/${appId}/load-balancers/default`,
    headers: { Accept: 'application/json' },
  });
}

/**
 * @param {string} id
 * @param {string} appId
 * @param {ApiConfig} apiConfig
 * @param {AbortSignal} signal
 * @returns {Promise<RawDomainFromApi>}
 */
function fetchPrimaryDomain(id, appId, apiConfig, signal) {
  return getPrimaryDomain({ id, appId })
    .then(sendToApi({ apiConfig, signal }))
    .catch(
      /**
       * @param {Error & { response: { status: number }}} error
       * @returns {null|void}
       */
      (error) => {
        if (error.response.status === 404) {
          return null;
        }
      },
    );
}

/**
 * @param {string} id
 * @param {string} appId
 * @param {ApiConfig} apiConfig
 * @returns {Promise<DomainInfoWithoutIsPrimary[]>}
 */
function fetchDomains(id, appId, apiConfig) {
  return getAllDomains({ id, appId })
    .then(sendToApi({ apiConfig }))
    .then(
      /** @param {RawDomainFromApi[]} domains */
      (domains) => {
        return domains.map(({ fqdn }) => {
          const { hostname, pathname, isWildcard } = parseDomain(fqdn);

          /** @type {DomainInfoWithoutIsPrimary} */
          const formattedDomain = {
            id: fqdn,
            hostname,
            pathPrefix: pathname,
            isWildcard,
          };

          return formattedDomain;
        });
      },
    );
}

/**
 * @param {Error} apiError
 * @returns {'invalid-format'|'already-used'|null}
 */
function convertApiError(apiError) {
  // FIXME: ask the API for a proper id to map a message to an error
  if (apiError.message === 'Invalid domain' || apiError.message.includes('is invalid')) {
    return 'invalid-format';
  }
  // FIXME: ask the API for a proper id to map a message to an error
  if (apiError.message.includes('is already taken') || apiError.message.includes('You are not allowed to use')) {
    return 'already-used';
  }
  return null;
}
