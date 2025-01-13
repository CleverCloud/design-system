import { makeStory } from '../../stories/lib/make-story.js';
import './cc-addon-elasticsearch-options.js';

export default {
  tags: ['autodocs'],
  title: '🛠 Addon/<cc-addon-elasticsearch-options>',
  component: 'cc-addon-elasticsearch-options',
};

const conf = {
  component: 'cc-addon-elasticsearch-options',
};

/**
 * @typedef {import('./cc-addon-elasticsearch-options.js').CcAddonElasticsearchOptions} CcAddonElasticsearchOptions
 */

export const defaultStory = makeStory(conf, {
  /** @type {Partial<CcAddonElasticsearchOptions>[]} */
  items: [
    {
      state: {
        type: 'loaded',
        hasMonthlyCost: true,
        options: [
          {
            name: 'kibana',
            enabled: false,
            flavor: {
              name: 'L',
              mem: 8192,
              cpus: 6,
              gpus: 0,
              microservice: false,
              monthlyCost: { amount: 144, currency: 'EUR' },
            },
          },
          {
            name: 'apm',
            enabled: false,
            flavor: {
              name: 'M',
              mem: 4096,
              cpus: 4,
              gpus: 0,
              microservice: false,
              monthlyCost: { amount: 72, currency: 'EUR' },
            },
          },
          {
            name: 'encryption',
            enabled: false,
          },
        ],
      },
    },
  ],
});

export const loading = makeStory(conf, {
  /** @type {Partial<CcAddonElasticsearchOptions>[]} */
  items: [
    {
      state: {
        type: 'loading',
        hasMonthlyCost: true,
        options: [
          {
            name: 'kibana',
            enabled: false,
          },
          {
            name: 'apm',
            enabled: false,
          },
          {
            name: 'encryption',
            enabled: false,
          },
        ],
      },
    },
  ],
});

export const loadingWithNoMonthlyCost = makeStory(conf, {
  /** @type {Partial<CcAddonElasticsearchOptions>[]} */
  items: [
    {
      state: {
        type: 'loading',
        hasMonthlyCost: false,
        options: [
          {
            name: 'kibana',
            enabled: false,
          },
          {
            name: 'apm',
            enabled: false,
          },
          {
            name: 'encryption',
            enabled: false,
          },
        ],
      },
    },
  ],
});

export const dataLoadedWithPreselectedKibana = makeStory(conf, {
  /** @type {Partial<CcAddonElasticsearchOptions>[]} */
  items: [
    {
      state: {
        type: 'loaded',
        hasMonthlyCost: true,
        options: [
          {
            name: 'kibana',
            enabled: true,
            flavor: {
              name: 'L',
              mem: 8192,
              cpus: 6,
              gpus: 0,
              microservice: false,
              monthlyCost: { amount: 144, currency: 'EUR' },
            },
          },
          {
            name: 'apm',
            enabled: false,
            flavor: {
              name: 'M',
              mem: 4096,
              cpus: 4,
              gpus: 0,
              microservice: false,
              monthlyCost: { amount: 72, currency: 'EUR' },
            },
          },
          {
            name: 'encryption',
            enabled: false,
          },
        ],
      },
    },
  ],
});

export const dataLoadedWithDollars = makeStory(conf, {
  /** @type {Partial<CcAddonElasticsearchOptions>[]} */
  items: [
    {
      state: {
        type: 'loaded',
        hasMonthlyCost: true,
        options: [
          {
            name: 'kibana',
            enabled: false,
            flavor: {
              name: 'L',
              mem: 8192,
              cpus: 6,
              gpus: 0,
              microservice: false,
              monthlyCost: { amount: 144, currency: 'USD' },
            },
          },
          {
            name: 'apm',
            enabled: false,
            flavor: {
              name: 'M',
              mem: 4096,
              cpus: 4,
              gpus: 0,
              microservice: false,
              monthlyCost: { amount: 72, currency: 'USD' },
            },
          },
          {
            name: 'encryption',
            enabled: false,
          },
        ],
      },
    },
  ],
});

export const dataLoadedWithNoMonthlyCost = makeStory(conf, {
  /** @type {Partial<CcAddonElasticsearchOptions>[]} */
  items: [
    {
      state: {
        type: 'loaded',
        hasMonthlyCost: false,
        options: [
          {
            name: 'kibana',
            enabled: false,
            flavor: {
              name: 'L',
              mem: 8192,
              cpus: 6,
              gpus: 0,
              microservice: false,
            },
          },
          {
            name: 'apm',
            enabled: false,
            flavor: {
              name: 'M',
              mem: 4096,
              cpus: 4,
              gpus: 0,
              microservice: false,
            },
          },
          {
            name: 'encryption',
            enabled: false,
          },
        ],
      },
    },
  ],
});
