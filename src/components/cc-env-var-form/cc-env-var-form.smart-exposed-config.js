import { getAllExposedEnvVars, updateAllExposedEnvVars } from '@clevercloud/client/esm/api/v2/application.js';
import { toNameValueObject } from '@clevercloud/client/esm/utils/env-vars.js';
import { fetchApp } from '../../lib/api-helpers.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { notifyError, notifySuccess } from '../../lib/notifications.js';
import { sendToApi } from '../../lib/send-to-api.js';
import { i18n } from '../../translations/translation.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-env-var-form.js';

defineSmartComponent({
  selector: 'cc-env-var-form[context="exposed-config"]',
  params: {
    apiConfig: { type: Object },
    ownerId: { type: String },
    appId: { type: String },
  },
  onContextUpdate({ context, onEvent, updateComponent, signal }) {
    updateComponent('state', { type: 'loading' });

    const { apiConfig, ownerId, appId } = context;

    Promise.all([
      fetchApp({ apiConfig, signal, ownerId, appId }),
      fetchExposedConfig({ apiConfig, signal, ownerId, appId }),
    ])
      .then(([app, variables]) => {
        updateComponent('appName', app.name);
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
      updateExposedConfig({ apiConfig, ownerId, appId, variables })
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

function fetchExposedConfig({ apiConfig, signal, ownerId, appId }) {
  return getAllExposedEnvVars({ id: ownerId, appId })
    .then(sendToApi({ apiConfig, signal }))
    .then((exposedVarsObject) => {
      return Object.entries(exposedVarsObject).map(([name, value]) => ({ name, value }));
    });
}

function updateExposedConfig({ apiConfig, signal, ownerId, appId, variables }) {
  const variablesObject = toNameValueObject(variables);
  return updateAllExposedEnvVars({ id: ownerId, appId }, variablesObject).then(sendToApi({ apiConfig, signal }));
}
