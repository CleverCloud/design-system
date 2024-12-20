import { isStringEmpty } from '../../lib/utils.js';
import { KvKeyEditorCtrl } from './kv-key-editor-ctrl.js';
import { KvScanner } from './kv-scanner.js';
import { matchKvPattern } from './kv-utils.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateEditSet} CcKvExplorerDetailStateEditSet
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyValueSet} CcKvKeyValueSet
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetElementState} CcKvSetElementState
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetExplorerState} CcKvSetExplorerState
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetExplorerStateLoading} CcKvSetExplorerStateLoading
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetExplorerAddFormState} CcKvSetExplorerAddFormState
 * @typedef {import('./kv-client.js').KvClient} KvClient
 */

/**
 * @extends {KvKeyEditorCtrl<CcKvExplorerDetailStateEditSet>}
 */
export class KvKeyEditorSetCtrl extends KvKeyEditorCtrl {
  /**
   * @param {string} keyName
   * @param {{component: CcKvExplorer, update: function}} view
   * @param {KvClient} kvClient
   */
  constructor(keyName, view, kvClient) {
    super(keyName, view, kvClient);
    this._scanner = new KvSetElementsScanner(keyName, kvClient);
  }

  /**
   * @return {'set'}
   */
  getType() {
    return 'set';
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
   * @param {CcKvKeyValueSet} keyValue
   */
  async create(keyValue) {
    await this._kvClient.createSetKey(keyValue.name, keyValue.elements);

    this._scanner.update(keyValue.elements.map((value) => ({ value, type: 'idle' })));
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
   * @param {string} member
   */
  async deleteElement(member) {
    this._updateEditorElementState(member, 'deleting');

    try {
      await this._kvClient.deleteSetElement(this.keyName, member);
      this._scanner.delete(member);
      this._updateEditor((editor) => {
        editor.elements = this._scanner.elements;
      });
    } catch (e) {
      this._updateEditorElementState(member, 'idle');

      throw e;
    }
  }

  /**
   * @param {string} member
   * @return {Promise<boolean>}
   */
  async addElement(member) {
    this._updateAddForm({ type: 'adding' });

    try {
      const result = await this._kvClient.addSetElement(this.keyName, member);

      this._view.component.resetEditorForm();

      // re-fetch all elements if necessary
      if (result.added) {
        this._scanner.reset();
        await this.load();
      } else {
        this._updateAddForm({ type: 'idle' });
      }

      return result.added;
    } catch (e) {
      this._updateAddForm({ type: 'idle' });
      throw e;
    }
  }

  /**
   * @param {string} field
   * @param {CcKvSetElementState['type']} stateType
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
   * @param {CcKvSetExplorerAddFormState} addFormState
   */
  _updateAddForm(addFormState) {
    this._updateEditor((editorState) => {
      editorState.addForm = addFormState;
    });
  }

  /**
   * @param {(editorState: Exclude<CcKvSetExplorerState, CcKvSetExplorerStateLoading>) => void} updater
   */
  _updateEditor(updater) {
    this._updateEditorState(updater);
  }
}

/**
 * @extends {KvScanner<CcKvSetElementState, {pattern?: string}>}
 */
export class KvSetElementsScanner extends KvScanner {
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
   * @param {CcKvSetElementState} item
   * @returns {string}
   */
  getId(item) {
    return item.value;
  }

  /**
   * @param {CcKvSetElementState} item
   * @returns {boolean}
   */
  matchFilter(item) {
    return isStringEmpty(this._filter?.pattern) || matchKvPattern(this._filter.pattern, item.value);
  }

  /**
   * @param {number} count
   * @param {AbortSignal} [signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<CcKvSetElementState>}>}
   */
  async fetch(count, signal) {
    const r = await this._kvClient.scanSet(this._keyName, signal, {
      cursor: this._cursor,
      count,
      match: this._filter?.pattern,
    });
    return {
      cursor: r.cursor,
      total: r.total,
      elements: r.elements.map((e) => ({ value: e, type: 'idle' })),
    };
  }
}
