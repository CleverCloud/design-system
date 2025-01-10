import { makeStory } from '../../stories/lib/make-story.js';
import './cc-kv-list-explorer.js';

export default {
  tags: ['autodocs'],
  title: '🚧 Beta/🛠 Kv Explorer/<cc-kv-list-explorer-beta>',
  component: 'cc-kv-list-explorer-beta',
};

/**
 * @typedef {import('./cc-kv-list-explorer.js').CcKvListExplorer} CcKvListExplorer
 * @typedef {import('../cc-input-text/cc-input-text.js').CcInputText} CcInputText
 */

const conf = {
  component: 'cc-kv-list-explorer-beta',
  beta: true,
};

export const defaultStory = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', index: 1, value: 'first value' },
          { type: 'idle', index: 2, value: 'second value' },
          { type: 'idle', index: 3, value: 'third value' },
          { type: 'idle', index: 4, value: 'fourth value' },
          { type: 'idle', index: 5, value: 'fifth value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const loading = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'loading',
      },
    },
  ],
});

export const loadingMore = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'loading-more',
        elements: [
          { type: 'idle', index: 1, value: 'first value' },
          { type: 'idle', index: 2, value: 'second value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const filtering = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'filtering',
        elements: [],
        addForm: { type: 'idle' },
      },
    },
  ],
  onUpdateComplete: /** @param {CcKvListExplorer} component */ (component) => {
    /** @type {CcInputText} */
    const patternInput = component.shadowRoot.querySelector('cc-input-text[name="pattern"]');
    patternInput.value = '5';
  },
});

export const disabled = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', index: 1, value: 'first value' },
          { type: 'idle', index: 2, value: 'second value' },
          { type: 'idle', index: 3, value: 'third value' },
          { type: 'idle', index: 4, value: 'fourth value' },
          { type: 'idle', index: 5, value: 'fifth value' },
        ],
        addForm: { type: 'idle' },
      },
      disabled: true,
    },
  ],
});

export const empty = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const adding = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', index: 1, value: 'first value' },
          { type: 'idle', index: 2, value: 'second value' },
          { type: 'idle', index: 3, value: 'third value' },
          { type: 'idle', index: 4, value: 'fourth value' },
          { type: 'idle', index: 5, value: 'fifth value' },
        ],
        addForm: { type: 'adding' },
      },
    },
  ],
});

export const editing = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', index: 1, value: 'first value' },
          { type: 'editing', index: 2, value: 'second value' },
          { type: 'idle', index: 3, value: 'third value' },
          { type: 'idle', index: 4, value: 'fourth value' },
          { type: 'idle', index: 5, value: 'fifth value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const updating = makeStory(conf, {
  /** @type {Array<Partial<CcKvListExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', index: 1, value: 'first value' },
          { type: 'updating', index: 2, value: 'second value' },
          { type: 'idle', index: 3, value: 'third value' },
          { type: 'idle', index: 4, value: 'fourth value' },
          { type: 'idle', index: 5, value: 'fifth value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});
