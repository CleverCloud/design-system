import {
  ignoreWindowOnError,
  isResizeObserverLoopErrorMessage,
} from '@lit-labs/virtualizer/support/resize-observer-errors.js';
import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-commands';
import { visualDiff } from '@web/test-runner-visual-regression';
import { addTranslations } from '../../src/lib/i18n/i18n.js';
import * as en from '../../src/translations/translations.en.js';
import { getStories } from './get-stories.js';

const viewports = {
  desktop: {
    width: 1200,
    height: 640,
  },
  mobile: {
    width: 360,
    height: 640,
  },
};

const storyConf = {
  globals: {
    locale: 'en',
  },
};

// Register languages
addTranslations(en.lang, en.translations);

// Ignore irrelevant errors that could make tests fails
function setupIgnoreIrrelevantErrors(before, after, messagePredicate) {
  let teardown;
  before(() => {
    teardown = ignoreWindowOnError(messagePredicate);
  });
  after(() => {
    teardown?.();
    teardown = undefined;
  });
}

setupIgnoreIrrelevantErrors(before, after, (message) => {
  return (
    isResizeObserverLoopErrorMessage(message) ||
    message.includes(
      "Uncaught IndexSizeError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source width is 0",
    )
  );
});

export async function testStories(storiesModule) {
  const componentTag = storiesModule.default.component;
  const stories = getStories(storiesModule);
  const shouldRunTests = stories.some(
    ({ storyFunction }) =>
      storyFunction.parameters.tests.accessibility || storyFunction.parameters.tests.visualRegression,
  );

  if (shouldRunTests) {
    describe(`Component: ${componentTag}`, function () {
      stories.forEach(({ storyName, storyFunction }) => {
        describe(`Story: ${storyName}`, function () {
          describe(`Desktop: width = ${viewports.desktop.width} height = ${viewports.desktop.height}`, async function () {
            if (storyFunction.parameters.tests.accessibility) {
              it('should be accessible', async function () {
                await setViewport(viewports.desktop);
                const element = await fixture(storyFunction({}, storyConf));

                await elementUpdated(element);

                await expect(element).to.be.accessible();
              });
            }

            if (storyFunction.parameters.tests.visualRegression) {
              it('should have no visual regression', async function () {
                await setViewport(viewports.desktop);
                const element = await fixture(storyFunction({}, storyConf));

                await elementUpdated(element);

                await visualDiff(element, `${componentTag}-${storyName}-desktop`);
              });
            }
          });

          describe(`Mobile: width = ${viewports.mobile.width} height = ${viewports.mobile.height}`, async function () {
            if (storyFunction.parameters.tests.accessibility) {
              it('should be accessible', async function () {
                await setViewport(viewports.mobile);
                const element = await fixture(storyFunction({}, storyConf));

                await elementUpdated(element);

                await expect(element).to.be.accessible();
              });
            }

            if (storyFunction.parameters.tests.visualRegression) {
              it('should have no visual regression', async function () {
                await setViewport(viewports.desktop);
                const element = await fixture(storyFunction({}, storyConf));

                await elementUpdated(element);

                await visualDiff(element, `${componentTag}-${storyName}-mobile`);
              });
            }
          });
        });
      });
    });
  }
}
