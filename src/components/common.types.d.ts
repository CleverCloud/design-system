import { TemplateResult } from 'lit';

export interface App {
  name: string; // Name of the application
  commit?: string; // Head commit on remote repo if app is not brand new (full SHA-1)
  variantName: string; // Human name of the variant (PHP, Ruby, Python...)
  variantLogo: string; // HTTPS URL to the logo of the variant
  lastDeploymentLogsUrl?: string; // URL to the logs for the last deployment if app is not brand new
}

export interface Addon {
  id: string;
  realId: string;
  name: string;
  provider: AddonProvider;
  plan: AddonPlan;
  creationDate: number | string;
}

interface AddonPlan {
  name: string;
}

export interface Scalability {
  minFlavor: Flavor;
  maxFlavor: Flavor;
  minInstances: number;
  maxInstances: number;
}

export interface Flavor {
  name: string;
  cpus: number;
  gpus: number;
  mem: number;
  microservice: boolean;
}

export type AddonOption = EncryptionAddonOption | ElasticAddonOption<Flavor | FlavorWithMonthlyCost | null>;

export type AddonOptionWithMetadata = {
  icon?: IconModel;
  title?: string | Node;
  logo?: string;
  description: string | Node | TemplateResult<1>;
} & Pick<AddonOption, 'name' | 'enabled'>;

export interface EncryptionAddonOption {
  name: 'encryption';
  enabled: boolean;
}

export interface ElasticAddonOption<FlavorType> {
  name: 'kibana' | 'apm';
  enabled: boolean;
  flavor?: FlavorType;
}

export interface FlavorWithMonthlyCost extends Flavor {
  monthlyCost: {
    amount: number;
    currency: string;
  };
}

export type AddonOptionStates = { [optionName: string]: boolean };

export interface IconModel {
  content: string;
}

interface InvoiceAmount {
  amount: number;
  currency: string; // ISO 4217 currency code
}

export interface Invoice {
  downloadUrl: string;
  emissionDate: string;
  invoiceHtml?: string;
  number: string;
  paymentUrl: string;
  status: InvoiceStatusType;
  total: InvoiceAmount;
  type: InvoiceType;
}

export type InvoiceStatusType = 'PENDING' | 'PROCESSING' | 'PAID' | 'PAYMENTHELD' | 'CANCELED' | 'REFUNDED' | 'WONTPAY';

export type InvoiceType = 'INVOICE' | 'CREDITNOTE';

interface HeatmapPoint {
  lat: number; // Latitude
  lon: number; // Longitude
  count: number; // Number of occurences for this location
}

type MapModeType = 'points' | 'heatmap';

interface Point {
  lat: number; // Latitude
  lon: number; // Longitude
  count?: number; // Number of occurences for this location (default: 1)
  delay?: number; // How long the point needs to stay (in ms), 'none' for a fixed point, (default: 1000)
  tooltip?: string | { tag: string; string: any }; // Tooltip when the point is hovered
  marker?: Marker;
  zIndexOffset?: number;
}

interface Marker {
  tag: string; // The HTML tag name used for the marker
  // Additional specific properties for the marker custom element.
}

interface Plan {
  productName?: string;
  name: string;
  price: number; // price in euros for 1 hour
  priceId?: string;
  features: FormattedFeature[];
  quantity?: number;
}

interface ConsumptionPlan {
  productName: string;
  name: string;
  price: number;
  sections: Array<PricingSection>;
  quantity?: number;
}

export interface FormattedFeature {
  // `string & {}` means any string other than the ones listed before. Without this, you get no autocomplete because string and 'toto' overlap.
  code:
    | 'connection-limit'
    | 'cpu'
    | 'gpu'
    | 'is-migratable'
    | 'databases'
    | 'dedicated'
    | 'disk-size'
    | 'has-logs'
    | 'has-metrics'
    | 'max-db-size'
    | 'memory'
    | 'version'
    | (string & {});
  // `string & {}` means any string other than the ones listed before. Without this, you get no autocomplete because string and 'toto' overlap.
  type: 'boolean' | 'shared' | 'boolean-shared' | 'bytes' | 'number' | 'runtime' | 'number-cpu-runtime' | 'string';
  value?: number | string | { cpu: number; shared: boolean; nice: number };
  name?: string;
}

export interface PricingSection {
  type: SectionType;
  service:
    | 'cellar.storage'
    | 'cellar.outbound'
    | 'fsbucket.storage'
    | 'pulsar_storage_size'
    | 'pulsar_throughput_in'
    | 'pulsar_throughput_out'
    | 'heptapod.storage'
    | 'heptapod.private_active_users'
    | 'heptapod.public_active_users';
  progressive?: boolean; // defaults to false
  secability?: number; // defaults to 1
  intervals: PricingInterval[];
  quantity?: number;
}

export interface PricingInterval {
  minRange: number; // byte
  maxRange?: number; // byte
  price: number; // "euros / byte / 30 days" or just "euros / byte" for timeless sections like traffic
}

type SectionType = 'inbound-traffic' | 'outbound-traffic' | 'storage' | 'private-users' | 'public-users';

type ActionType = 'add' | 'none';

interface Temporality {
  type: 'second' | 'minute' | 'hour' | 'day' | '30-days' | '1000-minutes';
  digits?: number; // how many fraction digits to display the price
}

interface RedirectionNamespace {
  namespace: string;
}

interface Redirection {
  namespace: string;
  sourcePort: number;
}

