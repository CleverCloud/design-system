import { makeStory, storyWait } from '../../stories/lib/make-story.js';
import './cc-tile-scalability.js';

export default {
  tags: ['autodocs'],
  title: '🛠 Overview/<cc-tile-scalability>',
  component: 'cc-tile-scalability',
};

const conf = {
  component: 'cc-tile-scalability',
  displayMode: 'flex-wrap',
  // language=CSS
  css: `
    cc-tile-scalability {
      width: 275px;
    }
  `,
};

/**
 * @typedef {import('./cc-tile-scalability.js').CcTileScalability} CcTileScalability
 * @typedef {import('./cc-tile-scalability.types.js').TileScalabilityStateLoaded} TileScalabilityStateLoaded
 * @typedef {import('./cc-tile-scalability.types.js').TileScalabilityStateLoading} TileScalabilityStateLoading
 * @typedef {import('./cc-tile-scalability.types.js').TileScalabilityStateError} TileScalabilityStateError
 * @typedef {import('../common.types.js').Flavor} Flavor
 * @typedef {import('../common.types.js').Scalability} Scalability
 */

/** @type {{ [key: string]: Flavor}} Flavor */
const ALL_FLAVORS = {
  pico: { name: 'pico', mem: 256, cpus: 1, gpus: 0, microservice: true },
  nano: { name: 'nano', mem: 512, cpus: 1, gpus: 0, microservice: true },
  XS: { name: 'XS', mem: 1024, cpus: 1, gpus: 0, microservice: false },
  S: { name: 'S', mem: 2048, cpus: 2, gpus: 0, microservice: false },
  M: { name: 'M', mem: 4096, cpus: 4, gpus: 0, microservice: false },
  L: { name: 'L', mem: 8192, cpus: 6, gpus: 0, microservice: false },
  XL: { name: 'XL', mem: 16384, cpus: 8, gpus: 0, microservice: false },
  '2XL': { name: '2XL', mem: 24576, cpus: 12, gpus: 0, microservice: false },
  '3XL': { name: '3XL', mem: 32768, cpus: 16, gpus: 0, microservice: false },
  ML_XS: { name: 'ML_XS', mem: 6144, cpus: 8, gpus: 1, microservice: false },
  ML_S: { name: 'ML_S', mem: 14336, cpus: 8, gpus: 1, microservice: false },
  ML_M: { name: 'ML_M', mem: 22528, cpus: 16, gpus: 2, microservice: false },
  ML_L: { name: 'ML_L', mem: 26624, cpus: 16, gpus: 2, microservice: false },
  ML_XL: { name: 'ML_XL', mem: 36864, cpus: 24, gpus: 3, microservice: false },
  ML_2XL: { name: 'ML_2XL', mem: 40960, cpus: 24, gpus: 3, microservice: false },
  ML_3XL: { name: 'ML_3XL', mem: 53248, cpus: 32, gpus: 4, microservice: false },
};

/**
 * @param {Flavor} minFlavor
 * @param {Flavor} maxFlavor
 * @param {number} minInstances
 * @param {number} maxInstances
 * @return {TileScalabilityStateLoaded}
 */
function scalabilityLoaded(minFlavor, maxFlavor, minInstances, maxInstances) {
  return { type: 'loaded', minFlavor, maxFlavor, minInstances, maxInstances };
}

export const defaultStory = makeStory(conf, {
  items: [
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.pico, ALL_FLAVORS.pico, 1, 1),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.L, ALL_FLAVORS.L, 2, 4),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.ML_XL, ALL_FLAVORS.ML_3XL, 40, 40),
    },
  ],
});

export const loading = makeStory(conf, {
  items: [
    {
      /** @type {TileScalabilityStateLoading} */
      state: { type: 'loading' },
    },
  ],
});

export const error = makeStory(conf, {
  items: [
    {
      /** @type {TileScalabilityStateError} */
      state: { type: 'error' },
    },
  ],
});

export const dataLoadedWithNoAutoScalability = makeStory(conf, {
  items: [
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.pico, ALL_FLAVORS.pico, 1, 1),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.S, ALL_FLAVORS.S, 2, 2),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.ML_XL, ALL_FLAVORS.ML_XL, 20, 20),
    },
  ],
});

export const dataLoadedWithHorizontalScalability = makeStory(conf, {
  items: [
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.nano, ALL_FLAVORS.nano, 1, 2),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.L, ALL_FLAVORS.L, 2, 4),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.ML_3XL, ALL_FLAVORS.ML_3XL, 20, 40),
    },
  ],
});

export const dataLoadedWithVerticalScalability = makeStory(conf, {
  items: [
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.pico, ALL_FLAVORS.nano, 1, 1),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.S, ALL_FLAVORS.L, 2, 2),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.ML_XL, ALL_FLAVORS.ML_3XL, 40, 40),
    },
  ],
});

export const dataLoadedWithHorizontalAndVerticalScalability = makeStory(conf, {
  items: [
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.pico, ALL_FLAVORS.nano, 1, 2),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.S, ALL_FLAVORS.L, 2, 4),
    },
    {
      /** @type {TileScalabilityStateLoaded} */
      state: scalabilityLoaded(ALL_FLAVORS.ML_XL, ALL_FLAVORS.ML_3XL, 20, 40),
    },
  ],
});

export const simulations = makeStory(conf, {
  items: [{}, {}],
  simulations: [
    storyWait(
      2000,
      /** @param {CcTileScalability[]} components */
      ([component, componentError]) => {
        component.state = scalabilityLoaded(ALL_FLAVORS.pico, ALL_FLAVORS.XL, 2, 3);
        componentError.state = { type: 'error' };
      },
    ),
  ],
});
