import { PlanItem } from '../cc-plan-picker/cc-plan-picker.types.js';

export interface ConfiguratorPlan extends PlanItem {
  relatedPlans?: PlanItem[];
}
