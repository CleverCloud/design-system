import { css } from 'lit';
import { randomString } from '../../lib/utils.js';
import { makeStory } from '../../stories/lib/make-story.js';
import './cc-kv-explorer.js';

/** @type {Array<CcKvKeyType>} */
const KEY_TYPES = ['string', 'hash', 'list', 'set'];

/**
 * @param {number} count
 * @return {Array<CcKvKeyState>}
 */
function generateKeyStates(count) {
  return new Array(count).fill(0).map((_, i) => ({
    type: 'idle',
    key: { name: `key-${i + 1}`, type: KEY_TYPES[i % KEY_TYPES.length] },
  }));
}

const keyStates = generateKeyStates(50);

export default {
  tags: ['autodocs'],
  title: '🚧 Beta/🛠 Kv Explorer/<cc-kv-explorer-beta>',
  component: 'cc-kv-explorer-beta',
};

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyState} CcKvKeyState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyType} CcKvKeyType
 */

const conf = {
  component: 'cc-kv-explorer-beta',
  beta: true,
  css: css`
    cc-kv-explorer-beta {
      height: 600px;
    }
  `,
};

export const defaultStory = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates,
        total: 100,
      },
    },
  ],
});

export const loading = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [{ state: { type: 'loading' } }],
});

export const error = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [{ state: { type: 'error' } }],
});

export const emptyWhenDbIsEmpty = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [{ state: { type: 'loaded', keys: [], total: 0 } }],
});

export const emptyWhenNoResults = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [{ state: { type: 'loaded', keys: [], total: 10 } }],
});

export const loadingKeys = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loading-keys',
        keys: [],
        total: 100,
      },
    },
  ],
});

export const loadingMoreKeys = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loading-keys',
        keys: generateKeyStates(5),
        total: 100,
      },
    },
  ],
});

export const filteringKeys = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'filtering',
        keys: [],
        total: 100,
      },
    },
  ],
});

export const refreshingKeys = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'refreshing',
        keys: [],
        total: 100,
      },
    },
  ],
});

export const loadingKeyString = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === `key-${KEY_TYPES.indexOf('string') + 1}` ? { ...keyState, type: 'selected' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-string',
        key: {
          type: 'string',
          name: `key-${KEY_TYPES.indexOf('string') + 1}`,
        },
        editor: { type: 'loading' },
      },
    },
  ],
});

export const loadingKeyHash = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === `key-${KEY_TYPES.indexOf('hash') + 1}` ? { ...keyState, type: 'selected' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-hash',
        key: {
          type: 'hash',
          name: `key-${KEY_TYPES.indexOf('hash') + 1}`,
        },
        editor: { type: 'loading' },
      },
    },
  ],
});

export const loadingKeyList = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === `key-${KEY_TYPES.indexOf('list') + 1}` ? { ...keyState, type: 'selected' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-list',
        key: {
          type: 'list',
          name: `key-${KEY_TYPES.indexOf('list') + 1}`,
        },
        editor: { type: 'loading' },
      },
    },
  ],
});

export const loadingKeySet = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === `key-${KEY_TYPES.indexOf('set') + 1}` ? { ...keyState, type: 'selected' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-set',
        key: {
          type: 'set',
          name: `key-${KEY_TYPES.indexOf('set') + 1}`,
        },
        editor: { type: 'loading' },
      },
    },
  ],
});

export const loadedKeyString = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === `key-${KEY_TYPES.indexOf('string') + 1}` ? { ...keyState, type: 'selected' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-string',
        key: {
          type: 'string',
          name: `key-${KEY_TYPES.indexOf('string') + 1}`,
        },
        editor: {
          type: 'idle',
          value: `value of key-${KEY_TYPES.indexOf('string') + 1}`,
        },
      },
    },
  ],
});

export const loadedKeyHash = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === `key-${KEY_TYPES.indexOf('hash') + 1}` ? { ...keyState, type: 'selected' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-hash',
        key: {
          type: 'hash',
          name: `key-${KEY_TYPES.indexOf('hash') + 1}`,
        },
        editor: {
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
    },
  ],
});

export const loadedKeyList = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === `key-${KEY_TYPES.indexOf('list') + 1}` ? { ...keyState, type: 'selected' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-list',
        key: {
          type: 'list',
          name: `key-${KEY_TYPES.indexOf('list') + 1}`,
        },
        editor: {
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
    },
  ],
});

export const loadedKeySet = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === `key-${KEY_TYPES.indexOf('set') + 1}` ? { ...keyState, type: 'selected' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-set',
        key: {
          type: 'set',
          name: `key-${KEY_TYPES.indexOf('set') + 1}`,
        },
        editor: {
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
    },
  ],
});

export const deletingKey = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === 'key-1' ? { ...keyState, type: 'deleting' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-string',
        key: {
          type: 'string',
          name: 'key-1',
        },
        editor: {
          type: 'idle',
          value: 'value of key-1',
        },
      },
    },
  ],
});

export const deletingMultipleKeys = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates.map((keyState) =>
          keyState.key.name === 'key-1' || keyState.key.name === 'key-2' ? { ...keyState, type: 'deleting' } : keyState,
        ),
        total: 100,
      },
      detailState: {
        type: 'edit-string',
        key: {
          type: 'string',
          name: 'key-1',
        },
        editor: {
          type: 'idle',
          value: 'value of key-1',
        },
      },
    },
  ],
});

export const addKey = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates,
        total: 100,
      },
      detailState: {
        type: 'add',
        formState: {
          type: 'idle',
        },
      },
    },
  ],
  onUpdateComplete:
    /** @param {CcKvExplorer} component*/
    (component) => {
      component._addFormRef.value.keyName.value = 'my new key';
      component._addFormRef.value.value.value = 'my awesome key value';
    },
});

export const addKeyWithKeyNameAlreadyUsed = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates,
        total: 100,
      },
      detailState: {
        type: 'add',
        formState: {
          type: 'idle',
          errors: {
            keyName: 'already-used',
          },
        },
      },
    },
  ],
  onUpdateComplete:
    /** @param {CcKvExplorer} component*/
    (component) => {
      component._addFormRef.value.keyName.value = 'my new key';
      component._addFormRef.value.value.value = 'my awesome key value';
    },
});

export const addingKey = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates,
        total: 100,
      },
      detailState: {
        type: 'add',
        formState: {
          type: 'adding',
        },
      },
    },
  ],
  onUpdateComplete:
    /** @param {CcKvExplorer} component*/
    (component) => {
      component._addFormRef.value.keyName.value = 'my new key';
      component._addFormRef.value.value.value = 'my awesome key value';
    },
});

export const loadedUnsupported = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: keyStates,
        total: 100,
      },
      detailState: {
        type: 'unsupported',
        key: {
          type: 'hash',
          name: 'unsupported key',
        },
      },
    },
  ],
});

const longKeysStates = keyStates.map((s) => ({ ...s, key: { ...s.key, name: `${randomString(500)}${s.key.name}` } }));
export const loadedWithLongKeys = makeStory(conf, {
  /** @type {Array<Partial<CcKvExplorer>>} */
  items: [
    {
      state: {
        type: 'loaded',
        keys: longKeysStates.map((k, i) => (i === 0 ? { ...k, type: 'selected' } : k)),
        total: 100,
      },
      detailState: {
        type: 'edit-string',
        key: {
          type: 'string',
          name: longKeysStates[0].key.name,
        },
        editor: {
          type: 'idle',
          value: `value`,
        },
      },
    },
  ],
});
