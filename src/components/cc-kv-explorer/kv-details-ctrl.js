import { KvKeyEditorHashCtrl } from './kv-key-editor-hash-ctrl.js';
import { KvKeyEditorListCtrl } from './kv-key-editor-list-ctrl.js';
import { KvKeyEditorSetCtrl } from './kv-key-editor-set-ctrl.js';
import { KvKeyEditorStringCtrl } from './kv-key-editor-string-ctrl.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerState} CcKvExplorerState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateLoaded} CcKvExplorerStateLoaded
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateAdd} CcKvExplorerDetailStateAdd
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKey} CcKvKey
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyType} CcKvKeyType
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyValue} CcKvKeyValue
 * @typedef {import('./kv-key-editor-ctrl.js').KvKeyEditorCtrl<?>} KvKeyEditorCtrl
 * @typedef {import('./kv-client.js').KvClient} KvClient
 */

/**
 * @typedef {import('./cc-kv-explorer.types.js').GenericCcKvExplorerDetailStateEdit<T, E>} GenericCcKvExplorerDetailStateEdit
 * @template {CcKvKeyType} T
 * @template E
 */

export class KvDetailsCtrl {
  /**
   * @param {{component: CcKvExplorer, update: function}} view
   * @param {KvClient} kvClient
   */
  constructor(view, kvClient) {
    this._view = view;
    this._kvClient = kvClient;

    /** @type {AbortController} */
    this.abortCtrl = null;

    /** @type {KvKeyEditorCtrl} */
    this._currentEditorCtrl = null;
  }

  /**
   * @returns {KvKeyEditorCtrl}
   */
  get editorCtrl() {
    // @ts-ignore
    return this._currentEditorCtrl;
  }

  hide() {
    this._currentEditorCtrl = null;
    this._view.update('detailState', { type: 'hidden' });
  }

  /**
   * @returns {string|null}
   */
  get keyName() {
    return this._currentEditorCtrl?.keyName;
  }

  /**
   * @param {CcKvKey} key
   */
  async load(key) {
    this.abortCtrl?.abort();
    this.abortCtrl = new AbortController();

    this._currentEditorCtrl = this._createKeyEditorCtrl(key.name, key.type);

    try {
      await this._currentEditorCtrl.load(this.abortCtrl.signal);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) {
        throw e;
      }
    }
  }

  /**
   * @param {CcKvKeyValue} keyValue
   * @returns {Promise<void>}
   */
  async add(keyValue) {
    this._currentEditorCtrl = this._createKeyEditorCtrl(keyValue.name, keyValue.type);

    this._view.update(
      'detailState',
      /** @param {CcKvExplorerDetailStateAdd} state */
      (state) => {
        state.formState.type = 'adding';
      },
    );

    try {
      await this._currentEditorCtrl.create(keyValue);
    } catch (e) {
      const errorCode = getErrorCode(e);
      if (errorCode === 'clever.redis-http.key-already-exists') {
        this._view.update('detailState', {
          type: 'add',
          formState: { type: 'idle', errors: { keyName: 'already-used' } },
        });
      } else {
        this._view.update('detailState', {
          type: 'add',
          formState: { type: 'idle' },
        });

        throw e;
      }
    }
  }

  /**
   * @param {string} keyName
   * @param {CcKvKeyType} type
   */
  _createKeyEditorCtrl(keyName, type) {
    switch (type) {
      case 'string':
        return new KvKeyEditorStringCtrl(keyName, this._view, this._kvClient);
      case 'hash':
        return new KvKeyEditorHashCtrl(keyName, this._view, this._kvClient);
      case 'list':
        return new KvKeyEditorListCtrl(keyName, this._view, this._kvClient);
      case 'set':
        return new KvKeyEditorSetCtrl(keyName, this._view, this._kvClient);
    }
  }
}

/**
 * @param {{responseBody?: { code?: string}}} e
 * @return {string | null} e
 */
function getErrorCode(e) {
  return e?.responseBody?.code;
}
