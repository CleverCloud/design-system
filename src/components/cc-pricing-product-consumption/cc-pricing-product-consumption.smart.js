import { fetchPriceSystem } from '../../lib/api-helpers.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { formatAddonCellar, formatAddonFsbucket, formatAddonHeptapod, formatAddonPulsar } from '../../lib/product.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-pricing-product-consumption.js';

/**
 * @typedef {import('./cc-pricing-product-consumption.js').CcPricingProductConsumption} CcPricingProductConsumption
 * @typedef {import('../../lib/send-to-api.types.js').ApiConfig} ApiConfig
 */

defineSmartComponent({
  selector: 'cc-pricing-product-consumption',
  params: {
    apiConfig: { type: Object },
    productId: { type: String },
    zoneId: { type: String, optional: true },
    currency: { type: String, optional: true },
  },
  /**
   * @param {Object} settings
   * @param {CcPricingProductConsumption} settings.component
   * @param {{ apiConfig: ApiConfig, productId: string, zoneId?: string, currency?: string }} settings.context
   * @param {(type: string, listener: (detail: any) => void) => void} settings.onEvent
   * @param {function} settings.updateComponent
   * @param {AbortSignal} settings.signal
   */
  // @ts-expect-error FIXME: remove once `onContextUpdate` is typed with generics
  onContextUpdate({ updateComponent, context, signal }) {
    const { apiConfig, productId, zoneId = 'par', currency = 'EUR' } = context;

    // Reset the component before loading
    updateComponent('state', { state: 'loading' });

    fetchProduct({ apiConfig, productId, zoneId, currency, signal })
      .then((product) => {
        updateComponent('state', {
          name: product.name,
          type: 'loaded',
          sections: product.sections,
        });
      })
      .catch((error) => {
        console.error(error);
        updateComponent('state', { state: 'error' });
      });
  },
});

/**
 * @param {object} params
 * @param {ApiConfig} [params.apiConfig]
 * @param {string} params.productId
 * @param {string} params.zoneId
 * @param {string} params.currency
 * @param {AbortSignal} params.signal
 */
function fetchProduct({ apiConfig, productId, zoneId, currency, signal }) {
  return fetchPriceSystem({ apiConfig, zoneId, currency, signal }).then((priceSystem) => {
    if (productId === 'cellar') {
      return {
        name: 'Cellar',
        ...formatAddonCellar(priceSystem),
      };
    }
    if (productId === 'fsbucket') {
      return {
        name: 'FS Bucket',
        ...formatAddonFsbucket(priceSystem),
      };
    }
    if (productId === 'pulsar') {
      return {
        name: 'Pulsar',
        ...formatAddonPulsar(priceSystem),
      };
    }
    if (productId === 'heptapod') {
      return {
        name: 'Heptapod',
        ...formatAddonHeptapod(priceSystem),
      };
    }
    throw new Error(`Cannot find product "${productId}"`);
  });
}
