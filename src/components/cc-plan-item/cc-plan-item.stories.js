import {
  iconRemixUserForbidFill as iconConnectionLimit,
  iconRemixCpuLine as iconCpu,
  iconRemixDatabase_2Fill as iconDatabase,
  iconRemixHardDrive_2Fill as iconDisk,
  iconRemixRam_2Fill as iconMem,
} from '../../assets/cc-remix.icons.js';
import { makeStory } from '../../stories/lib/make-story.js';
import '../cc-badge/cc-badge.js';
import './cc-plan-item.js';

export default {
  tags: ['autodocs'],
  title: '🛠 Creation Tunnel/<cc-plan-item>',
  component: 'cc-plan-item',
};

/**
 * @typedef {import('../cc-plan-picker/cc-plan-picker.types.js').PlanItem} PlanItem
 * @typedef {import('./cc-plan-item.js').CcPlanItem} CcPlanItem
 */

const conf = {
  component: 'cc-plan-item',
};

/** @type {Partial<PlanItem>} */
const DEFAULT_ITEM = {
  name: 'Base Plan',
  details: [
    {
      icon: iconMem,
      value: '512 MB memory',
    },
    {
      icon: iconCpu,
      value: '1 vCPUs',
    },
  ],
};

export const defaultStory = makeStory(conf, {
  /** @type {Array<Partial<CcPlanItem>>} */
  items: [DEFAULT_ITEM],
});

export const withBadge = makeStory(conf, {
  /** @type {Array<Partial<CcPlanItem>>} */
  items: [
    { ...DEFAULT_ITEM, badge: { content: 'Hello' } },
    { ...DEFAULT_ITEM, selected: true, badge: { content: 'There!' } },
    { ...DEFAULT_ITEM, disabled: true, badge: { content: 'General Kenobi' } },
  ],
});

export const selected = makeStory(conf, {
  /** @type {Array<Partial<CcPlanItem>>} */
  items: [{ ...DEFAULT_ITEM, selected: true }],
});

export const disabled = makeStory(conf, {
  /** @type {Array<Partial<CcPlanItem>>} */
  items: [{ ...DEFAULT_ITEM, disabled: true }],
});

export const simpleDatabase = makeStory(conf, {
  /** @type {Array<Partial<CcPlanItem>>} */
  items: [
    {
      id: 'sample',
      name: 'Sample Plan',
      details: [
        {
          icon: iconDisk,
          value: '256MB disk size',
        },
        {
          icon: iconCpu,
          value: '1 vCPUs',
        },
        {
          icon: iconConnectionLimit,
          value: '100 connections',
        },
        {
          icon: iconDatabase,
          value: '1 database',
        },
      ],
    },
  ],
});

export const thirdParty = makeStory(conf, {
  /** @type {Array<Partial<CcPlanItem>>} */
  items: [
    {
      id: 'third_party',
      name: 'Third party',
      details: [],
    },
  ],
});
