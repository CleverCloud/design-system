import json from '@rollup/plugin-json';
import { rollupAdapter } from '@web/dev-server-rollup';
import { defaultReporter, summaryReporter } from '@web/test-runner';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';
import { Buffer } from 'buffer';
import { CellarClient } from './tasks/cellar-client.js';
import { cemAnalyzerPlugin } from './wds/cem-analyzer-plugin.js';
import { testStoryPlugin } from './wds/test-story-plugin.js';
import { commonjsPluginWithConfig, esbuildBundlePluginWithConfig } from './wds/wds-common.js';

// sets the language used by the headless browser
// normally we'd set it through the `chromeLauncher` options but it makes the debug mode crash
process.env.LANGUAGE = 'en';

const cellar = new CellarClient({
  bucket: 'clever-test-flo-visual-regressions',
  accessKeyId: process.env.VISUAL_REGRESSIONS_CELLAR_KEY_ID,
  secretAccessKey: process.env.VISUAL_REGRESSIONS_CELLAR_SECRET_KEY,
});

export default {
  files: ['test/**/*.test.*', 'src/components/**/*.test.*', 'src/components/**/*.stories.js'],
  filterBrowserLogs: ({ args }) => {
    const logsToExclude = [
      'Lit is in dev mode. Not recommended for production! See https://lit.dev/msg/dev-mode for more information.',
      'Multiple versions of Lit loaded. Loading multiple versions is not recommended. See https://lit.dev/msg/multiple-versions for more information.',
    ];
    const logMessage = args[0];

    return logMessage != null && !logsToExclude.includes(logMessage);
  },
  browsers: [
    playwrightLauncher({
      // Fixes random timeouts with Chrome > 127, see https://github.com/CleverCloud/clever-components/issues/1146 for more info
      // concurrency: 1,
      // async createPage({ context }) {
      //   const page = await context.newPage();
      //   // We need that for unit tests working with dates and timezones
      //   await page.emulateTimezone('Europe/Paris');
      //   return page;
      // },
      product: 'chromium',
      createBrowserContext({ browser }) {
        return browser.newContext({ timezoneId: 'Europe/Paris' });
      },
    }),
    playwrightLauncher({
      // Fixes random timeouts with Chrome > 127, see https://github.com/CleverCloud/clever-components/issues/1146 for more info
      // concurrency: 1,
      // async createPage({ context }) {
      //   const page = await context.newPage();
      //   // We need that for unit tests working with dates and timezones
      //   await page.emulateTimezone('Europe/Paris');
      //   return page;
      // },
      product: 'firefox',
      createBrowserContext({ browser }) {
        return browser.newContext({ timezoneId: 'Europe/Paris' });
      },
    }),
  ],
  nodeResolve: true,
  mimeTypes: {
    '**/*.json': 'js',
  },
  reporters: [
    // mocha like report
    process.env.CI !== 'true' ? summaryReporter({ flatten: false }) : [],
    // report global tests progress
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
  ],
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '10000',
    },
  },
  testRunnerHtml: (testFramework) => `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="src/styles/default-theme.css" >
        <script type="module" src="${testFramework}"></script>
      </head>
    </html>
  `,
  plugins: [
    cemAnalyzerPlugin,
    rollupAdapter(json()),
    esbuildBundlePluginWithConfig,
    commonjsPluginWithConfig,
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'), // should we force to target some component or all? need to test what happens when you update baseline and it's already ok?
      async getBaseline({ name }) {
        // search for baseline same branch
        // if we get it from baseline same branch, it means we have added new visuals
        // we can probably set some env var so that CI lists impacted components in a comment for review?
        // if not found => search for baseline master
        const fileBuffer = await cellar
          .getImage({ key: name + '.png' })
          .then((response) => {
            return new Promise((resolve, reject) => {
              const data = [];
              response.Body.on('data', (chunk) => data.push(chunk));
              response.Body.on('end', () => resolve(Buffer.concat(data)));
              response.Body.on('error', reject);
            });
          })
          .catch((err) => {
            console.log('error', name, err);
          });

        return fileBuffer;
      },
      async saveBaseline({ content, name }) {
        console.log('saving new baseline', name);
        // should save in current branch
        await cellar
          .putObject({
            key: name + '.png',
            body: content,
          })
          .catch((err) => {
            console.log('failed to save', err);
          });
      },
      async saveDiff({ content, name }) {
        // should save to cellar + locally but only if failed?
        // if name split `/` [1] === 'failed' then we should also save locally for review?
        await cellar
          .putObject({
            key: name + '.png',
            body: content,
          })
          .then((response) => {
            console.log('saved diff');
          })
          .catch((err) => {
            console.log('failed to DIFF', err);
          });
      },
      saveFailed({ filePath, content, baseDir, name }) {
        console.log('SAVING FAILED', name);
      },
    }),
    testStoryPlugin,
  ],
};
