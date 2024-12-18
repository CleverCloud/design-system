/**
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateEditString} CcKvExplorerDetailStateEditString
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKey} CcKvKey
 */

/**
 * Controller for `string` data type
 */
export class KvKeyStringCtrl {
  /**
   * @param {function} updateComponent
   */
  constructor(updateComponent) {
    this.updateComponent = updateComponent;
  }

  /**
   * @param {CcKvKey} key
   */
  setLoading(key) {
    this.updateComponent('detailState', { type: 'edit-string', key, editor: { type: 'loading' } });
  }

  /**
   * @param {CcKvKey} key
   * @param {string} value
   */
  setLoaded(key, value) {
    this.updateComponent('detailState', { type: 'edit-string', key, editor: { type: 'idle', value } });
  }

  /**
   * @param {string} value
   */
  setSaving(value) {
    this.updateComponent(
      'detailState',
      /** @param {CcKvExplorerDetailStateEditString} state*/
      (state) => {
        state.editor = { type: 'saving', value };
      },
    );
  }

  /**
   * @param {string} value
   */
  setIdle(value) {
    this.updateComponent(
      'detailState',
      /** @param {CcKvExplorerDetailStateEditString} state*/
      (state) => {
        state.editor = { type: 'idle', value };
      },
    );
  }
}
