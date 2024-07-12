import { getStatusCodesFromWarp10 } from '@clevercloud/client/esm/access-logs.js';
import { getWarp10AccessLogsToken } from '@clevercloud/client/esm/api/v2/warp-10.js';
import { THIRTY_SECONDS } from '@clevercloud/client/esm/request.fetch-with-timeout.js';
import { ONE_DAY } from '@clevercloud/client/esm/with-cache.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { sendToApi, sendToWarp } from '../../lib/send-to-api.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-tile-status-codes.js';

/**
 * @typedef {import('../../lib/send-to-api.types.js').ApiConfig} ApiConfig
 * @typedef {import('../../lib/send-to-api.types.js').Warp10ApiConfig} Warp10ApiConfig
 * @typedef {import('./cc-tile-status-codes.types.js').StatusCodesData} StatusCodesData
 */

defineSmartComponent({
  selector: 'cc-tile-status-codes',
  params: {
    apiConfig: { type: Object },
    ownerId: { type: String },
    appId: { type: String, optional: true },
  },
  onContextUpdate({ context, updateComponent, signal }) {
    const { apiConfig, ownerId, appId } = context;

    updateComponent('state', { type: 'loading' });

    fetchStatusCodes({ apiConfig, signal, ownerId, appId })
      .then((statusCodes) => {
        updateComponent('state', { type: 'loaded', statusCodes });
      })
      .catch((error) => {
        console.log(error);
        updateComponent('state', { type: 'error' });
      });
  },
});

/**
 * @param {Object} settings
 * @param {ApiConfig & Warp10ApiConfig} settings.apiConfig
 * @param {AbortSignal} settings.signal
 * @param {string} settings.ownerId
 * @param {string} settings.appId
 * @return {Promise<StatusCodesData>}
 */
async function fetchStatusCodes({ apiConfig, signal, ownerId, appId }) {
  const warpToken = await getWarp10AccessLogsToken({ orgaId: ownerId }).then(
    sendToApi({ apiConfig, signal, cacheDelay: ONE_DAY }),
  );
  return getStatusCodesFromWarp10({ warpToken, ownerId, appId }).then(
    sendToWarp({ apiConfig, signal, timeout: THIRTY_SECONDS }),
  );
}
