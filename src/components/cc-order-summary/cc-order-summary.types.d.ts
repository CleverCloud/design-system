export interface OrderSummaryState {
  name: string;
  tags?: Array<string>;
  logoUrl?: string;
  configuration?: Array<ConfigurationItem>;
}

export interface ConfigurationItem {
  label: string;
  value: string;
}
