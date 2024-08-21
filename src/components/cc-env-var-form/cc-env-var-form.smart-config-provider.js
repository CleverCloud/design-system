import { get as getAddon } from '@clevercloud/client/esm/api/v2/addon.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { notifyError, notifySuccess } from '../../lib/notifications.js';
import { sendToApi } from '../../lib/send-to-api.js';
import { i18n } from '../../translations/translation.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-env-var-form.js';

defineSmartComponent({
  selector: 'cc-env-var-form[context="config-provider"]',
  params: {
    apiConfig: { type: Object },
    ownerId: { type: String },
    addonId: { type: String },
  },
  onContextUpdate({ context, onEvent, updateComponent, signal }) {
    updateComponent('state', { type: 'loading' });

    const { apiConfig, ownerId, addonId } = context;

    let realAddonId = null;

    fetchAddon({ apiConfig, ownerId, addonId, signal })
      .then((addon) => {
        updateComponent('addonName', addon.name);
        realAddonId = addon.realId;
        return fetchVariables({ apiConfig, realAddonId, signal });
      })
      .then((variables) => {
        updateComponent('state', { type: 'loaded', validationMode: 'simple', variables });
      })
      .catch((error) => {
        console.error(error);
        updateComponent('state', { type: 'error' });
      });

    onEvent('cc-env-var-form:submit', (variables) => {
      updateComponent('state', (state) => {
        state.type = 'saving';
      });
      updateVariables({ apiConfig, realAddonId, variables })
        .then(() => {
          updateComponent('state', (state) => {
            state.variables = variables;
          });
          notifySuccess(i18n('cc-env-var-form.update.success'));
        })
        .catch(() => notifyError(i18n('cc-env-var-form.update.error')))
        .finally(() => {
          updateComponent('state', (state) => {
            state.type = 'loaded';
          });
        });
    });
  },
});

function fetchAddon({ apiConfig, signal, ownerId, addonId }) {
  return getAddon({ id: ownerId, addonId }).then(sendToApi({ apiConfig, signal }));
}

async function fetchVariables({ apiConfig, signal, realAddonId }) {
  return getConfigProviderEnv({ realAddonId }).then(sendToApi({ apiConfig, signal }));
}

async function updateVariables({ apiConfig, signal, realAddonId, variables }) {
  return updateConfigProviderEnv({ realAddonId }, variables).then(sendToApi({ apiConfig, signal }));
}

// TODO clever-client
export function getConfigProviderEnv(params) {
  return Promise.resolve({
    method: 'get',
    url: `/v4/addon-providers/config-provider/addons/${params.realAddonId}/env`,
    headers: { Accept: 'application/json' },
    // no query params
    // no body
  });
}

// TODO clever-client
export function updateConfigProviderEnv(params, body) {
  return Promise.resolve({
    method: 'put',
    url: `/v4/addon-providers/config-provider/addons/${params.realAddonId}/env`,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    // no query params
    body,
  });
}
