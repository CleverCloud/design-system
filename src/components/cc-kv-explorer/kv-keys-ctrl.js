import { isStringEmpty } from '../../lib/utils.js';
import { KvScanner } from './kv-scanner.js';
import { matchKvPattern } from './kv-utils.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerState} CcKvExplorerState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateLoaded} CcKvExplorerStateLoaded
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyType} CcKvKeyType
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyState} CcKvKeyState
 * @typedef {import('./kv-client.js').KvClient} KvClient
 */

/**
 * Controller for keys
 */
export class KeysController {
  /**
   * @param {CcKvExplorer} component
   * @param {function} updateComponent
   * @param {KvKeysScanner} kvKeysScanner
   */
  constructor(component, updateComponent, kvKeysScanner) {
    this.component = component;
    this.updateComponent = updateComponent;
    this._kvKeysScanner = kvKeysScanner;
  }

  /**
   * @param {T|((state: T) => void)} updater
   * @template {CcKvExplorerState} T
   */
  updateState(updater) {
    this.updateComponent('state', updater);
  }

  /**
   * @param {string} key
   * @param {'idle'|'loading'|'selected'|'deleting'} newState
   */
  updateKeyState(key, newState) {
    this.updateState(
      /** @param {CcKvExplorerStateLoaded} state */
      (state) => {
        const toUpdate = state.keys.find((k) => k.key.name === key);
        if (toUpdate != null) {
          toUpdate.type = newState;
        }
      },
    );

    if (this.component.state.type === 'loaded' || this.component.state.type === 'loading-keys') {
      const toUpdate = this.component.state.keys.find((k) => k.key.name === key);
      if (toUpdate != null) {
        this._kvKeysScanner.update([toUpdate]);
      }
    }
  }
}

/**
 * @extends {KvScanner<CcKvKeyState, {type: CcKvKeyType, pattern: string}>}
 */
export class KvKeysScanner extends KvScanner {
  /**
   * @param {KvClient} kvClient
   */
  constructor(kvClient) {
    super();
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
   * @param {number} cursor
   * @param {number} count
   * @param {{type: CcKvKeyType, pattern: string}} filter
   * @param {AbortSignal} [_signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<CcKvKeyState>}>}
   */
  async fetch(cursor, count, filter, _signal) {
    const r = await this._kvClient.scanKeys({ cursor, count, type: filter?.type, match: filter?.pattern });
    return {
      cursor: r.cursor,
      total: r.total,
      elements: r.keys.map((key) => ({ type: 'idle', key })),
    };
  }
}
