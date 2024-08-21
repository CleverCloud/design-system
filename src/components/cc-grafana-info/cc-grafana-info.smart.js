import {
  createGrafanaOrganisation,
  deleteGrafanaOrganisation,
  getGrafanaOrganisation,
  resetGrafanaOrganisation,
} from '../../lib/api-helpers.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { notifyError, notifySuccess } from '../../lib/notifications.js';
import { sendToApi } from '../../lib/send-to-api.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-grafana-info.js';

defineSmartComponent({
  selector: 'cc-grafana-info',
  params: {
    apiConfig: { type: Object },
    ownerId: { type: String },
    grafanaBaseLink: { type: String },
  },
  onContextUpdate({ context, updateComponent, onEvent, signal }) {
    const { apiConfig, ownerId, grafanaBaseLink } = context;

    updateComponent('state', { type: 'loading' });

    function fetch() {
      fetchGrafanaOrganisation({ apiConfig, signal, ownerId, grafanaBaseLink })
        .then((info) => {
          updateComponent('state', { type: 'loaded', info });
        })
        .catch((error) => {
          console.error(error);
          updateComponent('state', { type: 'error' });
        });
    }

    onEvent('cc-grafana-info:reset', () => {
      updateComponent('state', (state) => {
        state.info.action = 'resetting';
      });

      doResetGrafanaOrganisation({ apiConfig, ownerId })
        .then(() => notifySuccess(i18n('cc-grafana-info.reset.success')))
        .catch((error) => {
          console.error(error);
          notifyError(i18n('cc-grafana-info.reset.error'));
        })
        .finally(() => {
          updateComponent('state', (state) => {
            state.info.action = null;
          });
        });
    });

    onEvent('cc-grafana-info:disable', () => {
      updateComponent('state', (state) => {
        state.info.action = 'disabling';
      });

      disableGrafanaOrganisation({ apiConfig, ownerId })
        .then(() => {
          updateComponent('state', (state) => {
            state.info = { status: 'disabled' };
          });
          notifySuccess(i18n('cc-grafana-info.disable.success'));
        })
        .catch((error) => {
          console.error(error);
          notifyError(i18n('cc-grafana-info.disable.error'));
        })
        .finally(() => {
          updateComponent('state', (state) => {
            state.info.action = null;
          });
        });
    });

    onEvent('cc-grafana-info:enable', () => {
      updateComponent('state', (state) => {
        state.info.action = 'enabling';
      });

      enableGrafanaOrganisation({ apiConfig, ownerId })
        .then(() => {
          fetch();
          notifySuccess(i18n('cc-grafana-info.enable.success'));
        })
        .catch((error) => {
          console.error(error);
          notifyError(i18n('cc-grafana-info.enable.error'));
        })
        .finally(() => {
          updateComponent('state', (state) => {
            state.info.action = null;
          });
        });
    });

    fetch();
  },
});

function fetchGrafanaOrganisation({ apiConfig, signal, ownerId, grafanaBaseLink }) {
  return getGrafanaOrganisation({ id: ownerId })
    .then(sendToApi({ apiConfig, signal }))
    .then((exposedVarsObject) => {
      const grafanaLink = new URL('/d/home/clever-cloud-metrics-home', grafanaBaseLink);
      grafanaLink.searchParams.set('orgId', exposedVarsObject.id);
      return { status: 'enabled', link: grafanaLink.toString() };
    })
    .catch((error) => {
      if (error.response?.status === 404 && error.toString().startsWith('Error: Grafana organization not found')) {
        return { status: 'disabled' };
      } else {
        throw error;
      }
    });
}

function doResetGrafanaOrganisation({ apiConfig, ownerId }) {
  return resetGrafanaOrganisation({ id: ownerId }).then(sendToApi({ apiConfig }));
}

function disableGrafanaOrganisation({ apiConfig, ownerId }) {
  return deleteGrafanaOrganisation({ id: ownerId }).then(sendToApi({ apiConfig }));
}

function enableGrafanaOrganisation({ apiConfig, ownerId }) {
  return createGrafanaOrganisation({ id: ownerId }).then(sendToApi({ apiConfig }));
}
