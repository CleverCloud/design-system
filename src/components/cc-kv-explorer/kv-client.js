// @ts-expect-error FIXME: remove when clever-client exports types
import { prefixUrl } from '@clevercloud/client/esm/prefix-url.js';
// @ts-expect-error FIXME: remove when clever-client exports types
import { request } from '@clevercloud/client/esm/request.fetch.js';
// @ts-expect-error FIXME: remove when clever-client exports types
import { withCache } from '@clevercloud/client/esm/with-cache.js';
// @ts-expect-error FIXME: remove when clever-client exports types
import { withOptions } from '@clevercloud/client/esm/with-options.js';

/**
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyType} CcKvKeyType
 * @typedef {import('../common.types.js').ValueOrArray<string|number|null>} CommandResult
 */

/**
 * A client to the kv proxy APIs
 */
export class KvClient {
  /**
   * @param {{url: string, backendUrl: string}} apiConfig
   */
  constructor(apiConfig) {
    this._apiConfig = apiConfig;
  }

  /**
   * @param {object} _
   * @param {AbortSignal} [_.signal]
   * @return {Promise<boolean>}
   */
  async ping({ signal }) {
    const result = await this.sendCommand('PING', [], { signal });
    return result.result === 'PONG';
  }

  /**
   * @param {object} [options]
   * @param {number} [options.cursor]
   * @param {number} [options.count]
   * @param {CcKvKeyType} [options.type]
   * @param {string} [options.match]
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{cursor: number, total: number, keys: Array<{name: string, type: CcKvKeyType}>}>}
   */
  async scanKeys({ cursor, count, type, match } = {}, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/keys/_scan`,
      body: { cursor, count, type, match },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {object} _
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, deleted: boolean}>}
   */
  async deleteKey(keyName, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/_delete`,
      body: { key: keyName },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {object} _
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, value: string}>}
   */
  async getStringKey(keyName, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/string/_get`,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: { key: keyName },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {string} value
   * @param {object} _
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, value: string}>}
   */
  async createStringKey(keyName, value, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/string/_create`,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: { key: keyName, value },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {string} value
   * @param {object} _
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, value: string}>}
   */
  async updateStringKey(keyName, value, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/string/_update`,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: { key: keyName, value },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {Array<{field: string, value: string}>} elements
   * @param {object} _
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, elements: Array<{field: string, value: string}>}>}
   */
  async createHashKey(keyName, elements, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/hash/_create`,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: { key: keyName, elements },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {object} [options]
   * @param {number} [options.cursor]
   * @param {number} [options.count]
   * @param {string} [options.match]
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<{field: string, value: string}>}>}
   */
  async scanHash(keyName, { cursor, count, match } = {}, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/hash/_scan`,
      body: { key: keyName, cursor, count, match },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {string} field
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, field: string, deleted: boolean}>}
   */
  async deleteHashElement(keyName, field, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/hash/_delete`,
      body: { key: keyName, field },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {string} field
   * @param {string} value
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, field: string, value: string, added: boolean}>}
   */
  async setHashElement(keyName, field, value, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/hash/_set`,
      body: { key: keyName, field, value },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {Array<string>} elements
   * @param {object} _
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, elements: Array<{index: number, value: string}>}>}
   */
  async createListKey(keyName, elements, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/list/_create`,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: { key: keyName, elements },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {object} [options]
   * @param {number} [options.cursor]
   * @param {number} [options.count]
   * @param {number} [options.match]
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<{index: number, value: string}>}>}
   */
  async scanList(keyName, { cursor, count, match } = {}, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/list/_scan`,
      body: { key: keyName, cursor, count, match },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {number} index
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, index: number, value: string}>}
   */
  async getListElementAt(keyName, index, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/list/_get`,
      body: { key: keyName, index },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {number} index
   * @param {string} value
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, index: number, value: string}>}
   */
  async updateListElement(keyName, index, value, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/list/_update`,
      body: { key: keyName, index, value },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {'tail'|'head'} position
   * @param {string} value
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, index: number, value: string}>}
   */
  async pushListElement(keyName, position, value, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/list/_push`,
      body: { key: keyName, position, value },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {Array<string>} elements
   * @param {object} _
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, elements: Array<string>}>}
   */
  async createSetKey(keyName, elements, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/set/_create`,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: { key: keyName, elements },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {object} [options]
   * @param {number} [options.cursor]
   * @param {number} [options.count]
   * @param {string} [options.match]
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<string>}>}
   */
  async scanSet(keyName, { cursor, count, match } = {}, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/set/_scan`,
      body: { key: keyName, cursor, count, match },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {string} element
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, element: string, deleted: boolean}>}
   */
  async deleteSetElement(keyName, element, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/set/_delete`,
      body: { key: keyName, element },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} keyName
   * @param {string} element
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{key: string, element: string, added: boolean}>}
   */
  async addSetElement(keyName, element, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/key/set/_set`,
      body: { key: keyName, element },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} commandLine
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{success: boolean, result: Array<string>}>}
   */
  async sendCommandLine(commandLine, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/command/cli`,
      body: { commandLine },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    }).then(sendToKvProxy({ apiConfig: this._apiConfig, signal }));
  }

  /**
   * @param {string} command
   * @param {Array<string>} args
   * @param {object} [_]
   * @param {AbortSignal} [_.signal]
   * @return {Promise<{result: CommandResult}>}
   */
  async sendCommand(command, args, { signal } = {}) {
    return Promise.resolve({
      method: 'post',
      url: `/command`,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: { command, args },
    })
      .then(sendToKvProxy({ apiConfig: this._apiConfig, signal }))
      .then((result) => {
        return result;
      });
  }
}

/**
 *
 * @param {object} _
 * @param {{url: string, backendUrl: string}} _.apiConfig
 * @param {AbortSignal} [_.signal]
 * @param {number} [_.cacheDelay]
 * @param {number} [_.timeout]
 * @return {(requestParams: any) => Promise<any>}
 */
function sendToKvProxy({ apiConfig, signal, cacheDelay, timeout }) {
  return (requestParams) => {
    const cacheParams = { ...apiConfig, ...requestParams };
    return withCache(cacheParams, cacheDelay, () => {
      const { url, backendUrl } = apiConfig;
      return Promise.resolve(requestParams)
        .then(prefixUrl(url))
        .then((requestParams) => {
          return {
            ...requestParams,
            body: { ...omitNulls(requestParams.body), backendUrl },
          };
        })
        .then(withOptions({ signal, timeout }))
        .then(request);
    });
  };
}

/**
 *
 * @param {Partial<T>} object
 * @template {object} T
 */
function omitNulls(object) {
  return Object.fromEntries(Object.entries(object).filter(([, v]) => v != null));
}
