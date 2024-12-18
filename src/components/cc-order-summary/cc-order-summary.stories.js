import { makeStory } from '../../stories/lib/make-story.js';
import './cc-order-summary.js';

export default {
  tags: ['autodocs'],
  title: '🚧 Beta/🛠 Creation Tunnel/<cc-order-summary-beta>',
  component: 'cc-order-summary-beta',
};

const conf = {
  component: 'cc-order-summary-beta',
  // language=CSS
  css: `
    cc-order-summary-beta {
      margin-inline: auto;
      padding-block: 2em;
      width: 100%;
      max-width: 25em;
    }
    cc-order-summary-beta:not(:last-of-type) {
      border-bottom: 1px dotted #EAEAEA;
    }
    cc-order-summary-beta code {
      font-size: 1.25em;
    }
    cc-order-summary-beta ul {
      margin-block: 0;
      padding-inline-start: 1.5em;
      list-style-type: circle;
    }
  `,
};

const appBaseState = {
  name: 'Front-end application',
  logoUrl: 'https://assets.clever-cloud.com/logos/nodejs.svg',
  configuration: [
    { label: 'Instance count', value: '1' },
    { label: 'Instance size', value: 'XS' },
    { label: 'Zone', value: 'Paris (par)' },
    { label: 'Estimated price for 30 days', value: '16.00€' },
  ],
  tags: ['A.I.', 'preprod'],
};
const appInnerHTML = `
  <div slot="detail">Your instance is powered by 1 vCPUs and 1024 MiB of RAM.</div>
  <div slot="detail">The tags related to your zone are <code>for:applications</code>, <code>infra:clever-cloud</code>.</div>
`;

const addonBaseState = {
  name: 'Customer orders database',
  logoUrl: 'https://assets.clever-cloud.com/logos/pgsql.svg',
  configuration: [
    { label: 'Plan', value: 'M Medium Space' },
    { label: 'Zone', value: 'Montreal (mtl)' },
    { label: 'Version', value: '15' },
    { label: 'Options', value: 'Kibana, APM, Encryption' },
    { label: 'Estimated price for 30 days', value: '98.00€' },
  ],
  tags: ['customer', 'prod'],
};
const addonInnerHTML = `
  <div slot="detail">
    <div>Your plan detailed features are:</div>
    <ul>
      <li>Backups: Daily - 7 Retained</li>
      <li>Logs: Yes</li>
      <li>Max DB size: 5 GB</li>
      <li>Memory: 1 GB</li>
      <li>Metrics: Yes</li>
      <li>Migration Tool: Yes</li>
      <li>Type: Dedicated</li>
      <li>vCPU: 1</li>
      <li>Version: 4.0.3</li>
    </ul>
  </div>
  <div slot="detail">The tags related to your zone are <code>for:applications</code>, <code>infra:ovh</code>.</div>
`;

export const defaultStory = makeStory(conf, {
  items: [
    {
      orderSummaryState: {
        ...appBaseState,
      },
      innerHTML: appInnerHTML,
    },
    {
      orderSummaryState: {
        ...addonBaseState,
      },
      innerHTML: addonInnerHTML,
    },
  ],
});

export const mockup = makeStory(conf, {
  items: [
    {
      orderSummaryState: {
        name: 'name',
        logoUrl: 'https://placehold.co/600x400?text=logo',
        configuration: [
          { label: 'item 1', value: 'value 1' },
          { label: 'item 2', value: 'value 2' },
          { label: 'item 3', value: 'value 3' },
          { label: 'item 4', value: 'value 4' },
          { label: 'item 5', value: 'value 5' },
        ],
        tags: ['tag 1', 'tag 2', 'tag 3'],
      },
      innerHTML: `
      <div slot="detail">details 1</div>
      <div slot="detail">details 2</div>
      <div slot="detail">details 3</div>
      <div slot="detail"><code>details 1 (sanitized HTML)</code></div>
      <div slot="detail"><code>details 2 (sanitized HTML)</code></div>
      <div slot="detail"><code>details 3 (sanitized HTML)</code></div>
    `,
    },
  ],
});

export const withType = makeStory(conf, {
  items: [
    {
      orderSummaryState: {
        ...appBaseState,
        configuration: [{ label: 'Type', value: 'JavaScript' }, ...appBaseState.configuration],
      },
      innerHTML: appInnerHTML,
    },
    {
      orderSummaryState: {
        ...addonBaseState,
        configuration: [{ label: 'Type', value: 'PostgreSQL' }, ...addonBaseState.configuration],
      },
      innerHTML: addonInnerHTML,
    },
  ],
});

export const missingInfos = makeStory(conf, {
  items: [
    {
      orderSummaryState: {
        ...appBaseState,
        tags: null,
      },
      innerHTML: appInnerHTML,
    },
    {
      orderSummaryState: {
        ...appBaseState,
        logoUrl: null,
      },
      innerHTML: appInnerHTML,
    },
    {
      orderSummaryState: {
        ...appBaseState,
        tags: null,
        logoUrl: null,
      },
      innerHTML: appInnerHTML,
    },
  ],
});

export const advancedApplication = makeStory(conf, {
  items: [
    {
      orderSummaryState: {
        ...appBaseState,
        configuration: [
          { label: 'Instances count', value: '1 ➤ 2' },
          { label: 'Instances size', value: 'XS ➤ S' },
          { label: 'Zone', value: 'Paris (par)' },
          { label: 'Estimated price for 30 days', value: '16.00€' },
        ],
      },
      innerHTML: `
      <div slot="detail">As dynamic configuration is activated, the theoretical maximum price could reach 32.00€.</div>
      <div slot="detail">Your XS instance is powered by 1 vCPUs and 1024 MiB of RAM.</div>
      <div slot="detail">Your S instance is powered by2 vCPUs and 2048 MiB of RAM.</div>
      <div slot="detail">The tags related to your zone are <code>for:applications</code>, <code>infra:clever-cloud</code>.</div>
    `,
    },
  ],
});

export const alternativePriceInfo = makeStory(conf, {
  items: [
    {
      orderSummaryState: {
        ...appBaseState,
        configuration: [
          { label: 'Instances count', value: '1 ➤ 2' },
          { label: 'Instances size', value: 'XS ➤ S' },
          { label: 'Zone', value: 'Paris (par)' },
          { label: 'Estimated price', value: '16.00€' },
        ],
      },
      innerHTML: `
      <div slot="detail">The estimated price is for a period of 30 days.</div>
      <div slot="detail">As dynamic configuration is activated, the theoretical maximum price could reach 32.00€.</div>
      <div slot="detail">Your XS instance is powered by 1 vCPUs and 1024 MiB of RAM.</div>
      <div slot="detail">Your S instance is powered by2 vCPUs and 2048 MiB of RAM.</div>
      <div slot="detail">The tags related to your zone are <code>for:applications</code>, <code>infra:clever-cloud</code>.</div>
    `,
    },
  ],
});
