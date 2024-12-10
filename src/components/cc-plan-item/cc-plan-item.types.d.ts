import { BadgeIntent } from '../cc-badge/cc-badge.types.js';

export interface PlanBadge {
  content: string;
  intent?: BadgeIntent;
}

export interface PlanDetails {
  icon: object;
  value: string;
}
