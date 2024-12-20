import { isStringEmpty } from '../../lib/utils.js';
import { KvScanner } from './kv-scanner.js';
import { matchKvPattern } from './kv-utils.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerState} CcKvExplorerState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateLoaded} CcKvExplorerStateLoaded
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKey} CcKvKey
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyType} CcKvKeyType
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyState} CcKvKeyState
 * @typedef {import('./kv-client.js').KvClient} KvClient
 */

export class KvKeysCtrl {
  /**
   * @param {{component: CcKvExplorer, update: function}} view
   * @param {KvClient} kvClient
   */
  constructor(view, kvClient) {
    this._view = view;
    this._kvClient = kvClient;
    this._scanner = new KvKeysScanner(kvClient, () => {
      let state = this._getViewState();

      if (state.type !== 'loaded') {
        return;
      }

      this._updateViewState({
        type: state.type,
        keys: this._scanner.elements,
        total: this._scanner.total,
      });
    });

    /** @type {CcKvKey} */
    this._selectedKey = null;
  }

  /**
   * @param {CcKvKeyType|('all')} type
   * @param {string} pattern
   */
  async filter(type, pattern) {
    if (this._getViewState().type !== 'loaded') {
      return;
    }

    const filter = {
      type: type === 'all' ? null : type,
      pattern: isStringEmpty(pattern) ? null : pattern,
    };

    this._scanner.setFilter(filter);
    await this.fetchKeys({ type: 'filtering', keys: [] });
  }

  async refresh() {
    if (this._getViewState().type !== 'loaded') {
      return;
    }

    this._scanner.reset();
    await this.fetchKeys({ type: 'refreshing', keys: [] });
  }

  async loadMore() {
    if (this._getViewState().type !== 'loaded') {
      return;
    }

    await this.fetchKeys();
  }

  /**
   * @param {CcKvKey} key
   * @return {boolean}
   */
  select(key) {
    if (this._getViewState().type !== 'loaded') {
      return false;
    }

    this._updateKeyState(key.name, 'selected');

    return true;
  }

  clearSelection() {
    if (this._selectedKey != null) {
      this._updateKeyState(this._selectedKey.name, 'idle');
    }
  }

  /**
   * @param {string} keyName
   */
  async delete(keyName) {
    let state = this._getViewState();

    if (state.type !== 'loaded') {
      return;
    }

    const originalKeyState = this._scanner.getElement(keyName);

    this._updateKeyState(keyName, 'deleting');

    try {
      await this._kvClient.deleteKey(keyName);
      const deletedKeyIndex = this._scanner.delete(keyName);
      if (this._selectedKey?.name === keyName) {
        this._selectedKey = null;
      }

      await this._view.component.focusAfterDeleteKeyAt(deletedKeyIndex);
    } catch (e) {
      this._updateKeyState(keyName, originalKeyState.type);
      throw e;
    }
  }

  /**
   * @param {CcKvKey} key
   */
  add(key) {
    const state = this._getViewState();

    if (!this._isLoadedState(state)) {
      return;
    }

    this.clearSelection();

    /** @type {CcKvKeyState} */
    const keyState = { type: 'selected', key };
    this._scanner.update([keyState]);
    this._selectedKey = key;
  }

  /**
   * @param {{type?: 'loading-keys'|'filtering'|'refreshing', keys?: Array<CcKvKeyState>, total?: number}} [init]
   */
  async fetchKeys(init = {}) {
    /** @type {Array<CcKvKeyState>} */
    let keys;
    /** @type {number} */
    let total;

    const state = this._getViewState();

    if (state.type === 'loaded' || state.type === 'loading-keys') {
      keys = init.keys ?? state.keys;
      total = init.total ?? state.total;
    }

    this._updateViewState({ type: init.type ?? 'loading-keys', keys: keys ?? [], total: total ?? 0 });

    try {
      if (this._scanner.hasMore()) {
        await this._scanner.loadMore();
        keys = this._scanner.elements;
        total = this._scanner.total;

        if (this._selectedKey != null) {
          const isSelectedKeyAbsent = this._scanner.getElement(this._selectedKey.name) == null;

          if (isSelectedKeyAbsent) {
            this._selectedKey = null;
          }
        }
      }
    } finally {
      if (this._selectedKey != null) {
        const keyNameToSelect = this._selectedKey.name;
        this._selectedKey = null;
        this._updateKeyState(keyNameToSelect, 'selected');
      }

      this._updateViewState({ type: 'loaded', keys, total });
    }
  }

  /**
   * @param {string} keyName
   */
  onKeyNotFound(keyName) {
    this._updateKeyState(keyName, 'idle');
  }

  _getViewState() {
    return this._view.component.state;
  }

  /**
   * @param {T|((state: T) => void)} updater
   * @template {CcKvExplorerState} T
   */
  _updateViewState(updater) {
    this._view.update('state', updater);
  }

  /**
   * @param {string} key
   * @param {CcKvKeyState['type']} newState
   */
  _updateKeyState(key, newState) {
    const keyStateToUpdate = this._scanner.getElement(key);

    if (keyStateToUpdate != null) {
      /** @type {CcKvKeyState} */
      const updatedKeyState = { ...keyStateToUpdate, type: newState };

      const toUpdate = [updatedKeyState];

      // deselection
      if (newState !== 'selected' && key === this._selectedKey?.name) {
        this._selectedKey = null;
      }

      // new selection
      if (newState === 'selected' && this._selectedKey != null && key !== this._selectedKey.name) {
        toUpdate.push({ type: 'idle', key: this._selectedKey });
      }

      if (newState === 'selected') {
        this._selectedKey = keyStateToUpdate.key;
      }

      this._scanner.update(toUpdate);
    }
  }

  /**
   *
   * @param {CcKvExplorerState} state
   * @return {state is CcKvExplorerStateLoaded}
   */
  _isLoadedState(state) {
    return state.type === 'loaded' || state.type === 'loading-keys';
  }
}

/**
 * @extends {KvScanner<CcKvKeyState, {type: CcKvKeyType, pattern: string}>}
 */
class KvKeysScanner extends KvScanner {
  /**
   * @param {KvClient} kvClient
   * @param {function} onChange
   */
  constructor(kvClient, onChange) {
    super(onChange);
    this._kvClient = kvClient;
  }

  /**
   * @param {CcKvKeyState} item
   * @returns {string}
   */
  getId(item) {
    return item.key.name;
  }

  /**
   * @param {CcKvKeyState} item
   * @returns {boolean}
   */
  matchFilter(item) {
    return (
      (this._filter?.type == null || item.key.type === this._filter.type) &&
      (isStringEmpty(this._filter?.pattern) || matchKvPattern(this._filter.pattern, item.key.name))
    );
  }

  /**
   * @param {number} count
   * @param {AbortSignal} [_signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<CcKvKeyState>}>}
   */
  async fetch(count, _signal) {
    const r = await this._kvClient.scanKeys({
      cursor: this._cursor,
      count,
      type: this._filter?.type,
      match: this._filter?.pattern,
    });
    return {
      cursor: r.cursor,
      total: r.total,
      elements: r.keys.map((key) => ({ type: 'idle', key })),
    };
  }
}
