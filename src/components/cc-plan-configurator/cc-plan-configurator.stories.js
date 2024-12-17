import { DEFAULT_PLANS, THIRD_PARTY } from '../../stories/fixtures/plans.js';
import { makeStory } from '../../stories/lib/make-story.js';
import '../cc-badge/cc-badge.js';
import './cc-plan-configurator.js';

export default {
  tags: ['autodocs'],
  title: '🛠 Creation Tunnel/<cc-plan-configurator>',
  component: 'cc-plan-configurator',
};

/**
 * @typedef {import('./cc-plan-configurator.types.js').ConfiguratorPlan} ConfiguratorPlan
 * @typedef {import('./cc-plan-configurator.js').CcPlanConfigurator} CcPlanConfigurator
 */

const conf = {
  component: 'cc-plan-configurator',
};

export const defaultStory = makeStory(conf, {
  /** @type {Array<Partial<CcPlanConfigurator>>}  **/
  items: [
    {
      plans: DEFAULT_PLANS,
      value: 'plan_12',
    },
  ],
});

export const readonly = makeStory(conf, {
  /** @type {Array<Partial<CcPlanConfigurator>>}  **/
  items: [
    {
      plans: DEFAULT_PLANS,
      readonly: true,
      value: 'plan_12',
    },
  ],
});

export const noCustomizationPlans = makeStory(conf, {
  /** @type {Array<Partial<CcPlanConfigurator>>}  **/
  items: [
    {
      plans: THIRD_PARTY,
      value: 'third_party_1',
    },
  ],
});
