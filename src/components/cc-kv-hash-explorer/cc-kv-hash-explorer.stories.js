import { makeStory } from '../../stories/lib/make-story.js';
import './cc-kv-hash-explorer.js';

export default {
  tags: ['autodocs'],
  title: '🚧 Beta/🛠 Kv Explorer/<cc-kv-hash-explorer-beta>',
  component: 'cc-kv-hash-explorer-beta',
};

/**
 * @typedef {import('./cc-kv-hash-explorer.js').CcKvHashExplorer} CcKvHashExplorer
 * @typedef {import('../cc-input-text/cc-input-text.js').CcInputText} CcInputText
 */

const conf = {
  component: 'cc-kv-hash-explorer-beta',
  beta: true,
};

export const defaultStory = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', field: 'first field', value: 'first field value' },
          { type: 'idle', field: 'second field', value: 'second field value' },
          { type: 'idle', field: 'third field', value: 'third field value' },
          { type: 'idle', field: 'fourth field', value: 'fourth field value' },
          { type: 'idle', field: 'fifth field', value: 'fifth field value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const loading = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'loading',
      },
    },
  ],
});

export const loadingMore = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'loading-more',
        elements: [
          { type: 'idle', field: 'first field', value: 'first field value' },
          { type: 'idle', field: 'second field', value: 'second field value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const filtering = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'filtering',
        elements: [],
        addForm: { type: 'idle' },
      },
    },
  ],
  onUpdateComplete: /** @param {CcKvHashExplorer} component */ (component) => {
    /** @type {CcInputText} */
    const patternInput = component.shadowRoot.querySelector('cc-input-text[name="pattern"]');
    patternInput.value = '*abc*';
  },
});

export const disabled = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', field: 'first field', value: 'first field value' },
          { type: 'idle', field: 'second field', value: 'second field value' },
          { type: 'idle', field: 'third field', value: 'third field value' },
          { type: 'idle', field: 'fourth field', value: 'fourth field value' },
          { type: 'idle', field: 'fifth field', value: 'fifth field value' },
        ],
        addForm: { type: 'idle' },
      },
      disabled: true,
    },
  ],
});

export const empty = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
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
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', field: 'first field', value: 'first field value' },
          { type: 'idle', field: 'second field', value: 'second field value' },
          { type: 'idle', field: 'third field', value: 'third field value' },
          { type: 'idle', field: 'fourth field', value: 'fourth field value' },
          { type: 'idle', field: 'fifth field', value: 'fifth field value' },
        ],
        addForm: { type: 'adding' },
      },
    },
  ],
});

export const editing = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', field: 'first field', value: 'first field value' },
          { type: 'editing', field: 'second field', value: 'second field value' },
          { type: 'idle', field: 'third field', value: 'third field value' },
          { type: 'idle', field: 'fourth field', value: 'fourth field value' },
          { type: 'idle', field: 'fifth field', value: 'fifth field value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const updating = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', field: 'first field', value: 'first field value' },
          { type: 'updating', field: 'second field', value: 'second field value' },
          { type: 'idle', field: 'third field', value: 'third field value' },
          { type: 'idle', field: 'fourth field', value: 'fourth field value' },
          { type: 'idle', field: 'fifth field', value: 'fifth field value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});

export const deleting = makeStory(conf, {
  /** @type {Array<Partial<CcKvHashExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        elements: [
          { type: 'idle', field: 'first field', value: 'first field value' },
          { type: 'deleting', field: 'second field', value: 'second field value' },
          { type: 'idle', field: 'third field', value: 'third field value' },
          { type: 'idle', field: 'fourth field', value: 'fourth field value' },
          { type: 'idle', field: 'fifth field', value: 'fifth field value' },
        ],
        addForm: { type: 'idle' },
      },
    },
  ],
});
