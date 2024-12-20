import { KvKeyEditorCtrl } from './kv-key-editor-ctrl.js';
import { KvScanner } from './kv-scanner.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateEditList} CcKvExplorerDetailStateEditList
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyValueList} CcKvKeyValueList
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListElementState} CcKvListElementState
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListExplorerState} CcKvListExplorerState
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListExplorerStateLoading} CcKvListExplorerStateLoading
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListExplorerAddFormState} CcKvListExplorerAddFormState
 * @typedef {import('./kv-client.js').KvClient} KvClient
 */

/**
 * @extends {KvKeyEditorCtrl<CcKvExplorerDetailStateEditList>}
 */
export class KvKeyEditorListCtrl extends KvKeyEditorCtrl {
  /**
   * @param {string} keyName
   * @param {{component: CcKvExplorer, update: function}} view
   * @param {KvClient} kvClient
   */
  constructor(keyName, view, kvClient) {
    super(keyName, view, kvClient);
    this._scanner = new KvListElementsScanner(keyName, kvClient);
  }

  /**
   * @return {'list'}
   */
  getType() {
    return 'list';
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
   * @param {CcKvKeyValueList} keyValue
   */
  async create(keyValue) {
    await this._kvClient.createListKey(keyValue.name, keyValue.elements);

    this._scanner.update(keyValue.elements.map((value, index) => ({ index, value, type: 'idle' })));
    this._updateEditorState({
      type: 'loaded',
      elements: this._scanner.elements,
      addForm: { type: 'idle' },
    });
  }

  /**
   * @param {number} index
   */
  async filter(index) {
    this._updateEditorState((editor) => (editor.type = 'filtering'));

    try {
      this._scanner.setFilter({ index });
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
   * @param {number} index
   * @param {string} value
   */
  async updateElement(index, value) {
    this._updateEditorElementState(index, 'updating');

    try {
      await this._kvClient.updateListElement(this.keyName, index, value);
      this._scanner.update([{ type: 'idle', index, value }]);
      this._updateEditor((editor) => {
        editor.elements = this._scanner.elements;
      });
    } catch (e) {
      this._updateEditorElementState(index, 'editing');
      throw e;
    }
  }

  /**
   * @param {'head'|'tail'} position
   * @param {string} value
   * @return {Promise<number>}
   */
  async addElement(position, value) {
    this._updateAddForm({ type: 'adding' });

    try {
      const result = await this._kvClient.pushListElement(this.keyName, position, value);

      this._view.component.resetEditorForm();

      // re-fetch all elements
      this._scanner.reset();
      await this.load();

      return result.index;
    } catch (e) {
      this._updateAddForm({ type: 'idle' });
      throw e;
    }
  }

  /**
   * @param {number} index
   * @param {CcKvListElementState['type']} stateType
   */
  _updateEditorElementState(index, stateType) {
    const toUpdate = this._scanner.getElement(String(index));
    if (toUpdate != null) {
      this._scanner.update([{ ...toUpdate, type: stateType }]);
    }

    this._updateEditor((editor) => {
      editor.elements = this._scanner.elements;
    });
  }

  /**
   * @param {CcKvListExplorerAddFormState} addFormState
   */
  _updateAddForm(addFormState) {
    this._updateEditor((editorState) => {
      editorState.addForm = addFormState;
    });
  }

  /**
   * @param {(editorState: Exclude<CcKvListExplorerState, CcKvListExplorerStateLoading>) => void} updater
   */
  _updateEditor(updater) {
    this._updateEditorState(updater);
  }
}

/**
 * @extends {KvScanner<CcKvListElementState, {index?: number}>}
 */
export class KvListElementsScanner extends KvScanner {
  /**
   * @param {string} keyName
   * @param {KvClient} kvClient
   */
  constructor(keyName, kvClient) {
    super();
    this._kvClient = kvClient;
    this._keyName = keyName;
  }

  /**
   * @param {CcKvListElementState} item
   * @returns {string}
   */
  getId(item) {
    return String(item.index);
  }

  /**
   * @param {CcKvListElementState} item
   * @returns {boolean}
   */
  matchFilter(item) {
    return this._filter?.index == null || item.index === this._filter.index;
  }

  /**
   * @param {number} cursor
   * @param {number} count
   * @param {{index?: number}} filter
   * @param {AbortSignal} [signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<CcKvListElementState>}>}
   */
  async fetch(cursor, count, filter, signal) {
    // no filtering
    if (filter?.index == null) {
      const r = await this._kvClient.scanList(this._keyName, signal, { cursor, count, match: null });
      return {
        cursor: r.cursor,
        total: r.total,
        elements: r.elements.map((e) => ({ ...e, type: 'idle' })),
      };
    }

    // bad filter
    if (isNaN(filter.index)) {
      return emptyScanResult();
    }

    // filtering by index is like getting item at the given index
    try {
      const element = await this._kvClient.getListElementAt(this._keyName, filter.index);

      if (element.value == null) {
        return emptyScanResult();
      }

      return {
        cursor: 0,
        total: 0,
        elements: [{ type: 'idle', index: element.index, value: element.value }],
      };
    } catch (e) {
      const err = /** @type {any} */ (e);
      if (err?.responseBody?.code === 'clever.redis-http.list-element-not-found') {
        return emptyScanResult();
      }
      throw e;
    }
  }
}

/**
 * @returns {{cursor: number, total: number, elements: Array<CcKvListElementState>}}
 */
function emptyScanResult() {
  return {
    cursor: 0,
    total: 0,
    elements: [],
  };
}
