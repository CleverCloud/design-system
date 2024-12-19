/**
 * A generic class that helps in scanning kv entities.
 *
 * * It holds a cursor and a filter so that one can ask for more elements.
 * * It also holds the list of elements so that one can update, add or delete inside this list.
 *
 * @template T
 * @template F
 */
export class KvScanner {
  /**
   *
   * @param {function} [onChange]
   */
  constructor(onChange) {
    /** @type {Map<string, T>} */
    this._map = new Map();
    /** @type {Array<T>} */
    this._elements = [];
    /** @type {number|null} */
    this._cursor = null;
    /** @type {F} */
    this._filter = null;

    this._onChange = onChange;
  }

  /**
   * @param {T} _item
   * @return {string}
   * @protected
   */
  getId(_item) {
    throw new Error('Abstract method: please implement me');
  }

  /**
   * @param {T} _item
   * @return {boolean}
   * @protected
   */
  matchFilter(_item) {
    throw new Error('Abstract method: please implement me');
  }

  /**
   * @param {number} _cursor
   * @param {number} _count
   * @param {F} _filter
   * @param {AbortSignal} [_signal]
   * @return {Promise<{cursor: number, total: number, elements: Array<T>}>}
   * @protected
   */
  fetch(_cursor, _count, _filter, _signal) {
    throw new Error('Abstract method: please implement me');
  }

  reset() {
    this._cursor = null;
    this._map.clear();
    this._elements = [];
    this._onChange?.();
  }

  /**
   * @param {F} filter
   */
  setFilter(filter) {
    this._filter = filter;
    this.reset();
  }

  /**
   * @param {string} id
   * @return {number} index of the deleted element
   */
  delete(id) {
    let index = -1;
    if (this._map.delete(id)) {
      this._elements = this._elements.filter((it, idx) => {
        const currentId = this.getId(it);

        if (currentId === id) {
          index = idx;
        }
        return currentId !== id;
      });
      this._total--;

      this._onChange?.();
    }
    return index;
  }

  /**
   * @param {Array<T>} items
   * @return {boolean}
   */
  update(items) {
    if (items == null || items.length === 0) {
      return false;
    }

    /** @type {Array<T>} */
    const toAdd = [];
    /** @type {Map<string, T>} */
    const toUpdate = new Map();

    items.forEach((it) => {
      if (this._filter == null || this.matchFilter(it)) {
        const id = this.getId(it);

        if (this._map.has(id)) {
          toUpdate.set(id, it);
        } else {
          toAdd.push(it);
        }
        this._map.set(id, it);
      }
    });

    if (toAdd.length > 0 || toUpdate.size > 0) {
      this._elements = [
        ...toAdd,
        ...this._elements.map((it) => {
          const id = this.getId(it);
          return toUpdate.has(id) ? { ...toUpdate.get(id) } : it;
        }),
      ];

      this._total += toAdd.length;

      this._onChange?.();

      return true;
    }
    return false;
  }

  /**
   * @param {string} id
   * @returns {T}
   */
  getElement(id) {
    return this._map.get(id);
  }

  /**
   * @return {Array<T>}
   */
  get elements() {
    return this._elements;
  }

  /**
   * @return {number}
   */
  get total() {
    return this._total;
  }

  /**
   * @return {boolean}
   */
  hasMore() {
    return this._cursor !== 0;
  }

  /**
   * @param {AbortSignal} [signal]
   * @param {number} [count]
   * @return {Promise<void>}
   */
  async loadMore(signal, count = 1000) {
    if (this.hasMore()) {
      const f = await this.fetch(this._cursor, count, this._filter, signal);
      f.elements.forEach((it) => {
        this._map.set(this.getId(it), it);
      });
      this._elements = Array.from(this._map.values());
      this._cursor = f.cursor;
      this._total = f.total;

      this._onChange?.();
    }
  }
}