interface Zone {
  name: string;
  countryCode: string; // ISO 3166-1 alpha-2 code of the country (2 letters): "FR", "CA", "US"...
  city: string; // Name of the city in english: "Paris", "Montreal", "New York City"...
  country: string; // Name of the country in english: "France", "Canada", "United States"...
  displayName?: string; // Optional display name for private zones (instead of displaying city + country): "ACME (dedicated)"...
  tags: string[]; // Array of strings for semantic tags: ["region:eu", "infra:clever-cloud"], ["scope:private"]...
  lat: number; // Latitude
  lon: number; // Longitude
}

type AppStatus =
  | 'restart-failed'
  | 'restarting'
  | 'restarting-with-downtime'
  | 'running'
  | 'start-failed'
  | 'starting'
  | 'stopped'
  | 'unknown';

/* region env-var */

export interface EnvVar {
  name: string;
  value: string;
  isNew?: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
}

export interface EnvVarParseError {
  line?: number | '?';
  msg: string | Node;
  isWarning: Boolean;
}

export interface EnvVarRawError {
  type: string;
  name: string;
  pos: {
    line: number;
    column: number;
  };
}

export type EnvVarValidationMode = 'simple' | 'strict';

export type EnvVarEditorState = EnvVarEditorStateLoading | EnvVarEditorStateLoaded;

interface EnvVarEditorStateLoading {
  type: 'loading';
}

interface EnvVarEditorStateLoaded {
  type: 'loaded';
  validationMode: EnvVarValidationMode;
  variables: Array<EnvVar>;
}

/* endregion */

export type NotificationIntent = 'info' | 'success' | 'warning' | 'danger';

export interface Notification {
  message: string | Node;
  title?: string;
  intent: NotificationIntent;
  options?: NotificationOptions;
}

export interface NotificationOptions {
  timeout?: number;
  closeable?: boolean;
}

// FIXME: this should be provided by the client
export interface Instance {
  type: string;
  version: string;
  name: string;
  variant: {
    id: string;
    slug: string;
    name: string;
    deployType: string;
    logo: string;
  };
  description: string;
  enabled: boolean;
  comingSoon: boolean;
  maxInstances: number;
  tags: Array<string>;
  deployments: Array<string>;
  flavors: Array<{
    name: string;
    mem: number;
    cpus: number;
    gpus: number;
    disk: number;
    price: number;
    available: boolean;
    microservice: boolean;
    machine_learning: boolean;
    nice: number;
    price_id: string;
    memory: {
      unit: string;
      value: number;
      formatted: string;
    };
  }>;
  defaultFlavor: {
    name: string;
    mem: number;
    cpus: number;
    gpus: number;
    disk: number;
    price: number;
    available: boolean;
    microservice: boolean;
    machine_learning: boolean;
    nice: number;
    price_id: string;
    memory: {
      unit: string;
      value: number;
      formatted: string;
    };
  };
  buildFlavor: {
    name: string;
    mem: number;
    cpus: number;
    gpus: number;
    disk: number;
    price: number;
    available: boolean;
    microservice: boolean;
    machine_learning: boolean;
    nice: number;
    price_id: string;
    memory: {
      unit: string;
      value: number;
      formatted: string;
    };
  };
}

// FIXME: this should be provided by the client
export interface PriceSystem {
  id?: string;
  owner_id?: string;
  start_date: string;
  end_date: string;
  zone_id: string;
  currency: string;
  runtime: Array<{
    runtime_policy_id: string;
    source: string;
    flavor: string;
    time_unit: string;
    price: number;
    slug_id: string;
  }>;
  countable: Array<{
    countable_policy_id: string;
    service: string;
    data_unit: string;
    data_quantity_for_price: {
      secability: string;
      quantity: number;
    };
    time_interval_for_price: {
      secability: string;
      interval: string;
    };
    first_x_free: number;
    price_plans: Array<{
      plan_id: string;
      max_quantity: number;
      price: number;
    }>;
  }>;
}

export type AddonProvider = Pick<RawAddonProvider, 'name' | 'logoUrl'>;

// FIXME: this should be provided by the client
export interface RawAddonProvider {
  id: string;
  name: string;
  website: string;
  supportEmail: string;
  googlePlusName: string;
  twitterName: string;
  analyticsId: string;
  shortDesc: string;
  longDesc: string;
  logoUrl: string;
  status: string;
  openInNewTab: boolean;
  canUpgrade: boolean;
  regions: Array<string>;
  plans: {
    id: string;
    name: string;
    slug: string;
    price: number;
    price_id: string;
    features: {
      name: string;
      type: 'BOOLEAN' | 'BOOLEAN_SHARED' | 'NUMBER_CPU_RUNTIME' | 'OBJECT' | 'SHARED' | 'BYTES' | 'NUMBER' | 'STRING';
      value: string;
      computable_value: string;
      name_code:
        | 'connection-limit'
        | 'cpu'
        | 'databases'
        | 'disk-size'
        | 'has-logs'
        | 'has-metrics'
        | 'max-db-size'
        | 'memory'
        | 'version'
        | string;
    }[];
    zones: Array<string>;
  }[];
  features: {
    name: string;
    type: 'BOOLEAN' | 'BOOLEAN_SHARED' | 'SHARED' | 'OBJECT' | 'BYTES' | 'NUMBER' | 'RUNTIME' | 'STRING';
    name_code:
      | 'connection-limit'
      | 'cpu'
      | 'databases'
      | 'disk-size'
      | 'has-logs'
      | 'has-metrics'
      | 'max-db-size'
      | 'memory'
      | 'version'
      | string;
  }[];
}
