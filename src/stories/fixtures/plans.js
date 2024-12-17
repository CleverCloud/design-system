import {
  iconRemixCpuLine as iconCpu,
  iconRemixHardDrive_2Fill as iconDisk,
  iconRemixRam_2Fill as iconMem,
} from '../../assets/cc-remix.icons.js';

/**
* @typedef {import('../../../src/components/cc-plan-configurator/cc-plan-configurator.types.js').ConfiguratorPlan} ConfiguratorPlan
*/

/** @type {ConfiguratorPlan[]}  **/
export const DEFAULT_PLANS = [
  {
    id: 'plan_dev',
    name: 'DEV',
    details: [
      {
        icon: iconMem,
        value: 'Shared memory',
      },
      {
        value: '1 vCPUs',
        icon: iconCpu,
      },
    ],
    badge: { content: 'Free' },
    relatedPlans: [],
  },
  {
    name: 'XXS',
    id: 'plan_1',
    details: [
      {
        value: '512 MB memory',
        icon: iconMem,
      },
      {
        value: '1 vCPUs',
        icon: iconCpu,
      },
    ],
    relatedPlans: [
      {
        name: 'XXS Small Space',
        id: 'plan_11',
        details: [
          {
            value: '512 MB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XXS Medium Space',
        id: 'plan_12',
        details: [
          {
            value: '1 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XXS Big Space',
        id: 'plan_13',
        details: [
          {
            value: '2 GB disk size',
            icon: iconDisk,
          },
        ],
      },
    ],
  },
  {
    name: 'XS',
    id: 'plan_2',
    details: [
      {
        value: '1 GB memory',
        icon: iconMem,
      },
      {
        value: '1 vCPUs',
        icon: iconCpu,
      },
    ],
    relatedPlans: [
      {
        name: 'XS Tiny Space',
        id: 'plan_21',
        details: [
          {
            value: '2 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XS Small Space',
        id: 'plan_22',
        details: [
          {
            value: '5 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XS Medium Space',
        id: 'plan_23',
        details: [
          {
            value: '10 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XS Big Space',
        id: 'plan_24',
        details: [
          {
            value: '15 GB disk size',
            icon: iconDisk,
          },
        ],
      },
    ],
  },
  {
    name: 'S',
    id: 'plan_3',
    details: [
      {
        value: '2 GB memory',
        icon: iconMem,
      },
      {
        value: '2 vCPUs',
        icon: iconCpu,
      },
    ],
    relatedPlans: [
      {
        name: 'S Small Space',
        id: 'plan_31',
        details: [
          {
            value: '512 MB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'S Medium Space',
        id: 'plan_32',
        details: [
          {
            value: '1 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'S Big Space',
        id: 'plan_33',
        details: [
          {
            value: '2 GB disk size',
            icon: iconDisk,
          },
        ],
      },
    ],
  },
  {
    name: 'M',
    id: 'plan_4',
    details: [
      {
        value: '4 GB memory',
        icon: iconMem,
      },
      {
        value: '4 vCPUs',
        icon: iconCpu,
      },
    ],
    relatedPlans: [
      {
        name: 'M Small Space',
        id: 'plan_41',
        details: [
          {
            value: '512 MB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'M Medium Space',
        id: 'plan_42',
        details: [
          {
            value: '1 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'M Big Space',
        id: 'plan_43',
        details: [
          {
            value: '2 GB disk size',
            icon: iconDisk,
          },
        ],
      },
    ],
  },

  {
    name: 'L',
    id: 'plan_5',
    details: [
      {
        value: '8 GB memory',
        icon: iconMem,
      },
      {
        value: '6 vCPUs',
        icon: iconCpu,
      },
    ],
    relatedPlans: [
      {
        name: 'L Small Space',
        id: 'plan_51',
        details: [
          {
            value: '512 MB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'L Medium Space',
        id: 'plan_52',
        details: [
          {
            value: '1 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'L Big Space',
        id: 'plan_53',
        details: [
          {
            value: '2 GB disk size',
            icon: iconDisk,
          },
        ],
      },
    ],
  },
  {
    name: 'XL',
    id: 'plan_6',
    details: [
      {
        value: '16 GB memory',
        icon: iconMem,
      },
      {
        value: '8 vCPUs',
        icon: iconCpu,
      },
    ],
    relatedPlans: [
      {
        name: 'XL Small Space',
        id: 'plan_61',
        details: [
          {
            value: '5 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XL Medium Space',
        id: 'plan_62',
        details: [
          {
            value: '10 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XL Big Space',
        id: 'plan_63',
        details: [
          {
            value: '15 GB disk size',
            icon: iconDisk,
          },
        ],
      },
    ],
  },
  {
    name: 'XXL',
    id: 'plan_7',
    details: [
      {
        value: '32 GB memory',
        icon: iconMem,
      },
      {
        value: '10 vCPUs',
        icon: iconCpu,
      },
    ],
    relatedPlans: [
      {
        name: 'XXL Small Space',
        id: 'plan_71',
        details: [
          {
            value: '5 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XXL Medium Space',
        id: 'plan_72',
        details: [
          {
            value: '10 GB disk size',
            icon: iconDisk,
          },
        ],
      },
      {
        name: 'XXL Big Space',
        id: 'plan_73',
        details: [
          {
            value: '15 GB disk size',
            icon: iconDisk,
          },
        ],
      },
    ],
  },
];

/** @type {ConfiguratorPlan[]}  **/
export const THIRD_PARTY = [{
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
