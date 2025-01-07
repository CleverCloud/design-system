import { BadgeIntent } from '../cc-badge/cc-badge.types.js';
import { IconModel } from '../common.types.js';

export interface PlanBadge {
  content: string;
  intent?: BadgeIntent;
}

export interface PlanDetails {
  icon: IconModel;
  value: string;
}
