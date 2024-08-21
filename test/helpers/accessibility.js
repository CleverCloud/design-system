import {
  ignoreWindowOnError,
  isResizeObserverLoopErrorMessage,
} from '@lit-labs/virtualizer/support/resize-observer-errors.js';
import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-commands';
import { addTranslations } from '../../src/lib/i18n/i18n.js';
import * as en from '../../src/translations/translations.en.js';

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

/**
 * Loop through stories to run accessibility tests on their content both on desktop and mobile
 *
 * @param {Array<{ storyName: string, storyFunction: Function }>} stories the story names & functions to execute and run a11y test
 * @param {Array<string>} ignoredRules names of the rules to ignore
 */
export const testAccessibility = (stories, ignoredRules) => {
  stories.forEach(({ storyName, storyFunction }) => {
    describe(`Story: ${storyName}`, function () {
      describe(`Accessibility`, function () {
        it(`Desktop: width = ${viewports.desktop.width} height = ${viewports.desktop.height}`, async function () {
          await setViewport(viewports.desktop);
          const element = await fixture(storyFunction({}, storyConf));

          await elementUpdated(element);

          await expect(element).to.be.accessible({ ignoredRules });
        });

        it(`Mobile: width = ${viewports.mobile.width} height = ${viewports.mobile.height}`, async function () {
          await setViewport(viewports.mobile);
          const element = await fixture(storyFunction({}, storyConf));

          await elementUpdated(element);

          await expect(element).to.be.accessible({ ignoredRules });
        });
      });
    });
  });
};
