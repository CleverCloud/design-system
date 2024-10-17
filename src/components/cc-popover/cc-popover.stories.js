import {
  iconRemixArrowLeftDownLine as iconArrowLeftDown,
  iconRemixArrowLeftUpLine as iconArrowLeftUp,
  iconRemixArrowRightDownLine as iconArrowRightDown,
  iconRemixArrowRightUpLine as iconArrowRightUp,
} from '../../assets/cc-remix.icons.js';
import { makeStory } from '../../stories/lib/make-story.js';
import './cc-popover.js';

export default {
  tags: ['autodocs'],
  title: '🧬 Atoms/<cc-popover>',
  component: 'cc-popover',
};

const conf = {
  component: 'cc-popover',
  displayMode: 'flex-wrap',
  // language=CSS
  css: `
    cc-popover {
      margin: 2.5em;
    }

    cc-popover div {
      white-space: nowrap;
    }
  `,
};

const items = [
  {
    innerHTML: '<div>This is the popover content</div>',
    hideText: true,
    icon: iconArrowLeftUp,
    position: 'top-right',
    a11yName: 'Click me to toggle popover',
  },
  {
    innerHTML: '<div>This is the popover content</div>',
    hideText: true,
    icon: iconArrowRightUp,
    position: 'top-left',
    a11yName: 'Click me to toggle popover',
  },
  {
    innerHTML: '<div>This is the popover content</div>',
    hideText: true,
    icon: iconArrowLeftDown,
    position: 'bottom-right',
    a11yName: 'Click me to toggle popover',
  },
  {
    innerHTML: '<div>This is the popover content</div>',
    hideText: true,
    icon: iconArrowRightDown,
    position: 'bottom-left',
    a11yName: 'Click me to toggle popover',
  },
];

export const defaultStory = makeStory(conf, {
  items,
});

export const disabled = makeStory(conf, {
  items: items.map((item) => ({
    ...item,
    disabled: true,
  })),
});

export const withButtonText = makeStory(conf, {
  items: items.map((item) => ({
    ...item,
    hideText: false,
    icon: null,
    innerHTML: `<span slot="button-content">Click me</span>${item.innerHTML}`,
  })),
});

export const withButtonTextAndIcon = makeStory(conf, {
  items: items.map((item) => ({
    ...item,
    hideText: false,
    innerHTML: `<span slot="button-content">Click me</span>${item.innerHTML}`,
  })),
});

export const withFocusableContent = makeStory(conf, {
  items: items.map((item) => ({
    ...item,
    innerHTML: '<div>This is the popover content with <cc-button>Button</cc-button></div>',
  })),
});
