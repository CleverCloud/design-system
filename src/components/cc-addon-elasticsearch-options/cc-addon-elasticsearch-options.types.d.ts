import { ElasticAddonOption, EncryptionAddonOption, Flavor, FlavorWithMonthlyCost } from '../common.types.js';

export type AddonElasticsearchOptionsState =
  | AddonElasticsearchOptionsStateLoaded
  | AddonElasticsearchOptionsStateLoadedWithoutMonthlyCost
  | AddonElasticsearchOptionsStateLoading;

type ElasticAddonOptionWithPaidFlavor = ElasticAddonOption<FlavorWithMonthlyCost>;
type ElasticAddonOptionWithFreeFlavor = ElasticAddonOption<Flavor>;
type ElasticAddonOptionWithoutFlavor = ElasticAddonOption<null>;

export interface AddonElasticsearchOptionsStateLoaded {
  type: 'loaded';
  hasMonthlyCost: true; // enables the display of monthly cost for APM and Kibana options
  options: Array<ElasticAddonOptionWithPaidFlavor | EncryptionAddonOption>; // since monthly cost is enabled, flavors in options need to have a `monthlyCost` object
}

export interface AddonElasticsearchOptionsStateLoadedWithoutMonthlyCost {
  type: 'loaded';
  hasMonthlyCost: false; // disables the display of monthly cost for APM and Kibana options
  options: Array<ElasticAddonOptionWithFreeFlavor | EncryptionAddonOption>; // since monthly cost is disabled, flavors in options should not contain any `monthlyCost` object
}

export interface AddonElasticsearchOptionsStateLoading {
  type: 'loading';
  hasMonthlyCost: boolean; // since we rely on skeletons during loading phase, setting this to `true` shows a skeleton for the instance cost data
  options: Array<EncryptionAddonOption | ElasticAddonOptionWithoutFlavor>; // since instance data and its cost are loading, options should not contain any `flavor` object
}
