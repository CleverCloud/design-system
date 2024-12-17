import { KvScanner } from './kv-scanner.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateEditList} CcKvExplorerDetailStateEditList
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKey} CcKvKey
 * @typedef {import('./kv-client.js').KvClient} KvClient
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListExplorerStateLoaded} CcKvListExplorerStateLoaded
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListElementState} CcKvListElementState
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListExplorerState} CcKvListExplorerState
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListExplorerAddFormState} CcKvListExplorerAddFormState
 */

/**
 * Controller for `list` data type
 */
export class KvListKeyController {
  /**
   * @param {CcKvExplorer} component
   * @param {function} updateComponent
   * @param {KvListElementsScanner} scanner
   */
  constructor(component, updateComponent, scanner) {
    this.component = component;
    this.updateComponent = updateComponent;
    this.scanner = scanner;
  }

  /**
   * @param {CcKvExplorerDetailStateEditList|((detailState: CcKvExplorerDetailStateEditList) => void)} updater
   */
  updateDetailState(updater) {
    this.updateComponent('detailState', updater);
  }

  /**
   * @param {CcKvListExplorerState|((editor: CcKvListExplorerState) => void)} updater
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
   * @param {Array<CcKvListElementState>} elements
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
   * @param {number} index
   * @param {CcKvListElementState['type']} stateType
   */
  updateEditorElementState(index, stateType) {
    /** @type {CcKvListElementState} */
    let toUpdate;

    this.updateEditor((e) => {
      const editor = /** @type {CcKvListExplorerStateLoaded} */ (e);
      toUpdate = editor.elements.find((e) => e.index === index);
      if (toUpdate != null) {
        toUpdate.type = stateType;
      }
    });

    if (this.component.detailState.type === 'edit-list' && this.component.detailState.editor.type !== 'loading') {
      const toUpdate = this.component.detailState.editor.elements.find((e) => e.index === index);
      if (toUpdate != null) {
        this.scanner.update([toUpdate]);
      }
    }
  }

  /**
   * @param {CcKvListExplorerAddFormState} addForm
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
      type: 'edit-list',
      key: { ...key, type: 'list' },
      editor: { type: 'loading' },
    });
  }

  /**
   * @param {CcKvKey} key
   */
  setLoaded(key) {
    this.updateDetailState({
      type: 'edit-list',
      key: { ...key, type: 'list' },
      editor: {
        type: 'loaded',
        elements: this.scanner.elements,
        addForm: { type: 'idle' },
      },
    });
  }
}

/**
 * @extends {KvScanner<CcKvListElementState, {keyName: string, index?: number}>}
 */
export class KvListElementsScanner extends KvScanner {
  /**
   * @param {KvClient} kvClient
   */
  constructor(kvClient) {
    super(
      (it) => String(it.index),
      (it) => this._filter?.index == null || it.index === this._filter.index,
      async (cursor, count, filter) => {
        // no filtering
        if (filter.index == null) {
          const r = await kvClient.scanList(this._filter.keyName, { cursor, count, match: null });
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
          const element = await kvClient.getListElementAt(this._filter.keyName, filter.index);

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
      },
    );
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
