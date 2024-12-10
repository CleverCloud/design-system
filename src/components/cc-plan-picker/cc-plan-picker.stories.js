import {
  iconRemixUserForbidFill as iconConnectionLimit,
  iconRemixCpuLine as iconCpu,
  iconRemixDatabase_2Fill as iconDatabase,
  iconRemixHardDrive_2Fill as iconDisk,
  iconRemixRam_2Fill as iconMem,
} from '../../assets/cc-remix.icons.js';
import { makeStory } from '../../stories/lib/make-story.js';
import '../cc-badge/cc-badge.js';
import './cc-plan-picker.js';

export default {
  tags: ['autodocs'],
  title: '🛠 Creation Tunnel/<cc-plan-picker>',
  component: 'cc-plan-picker',
};

/**
 * @typedef {import('./cc-plan-picker.types.js').PickerPlan} PickerPlan
 * @typedef {import('./cc-plan-picker.js').CcPlanPicker} CcPlanPicker
 */

const conf = {
  component: 'cc-plan-picker',
};

/** @type {PickerPlan[]}  **/
const DEFAULT_ITEM = [
  {
    id: 'dev',
    name: 'DEV',
    details: [
      {
        icon: iconMem,
        value: 'Shared',
      },
      {
        value: '1',
        icon: iconCpu,
      },
    ],
    badge: { content: 'Free' },
  },
  {
    name: 'XXS',
    id: 'xxs',
    details: [
      {
        value: '512 MB',
        icon: iconMem,
      },
      {
        value: '1',
        icon: iconCpu,
      },
    ],
  },
  {
    name: 'XS',
    id: 'xs',
    details: [
      {
        value: '1 GB',
        icon: iconMem,
      },
      {
        value: '1',
        icon: iconCpu,
      },
    ],
  },
  {
    name: 'S',
    id: 's',
    details: [
      {
        value: '2 GB',
        icon: iconMem,
      },
      {
        value: '2',
        icon: iconCpu,
      },
    ],
  },
  {
    name: 'M',
    id: 'm',
    details: [
      {
        value: '4 GB',
        icon: iconMem,
      },
      {
        value: '4',
        icon: iconCpu,
      },
    ],
  },

  {
    name: 'L',
    id: 'l',
    details: [
      {
        value: '8 GB',
        icon: iconMem,
      },
      {
        value: '6',
        icon: iconCpu,
      },
    ],
  },
  {
    name: 'XL',
    id: 'xl',
    details: [
      {
        value: '16 GB',
        icon: iconMem,
      },
      {
        value: '8',
        icon: iconCpu,
      },
    ],
  },
  {
    name: 'XXL',
    id: 'xxl',
    details: [
      {
        value: '32 GB',
        icon: iconMem,
      },
      {
        value: '10',
        icon: iconCpu,
      },
    ],
  },
];

/** @type {PickerPlan[]}  **/
const THIRD_PARTY = [
  {
    id: 'third_party_1',
    name: 'Third party 1',
    details: [],
  },
  {
    id: 'third_party_2',
    name: 'Third party 2',
    details: [],
  },
  {
    id: 'third_party_3',
    name: 'Third party 3',
    details: [],
  },
  {
    id: 'third_party_4',
    name: 'Third party 4',
    details: [],
  },
];

export const defaultStory = makeStory(conf, {
  /** @type {Array<Partial<CcPlanPicker>>}  **/
  items: [{ plans: DEFAULT_ITEM, value: 'xxs' }],
});

export const readonly = makeStory(conf, {
  /** @type {Array<Partial<CcPlanPicker>>}  **/
  items: [{ plans: DEFAULT_ITEM, value: 'xxs', readonly: true }],
});

export const sampleDatabase = makeStory(conf, {
  /** @type {Array<Partial<CcPlanPicker>>}  **/
  items: [
    {
      /** @type {PickerPlan[]}  **/
      plans: [
        {
          name: 'S',
          id: 's',
          details: [
            {
              icon: iconDisk,
              value: '128MB Disk Size',
            },
            {
              icon: iconCpu,
              value: '1 vCPUs',
            },
            {
              icon: iconConnectionLimit,
              value: '100 connection limit',
            },
            {
              icon: iconDatabase,
              value: '1 databases',
            },
          ],
        },
        {
          name: 'M',
          id: 'm',
          details: [
            {
              icon: iconDisk,
              value: '256MB Disk Size',
            },
            {
              icon: iconCpu,
              value: '1 vCPUs',
            },
            {
              icon: iconConnectionLimit,
              value: '250 connection limit',
            },
            {
              icon: iconDatabase,
              value: '5 databases',
            },
          ],
        },

        {
          name: 'L',
          id: 'l',
          details: [
            {
              icon: iconDisk,
              value: '512MB Disk Size',
            },
            {
              icon: iconCpu,
              value: '1 vCPUs',
            },
            {
              icon: iconConnectionLimit,
              value: '500 connection limit',
            },
            {
              icon: iconDatabase,
              value: '10 databases',
            },
          ],
        },
        {
          name: 'XL',
          id: 'xl',
          details: [
            {
              icon: iconDisk,
              value: '1GB Disk Size',
            },
            {
              icon: iconCpu,
              value: '1 vCPUs',
            },
            {
              icon: iconConnectionLimit,
              value: '500 connection limit',
            },
            {
              icon: iconDatabase,
              value: '10 databases',
            },
          ],
        },
        {
          name: '2XL',
          id: '2xl',
          details: [
            {
              icon: iconDisk,
              value: '2.5GB Disk Size',
            },
            {
              icon: iconCpu,
              value: '1 vCPUs',
            },
            {
              icon: iconConnectionLimit,
              value: '750 connection limit',
            },
            {
              icon: iconDatabase,
              value: '10 databases',
            },
          ],
        },
        {
          name: '3XL',
          id: '3xl',
          details: [
            {
              icon: iconDisk,
              value: '5GB Disk Size',
            },
            {
              icon: iconCpu,
              value: '1 vCPUs',
            },
            {
              icon: iconConnectionLimit,
              value: '1000 connection limit',
            },
            {
              icon: iconDatabase,
              value: '20 databases',
            },
          ],
        },
        {
          name: '4XL',
          id: '4xl',
          details: [
            {
              icon: iconDisk,
              value: '10GB Disk Size',
            },
            {
              icon: iconCpu,
              value: '1 vCPUs',
            },
            {
              icon: iconConnectionLimit,
              value: '1500 connection limit',
            },
            {
              icon: iconDatabase,
              value: '20 databases',
            },
          ],
        },
      ],
    },
  ],
});

export const thirdParty = makeStory(conf, {
  /** @type {Array<Partial<CcPlanPicker>>}  **/
  items: [
    {
      plans: THIRD_PARTY,
      value: 'third_party_1',
    },
  ],
});

export const thirdPartyReadonly = makeStory(conf, {
  /** @type {Array<Partial<CcPlanPicker>>}  **/
  items: [
    {
      plans: THIRD_PARTY,
      readonly: true,
      value: 'third_party_1',
    },
  ],
});
