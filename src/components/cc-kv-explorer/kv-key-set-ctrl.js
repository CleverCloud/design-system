import { isStringEmpty } from '../../lib/utils.js';
import { KvScanner } from './kv-scanner.js';
import { matchKvPattern } from './kv-utils.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateEditSet} CcKvExplorerDetailStateEditSet
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKey} CcKvKey
 * @typedef {import('./kv-client.js').KvClient} KvClient
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetExplorerStateLoaded} CcKvSetExplorerStateLoaded
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetElementState} CcKvSetElementState
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetExplorerState} CcKvSetExplorerState
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetExplorerAddFormState} CcKvSetExplorerAddFormState
 */

/**
 * Controller for `set` data type
 */
export class KvSetKeyController {
  /**
   * @param {CcKvExplorer} component
   * @param {function} updateComponent
   * @param {KvSetElementsScanner} scanner
   */
  constructor(component, updateComponent, scanner) {
    this.component = component;
    this.updateComponent = updateComponent;
    this.scanner = scanner;
  }

  /**
   * @param {CcKvExplorerDetailStateEditSet|((detailState: CcKvExplorerDetailStateEditSet) => void)} updater
   */
  updateDetailState(updater) {
    this.updateComponent('detailState', updater);
  }

  /**
   * @param {CcKvSetExplorerState|((editor: CcKvSetExplorerState) => void)} updater
   */
  updateEditor(updater) {
    this.updateDetailState((detailState) => {
      if (typeof updater === 'function') {
        updater(detailState.editor);
      } else {
        detailState.editor = updater;
      }
    });
  }

  /**
   * @param {Array<CcKvSetElementState>} elements
   */
  updateEditorElements(elements) {
    this.updateEditor((editor) => {
      if (editor.type === 'loading') {
        return;
      }
      editor.elements = elements;
    });
  }

  /**
   * @param {string} value
   * @param {CcKvSetElementState['type']} stateType
   */
  updateEditorElementState(value, stateType) {
    /** @type {CcKvSetElementState} */
    let toUpdate;

    this.updateEditor((e) => {
      const editor = /** @type {CcKvSetExplorerStateLoaded} */ (e);
      toUpdate = editor.elements.find((e) => e.value === value);
      if (toUpdate != null) {
        toUpdate.type = stateType;
      }
    });

    if (this.component.detailState.type === 'edit-set' && this.component.detailState.editor.type !== 'loading') {
      const toUpdate = this.component.detailState.editor.elements.find((e) => e.value === value);
      if (toUpdate != null) {
        this.scanner.update([toUpdate]);
      }
    }
  }

  /**
   * @param {CcKvSetExplorerAddFormState} addForm
   */
  updateAddForm(addForm) {
    this.updateEditor((editor) => {
      if (editor.type !== 'loading') {
        editor.addForm = addForm;
      }
    });
  }

  /**
   * @param {CcKvKey} key
   */
  setLoading(key) {
    this.updateDetailState({
      type: 'edit-set',
      key: { ...key, type: 'set' },
      editor: { type: 'loading' },
    });
  }

  /**
   * @param {CcKvKey} key
   */
  setLoaded(key) {
    this.updateDetailState({
      type: 'edit-set',
      key: { ...key, type: 'set' },
      editor: {
        type: 'loaded',
        elements: this.scanner.elements,
        addForm: { type: 'idle' },
      },
    });
  }
}

/**
 * @extends {KvScanner<CcKvSetElementState, {keyName: string, pattern?: string}>}
 */
export class KvSetElementsScanner extends KvScanner {
  /**
   * @param {KvClient} kvClient
   */
  constructor(kvClient) {
    super();
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
   * @param {number} cursor
   * @param {number} count
   * @param {{keyName: string, pattern?: string}} filter
   * @param {AbortSignal} [signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<CcKvSetElementState>}>}
   */
  async fetch(cursor, count, filter, signal) {
    const r = await this._kvClient.scanSet(this._filter.keyName, signal, { cursor, count, match: filter?.pattern });
    return {
      cursor: r.cursor,
      total: r.total,
      elements: r.elements.map((e) => ({ value: e, type: 'idle' })),
    };
  }
}
