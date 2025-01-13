import { PlanBadge, PlanDetails } from '../cc-plan-item/cc-plan-item.types.js';

export interface PlanItem {
  id: string;
  badge?: PlanBadge;
  name: string;
  details?: PlanDetails[];
  disabled?: boolean;
  selected?: boolean;
  relatedPlans?: Array<Omit<PlanItem, 'relatedPlans'>>;
}
