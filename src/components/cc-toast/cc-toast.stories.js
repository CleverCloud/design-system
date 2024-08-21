import { sanitize } from '../../lib/i18n/i18n-sanitize.js';
import { makeStory } from '../../stories/lib/make-story.js';
import './cc-toast.js';

export default {
  tags: ['autodocs'],
  title: '🛠 Toast/<cc-toast>',
  component: 'cc-toast',
};

const conf = {
  component: 'cc-toast',
};

const intents = ['info', 'success', 'warning', 'danger'];
const getMessage = (intent) => `This is a notification message with intent ${intent}.`;
const getItems = (params) => {
  return intents.map((intent) => ({
    ...params,
    message: (params?.message ?? getMessage)(intent),
    intent,
  }));
};

export const defaultStory = makeStory(conf, {
  items: getItems(),
});

export const withHeading = makeStory(conf, {
  items: getItems({ heading: 'Notification message can be topped by a heading' }),
});

export const withHeadingOnly = makeStory(conf, {
  items: getItems({ heading: 'Notification can have only a heading', message: () => null }),
});

export const closeable = makeStory(conf, {
  items: getItems({ closeable: true }),
});

export const noTimeout = makeStory(conf, {
  items: getItems({ timeout: 0 }),
});

export const withProgressBar = makeStory(conf, {
  items: getItems({ showProgress: true }),
});

export const closeableAndWithProgressBar = makeStory(conf, {
  items: getItems({ closeable: true, showProgress: true }),
});

export const withLongHeadingAndMessage = makeStory(conf, {
  items: getItems({
    heading: 'Notification message can be topped by a bigger heading that is gonna wrap to new line',
    message: (intent) =>
      `This is a longer notification message with intent ${intent}. This message is going to wrap to new line.`,
  }),
});

export const withLongHeadingAndMessageAndWithCloseable = makeStory(conf, {
  items: getItems({
    heading: 'Notification message can be topped by a bigger heading that is gonna wrap to new line',
    message: (intent) =>
      `This is a longer notification message with intent ${intent}. This message is going to wrap to new line.`,
    closeable: true,
  }),
});

export const withSanitizedHtmlMessage = makeStory(conf, {
  items: getItems({
    heading: 'Notification message can be topped by a heading',
    message: (intent) =>
      sanitize`This is an <strong>HTML</strong> notification message with intent <code>${intent}</code>.`,
  }),
});
