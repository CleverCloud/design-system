import { makeStory } from '../../stories/lib/make-story.js';
import './cc-kv-set-explorer.js';

export default {
  tags: ['autodocs'],
  title: '🚧 Beta/🛠 Kv Explorer/<cc-kv-set-explorer-beta>',
  component: 'cc-kv-set-explorer-beta',
};

/**
 * @typedef {import('./cc-kv-set-explorer.js').CcKvSetExplorer} CcKvSetExplorer
 * @typedef {import('../cc-input-text/cc-input-text.js').CcInputText} CcInputText
 */

const conf = {
  component: 'cc-kv-set-explorer-beta',
  beta: true,
};

export const defaultStory = makeStory(conf, {
  /** @type {Array<Partial<CcKvSetExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', value: 'first value' },
          { type: 'idle', value: 'second value' },
          { type: 'idle', value: 'third value' },
          { type: 'idle', value: 'fourth value' },
          { type: 'idle', value: 'fifth value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const loading = makeStory(conf, {
  /** @type {Array<Partial<CcKvSetExplorer>>} */
  items: [
    {
      state: {
        type: 'loading',
      },
    },
  ],
});

export const loadingMore = makeStory(conf, {
  /** @type {Array<Partial<CcKvSetExplorer>>} */
  items: [
    {
      state: {
        type: 'loading-more',
        elements: [
          { type: 'idle', value: 'first value' },
          { type: 'idle', value: 'second value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const filtering = makeStory(conf, {
  /** @type {Array<Partial<CcKvSetExplorer>>} */
  items: [
    {
      state: {
        type: 'filtering',
        elements: [],
        addForm: { type: 'idle' },
      },
    },
  ],
  onUpdateComplete: /** @param {CcKvSetExplorer} component */ (component) => {
    /** @type {CcInputText} */
    const patternInput = component.shadowRoot.querySelector('cc-input-text[name="pattern"]');
    patternInput.value = '*abc*';
  },
});

export const disabled = makeStory(conf, {
  /** @type {Array<Partial<CcKvSetExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', value: 'first value' },
          { type: 'idle', value: 'second value' },
          { type: 'idle', value: 'third value' },
          { type: 'idle', value: 'fourth value' },
          { type: 'idle', value: 'fifth value' },
        ],
        addForm: { type: 'idle' },
      },
      disabled: true,
    },
  ],
});

export const empty = makeStory(conf, {
  /** @type {Array<Partial<CcKvSetExplorer>>} */
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
  /** @type {Array<Partial<CcKvSetExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', value: 'first value' },
          { type: 'idle', value: 'second value' },
          { type: 'idle', value: 'third value' },
          { type: 'idle', value: 'fourth value' },
          { type: 'idle', value: 'fifth value' },
        ],
        addForm: { type: 'adding' },
      },
    },
  ],
});

export const deleting = makeStory(conf, {
  /** @type {Array<Partial<CcKvSetExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', value: 'first value' },
          { type: 'deleting', value: 'second value' },
          { type: 'idle', value: 'third value' },
          { type: 'idle', value: 'fourth value' },
          { type: 'idle', value: 'fifth value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});
