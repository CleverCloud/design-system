import { isStringEmpty } from '../../lib/utils.js';
import { KvKeyEditorCtrl } from './kv-key-editor-ctrl.js';
import { KvScanner } from './kv-scanner.js';
import { matchKvPattern } from './kv-utils.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateEditHash} CcKvExplorerDetailStateEditHash
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyValueHash} CcKvKeyValueHash
 * @typedef {import('../cc-kv-hash-explorer/cc-kv-hash-explorer.types.js').CcKvHashElementState} CcKvHashElementState
 * @typedef {import('../cc-kv-hash-explorer/cc-kv-hash-explorer.types.js').CcKvHashExplorerState} CcKvHashExplorerState
 * @typedef {import('../cc-kv-hash-explorer/cc-kv-hash-explorer.types.js').CcKvHashExplorerStateLoading} CcKvHashExplorerStateLoading
 * @typedef {import('../cc-kv-hash-explorer/cc-kv-hash-explorer.types.js').CcKvHashExplorerAddFormState} CcKvHashExplorerAddFormState
 * @typedef {import('./kv-client.js').KvClient} KvClient
 */

/**
 * @extends {KvKeyEditorCtrl<CcKvExplorerDetailStateEditHash>}
 */
export class KvKeyEditorHashCtrl extends KvKeyEditorCtrl {
  /**
   * @param {string} keyName
   * @param {{component: CcKvExplorer, update: function}} view
   * @param {KvClient} kvClient
   */
  constructor(keyName, view, kvClient) {
    super(keyName, view, kvClient);
    this._scanner = new KvHashElementsScanner(keyName, kvClient);
  }

  /**
   * @return {'hash'}
   */
  getType() {
    return 'hash';
  }

  /**
   * @param {AbortSignal} [signal]
   */
  async load(signal) {
    this._updateEditorState({ type: 'loading' });
    await this._scanner.loadMore(signal);
    this._updateEditorState({
      type: 'loaded',
      elements: this._scanner.elements,
      addForm: { type: 'idle' },
    });
  }

  /**
   * @param {CcKvKeyValueHash} keyValue
   */
  async create(keyValue) {
    await this._kvClient.createHashKey(keyValue.name, keyValue.elements);

    this._scanner.update(keyValue.elements.map((e) => ({ ...e, type: 'idle' })));
    this._updateEditorState({
      type: 'loaded',
      elements: this._scanner.elements,
      addForm: { type: 'idle' },
    });
  }

  /**
   * @param {string} pattern
   */
  async filter(pattern) {
    this._updateEditorState((editor) => (editor.type = 'filtering'));

    try {
      this._scanner.setFilter({ pattern });
      await this._scanner.loadMore();
      this._updateEditor((editor) => {
        editor.type = 'loaded';
        editor.elements = this._scanner.elements;
      });
    } catch (e) {
      this._updateEditorState((editor) => (editor.type = 'loaded'));
      throw e;
    }
  }

  async loadMore() {
    this._updateEditorState((editor) => (editor.type = 'loading-more'));

    try {
      await this._scanner.loadMore();
      this._updateEditor((editor) => {
        editor.type = 'loaded';
        editor.elements = this._scanner.elements;
      });
    } catch (e) {
      this._updateEditorState((editor) => (editor.type = 'loaded'));
      throw e;
    }
  }

  /**
   * @param {string} field
   */
  async deleteElement(field) {
    this._updateEditorElementState(field, 'deleting');

    try {
      await this._kvClient.deleteHashElement(this.keyName, field);
      this._scanner.delete(field);
      this._updateEditor((editor) => {
        editor.elements = this._scanner.elements;
      });
    } catch (e) {
      this._updateEditorElementState(field, 'idle');

      throw e;
    }
  }

  /**
   * @param {string} field
   * @param {string} value
   */
  async updateElement(field, value) {
    this._updateEditorElementState(field, 'updating');

    try {
      await this._kvClient.setHashElement(this.keyName, field, value);
      this._scanner.update([{ type: 'idle', field, value }]);
      this._updateEditor((editor) => {
        editor.elements = this._scanner.elements;
      });
    } catch (e) {
      this._updateEditorElementState(field, 'editing');
      throw e;
    }
  }

  /**
   * @param {string} field
   * @param {string} value
   * @return {Promise<boolean>}
   */
  async addElement(field, value) {
    this._updateAddForm({ type: 'adding' });

    try {
      const result = await this._kvClient.setHashElement(this.keyName, field, value);

      this._view.component.resetEditorForm();

      // re-fetch all elements
      this._scanner.reset();
      await this.load();

      return result.added;
    } catch (e) {
      this._updateAddForm({ type: 'idle' });
      throw e;
    }
  }

  /**
   * @param {string} field
   * @param {CcKvHashElementState['type']} stateType
   */
  _updateEditorElementState(field, stateType) {
    const toUpdate = this._scanner.getElement(field);
    if (toUpdate != null) {
      this._scanner.update([{ ...toUpdate, type: stateType }]);
    }

    this._updateEditor((editor) => {
      editor.elements = this._scanner.elements;
    });
  }

  /**
   * @param {CcKvHashExplorerAddFormState} addFormState
   */
  _updateAddForm(addFormState) {
    this._updateEditor((editorState) => {
      editorState.addForm = addFormState;
    });
  }

  /**
   * @param {(editorState: Exclude<CcKvHashExplorerState, CcKvHashExplorerStateLoading>) => void} updater
   */
  _updateEditor(updater) {
    this._updateEditorState(updater);
  }
}

/**
 * @extends {KvScanner<CcKvHashElementState, {pattern?: string}>}
 */
export class KvHashElementsScanner extends KvScanner {
  /**
   * @param {string} keyName
   * @param {KvClient} kvClient
   */
  constructor(keyName, kvClient) {
    super();
    this._keyName = keyName;
    this._kvClient = kvClient;
  }

  /**
   * @param {CcKvHashElementState} item
   * @returns {string}
   */
  getId(item) {
    return item.field;
  }

  /**
   * @param {CcKvHashElementState} item
   * @returns {boolean}
   */
  matchFilter(item) {
    return isStringEmpty(this._filter?.pattern) || matchKvPattern(this._filter.pattern, item.field);
  }

  /**
   * @param {number} cursor
   * @param {number} count
   * @param {{pattern?: string}} filter
   * @param {AbortSignal} [signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<CcKvHashElementState>}>}
   */
  async fetch(cursor, count, filter, signal) {
    const r = await this._kvClient.scanHash(this._keyName, signal, { cursor, count, match: filter?.pattern });
    return {
      cursor: r.cursor,
      total: r.total,
      elements: r.elements.map((e) => ({ ...e, type: 'idle' })),
    };
  }
}
