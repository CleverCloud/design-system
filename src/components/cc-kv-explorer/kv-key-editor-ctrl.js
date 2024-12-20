/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyType} CcKvKeyType
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyValue} CcKvKeyValue
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateEdit} CcKvExplorerDetailStateEdit
 * @typedef {import('./kv-client.js').KvClient} KvClient
 */

/**
 * @typedef {import('./cc-kv-explorer.types.js').GenericCcKvExplorerDetailStateEdit<T, E>} GenericCcKvExplorerDetailStateEdit
 * @template {CcKvKeyType} T
 * @template E
 */

/**
 * @template {CcKvExplorerDetailStateEdit} D
 */
export class KvKeyEditorCtrl {
  /**
   * @param {string} keyName
   * @param {{component: CcKvExplorer, update: function}} view
   * @param {KvClient} kvClient
   */
  constructor(keyName, view, kvClient) {
    this._keyName = keyName;
    this._view = view;
    this._kvClient = kvClient;
  }

  /**
   * @returns {string}
   */
  get keyName() {
    return this._keyName;
  }

  /**
   * @return {CcKvKeyType}
   */
  getType() {
    throw new Error('Abstract method: please implement me');
  }

  async load() {
    throw new Error('Abstract method: please implement me');
  }

  /**
   * @param {CcKvKeyValue} _keyValue
   */
  async create(_keyValue) {
    throw new Error('Abstract method: please implement me');
  }

  /**
   * @param {E|((editorState:E) => void)} editorState
   * @template {D['editor']} E
   */
  _updateEditorState(editorState) {
    if (typeof editorState === 'function') {
      this._view.update(
        'detailState',
        /** @param {GenericCcKvExplorerDetailStateEdit<CcKvKeyType, E>} detailState*/ (detailState) => {
          editorState(detailState.editor);
        },
      );
    } else {
      this._view.update('detailState', {
        type: `edit-${this.getType()}`,
        key: { type: this.getType(), name: this._keyName },
        editor: editorState,
      });
    }
  }
}
