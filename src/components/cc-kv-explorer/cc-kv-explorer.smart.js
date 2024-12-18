import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { notifyError, notifySuccess } from '../../lib/notifications.js';
import { isStringEmpty } from '../../lib/utils.js';
import { i18n } from '../../translations/translation.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-kv-explorer.js';
import { KvClient } from './kv-client.js';
import { KvHashElementsScanner, KvKeyHashCtrl } from './kv-key-hash-ctrl.js';
import { KvKeyListCtrl, KvListElementsScanner } from './kv-key-list-ctrl.js';
import { KvKeySetCtrl, KvSetElementsScanner } from './kv-key-set-ctrl.js';
import { KvKeyStringCtrl } from './kv-key-string-ctrl.js';
import { KvKeysCtrl, KvKeysScanner } from './kv-keys-ctrl.js';

/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerState} CcKvExplorerState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateLoaded} CcKvExplorerStateLoaded
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateLoadingKeys} CcKvExplorerStateLoadingKeys
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailState} CcKvExplorerDetailState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateAdd} CcKvExplorerDetailStateAdd
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailStateEdit} CcKvExplorerDetailStateEdit
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyState} CcKvKeyState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKey} CcKvKey
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyType} CcKvKeyType
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyValue} CcKvKeyValue
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyFilter} CcKvKeyFilter
 */

defineSmartComponent({
  selector: 'cc-kv-explorer-beta',
  params: {
    kvApiConfig: { type: Object },
  },

  /**
   * @param {Object} settings
   * @param {CcKvExplorer} settings.component
   * @param {{kvApiConfig: {url: string, backendUrl: string}}} settings.context
   * @param {(type: string, listener: (detail: any) => void) => void} settings.onEvent
   * @param {function} settings.updateComponent
   * @param {AbortSignal} settings.signal
   */
  // @ts-expect-error FIXME: remove once `onContextUpdate` is typed with generics
  async onContextUpdate({ component, context, onEvent, updateComponent, signal }) {
    const { kvApiConfig } = context;
    const kvClient = new KvClient(kvApiConfig, signal);

    const kvKeysScanner = new KvKeysScanner(kvClient);
    const keysCtrl = new KvKeysCtrl(component, updateComponent, kvKeysScanner);

    const stringKeyCtrl = new KvKeyStringCtrl(updateComponent);

    const hashScanner = new KvHashElementsScanner(kvClient);
    const hashKeyCtrl = new KvKeyHashCtrl(component, updateComponent, hashScanner);

    const listScanner = new KvListElementsScanner(kvClient);
    const listKeyCtrl = new KvKeyListCtrl(component, updateComponent, listScanner);

    const setScanner = new KvSetElementsScanner(kvClient);
    const setKeyCtrl = new KvKeySetCtrl(component, updateComponent, setScanner);

    // -- keys ---

    onEvent(
      'cc-kv-explorer:filter-change',
      /** @param { CcKvKeyFilter } filter */
      async ({ type, pattern }) => {
        const filter = {
          type: type === 'all' ? null : type,
          pattern: isStringEmpty(pattern) ? null : pattern,
        };

        kvKeysScanner.setFilter(filter);
        await fetchKeys({ type: 'filtering', keys: [] });
      },
    );

    onEvent('cc-kv-explorer:refresh-keys', async () => {
      kvKeysScanner.reset();
      await fetchKeys({ type: 'refreshing', keys: [] });
    });

    onEvent('cc-kv-explorer:load-more-keys', async () => {
      if (component.state.type !== 'loaded') {
        return;
      }
      await fetchKeys();
    });

    /** @type {AbortController} */
    let abortCtrl;

    onEvent(
      'cc-kv-explorer:selected-key-change',
      /** @param {CcKvKey} key */
      async (key) => {
        if (component.state.type !== 'loaded') {
          return;
        }

        const previousSelectedKeyName = component.state.keys.find((keyState) => keyState.type === 'selected')?.key.name;
        keysCtrl.updateKeyState(key.name, 'loading');
        if (previousSelectedKeyName != null) {
          keysCtrl.updateKeyState(previousSelectedKeyName, 'idle');
        }

        try {
          keysCtrl.updateKeyState(key.name, 'selected');

          if (abortCtrl != null) {
            abortCtrl.abort();
          }
          abortCtrl = new AbortController();

          switch (key.type) {
            case 'string': {
              stringKeyCtrl.setLoading(key);
              const { value } = await kvClient.getStringKey(key.name, abortCtrl.signal);
              stringKeyCtrl.setLoaded(key, value);

              break;
            }
            case 'hash': {
              hashKeyCtrl.setLoading(key);
              hashScanner.setFilter({ keyName: key.name });
              await hashScanner.loadMore(abortCtrl.signal);
              hashKeyCtrl.setLoaded(key);

              break;
            }
            case 'list': {
              listKeyCtrl.setLoading(key);
              listScanner.setFilter({ keyName: key.name });
              await listScanner.loadMore(abortCtrl.signal);
              listKeyCtrl.setLoaded(key);

              break;
            }
            case 'set': {
              setKeyCtrl.setLoading(key);
              setScanner.setFilter({ keyName: key.name });
              await setScanner.loadMore(abortCtrl.signal);
              setKeyCtrl.setLoaded(key);

              break;
            }
          }
        } catch (e) {
          if (!(e instanceof DOMException && e.name === 'AbortError')) {
            checkIfKeyNotFoundOrElse(e, () => {
              notifyError(i18n('cc-kv-explorer.error.get-key'));
              keysCtrl.updateKeyState(key.name, 'idle');
              updateComponent('detailState', { type: 'hidden' });
            });
          }
        }
      },
    );

    onEvent(
      'cc-kv-explorer:delete-key',
      /** @param {string} key */
      async (key) => {
        keysCtrl.updateKeyState(key, 'deleting');

        try {
          await kvClient.deleteKey(key);
          const deletedKeyIndex = kvKeysScanner.delete(key);

          updateComponent(
            'state',
            /** @param {CcKvExplorerStateLoaded} state */
            (state) => {
              state.keys = kvKeysScanner.elements;
              state.total = kvKeysScanner.total;
            },
          );

          if (isEditState(component.detailState) && component.detailState.key.name === key) {
            updateComponent('detailState', { type: 'hidden' });
          }

          component.focusAfterDeleteKeyAt(deletedKeyIndex);

          notifySuccess(i18n('cc-kv-explorer.success.delete-key'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-explorer.error.delete-key'));
            keysCtrl.updateKeyState(key, 'idle');
          });
        }
      },
    );

    onEvent(
      'cc-kv-explorer:add-key',
      /** @param {CcKvKeyValue} keyValue */
      async (keyValue) => {
        updateComponent(
          'detailState',
          /** @param {CcKvExplorerDetailStateAdd} state */
          (state) => {
            state.formState.type = 'adding';
          },
        );

        try {
          switch (keyValue.type) {
            case 'string':
              await kvClient.createStringKey(keyValue.name, keyValue.value);

              stringKeyCtrl.setLoaded({ type: 'string', name: keyValue.name }, keyValue.value);
              break;
            case 'hash':
              await kvClient.createHashKey(keyValue.name, keyValue.elements);

              hashScanner.setFilter({ keyName: keyValue.name });
              hashScanner.update(keyValue.elements.map((e) => ({ ...e, type: 'idle' })));
              hashKeyCtrl.setLoaded({ type: 'hash', name: keyValue.name });
              break;
            case 'list':
              await kvClient.createListKey(keyValue.name, keyValue.elements);

              listScanner.setFilter({ keyName: keyValue.name });
              listScanner.update(keyValue.elements.map((e, i) => ({ index: i, value: e, type: 'idle' })));
              listKeyCtrl.setLoaded({ type: 'list', name: keyValue.name });
              break;
            case 'set':
              await kvClient.createSetKey(keyValue.name, keyValue.elements);

              setScanner.setFilter({ keyName: keyValue.name });
              setScanner.update(keyValue.elements.map((e) => ({ value: e, type: 'idle' })));
              setKeyCtrl.setLoaded({ type: 'set', name: keyValue.name });
              break;
          }

          /** @type {CcKvKeyState} */
          const keyState = { type: 'selected', key: { name: keyValue.name, type: keyValue.type } };
          if (kvKeysScanner.update([keyState])) {
            updateComponent(
              'state',
              /** @param {CcKvExplorerStateLoaded} state */
              (state) => {
                state.keys = kvKeysScanner.elements;
                state.total = kvKeysScanner.total;
              },
            );
          }

          component.focusAddKeyButton();

          notifySuccess(i18n('cc-kv-explorer.success.add-key'));
        } catch (e) {
          console.error(e);

          const errorCode = getErrorCode(e);
          if (errorCode === 'clever.redis-http.key-already-exists') {
            updateComponent(
              'detailState',
              /** @param {CcKvExplorerDetailStateAdd} state */
              (state) => {
                state.formState.type = 'idle';
                state.formState.errors = { keyName: 'already-used' };
              },
            );
          } else {
            notifyError(i18n('cc-kv-explorer.error.add-key'));

            updateComponent(
              'detailState',
              /** @param {CcKvExplorerDetailStateAdd} state */
              (state) => {
                state.formState.type = 'idle';
              },
            );
          }
        }
      },
    );

    // -- string ---

    onEvent(
      'cc-kv-string-editor:update-value',
      /** @param {string} value */
      async (value) => {
        if (component.detailState.type !== 'edit-string' || component.detailState.editor.type === 'loading') {
          return;
        }

        stringKeyCtrl.setEditorType('saving');

        try {
          await kvClient.updateStringKey(component.detailState.key.name, value);
          stringKeyCtrl.setEditorType('idle');

          notifySuccess(i18n('cc-kv-string-editor.success.update-value'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-string-editor.error.update-value'));
            stringKeyCtrl.setEditorType('idle');
          });
        }
      },
    );

    // -- hash ---

    onEvent(
      'cc-kv-hash-explorer:filter-change',
      /** @param {string} pattern */
      async (pattern) => {
        if (component.detailState.type !== 'edit-hash' || component.detailState.editor.type === 'loading') {
          return;
        }

        const addForm = component.detailState.editor.addForm;

        hashKeyCtrl.updateEditor({ type: 'loading' });

        try {
          hashScanner.setFilter({ keyName: component.detailState.key.name, pattern });
          await hashScanner.loadMore();
          hashKeyCtrl.updateEditor({ type: 'loaded', elements: hashScanner.elements, addForm });
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-hash-explorer.error.apply-filter'));
            hashKeyCtrl.updateEditor({ type: 'loaded', elements: hashScanner.elements, addForm });
          });
        }
      },
    );

    onEvent('cc-kv-hash-explorer:load-more-elements', async () => {
      if (component.state.type !== 'loaded') {
        return;
      }

      hashKeyCtrl.updateEditor((editor) => (editor.type = 'loading-more'));

      try {
        await hashScanner.loadMore();
        hashKeyCtrl.updateEditorElements(hashScanner.elements);
        hashKeyCtrl.updateEditor((editor) => (editor.type = 'loaded'));
      } catch (e) {
        checkIfKeyNotFoundOrElse(e, () => {
          notifyError(i18n('cc-kv-hash-explorer.error.fetch-elements'));
          hashKeyCtrl.updateEditor((editor) => (editor.type = 'loaded'));
        });
      }
    });

    onEvent(
      'cc-kv-hash-explorer:delete-element',
      /** @param {string} field */
      async (field) => {
        if (component.detailState.type !== 'edit-hash') {
          return;
        }

        hashKeyCtrl.updateEditorElementState(field, 'deleting');

        try {
          await kvClient.deleteHashElement(component.detailState.key.name, field);
          hashScanner.delete(field);
          hashKeyCtrl.updateEditorElements(hashScanner.elements);

          notifySuccess(i18n('cc-kv-hash-explorer.success.element-delete'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-hash-explorer.error.element-delete'));
            hashKeyCtrl.updateEditorElementState(field, 'idle');
          });
        }
      },
    );

    onEvent(
      'cc-kv-hash-explorer:update-element',
      /** @param {{field: string, value: string}} element */
      async ({ field, value }) => {
        if (component.detailState.type !== 'edit-hash') {
          return;
        }

        hashKeyCtrl.updateEditorElementState(field, 'updating');

        try {
          await kvClient.setHashElement(component.detailState.key.name, field, value);
          hashScanner.update([{ type: 'idle', field, value }]);
          hashKeyCtrl.updateEditorElements(hashScanner.elements);

          notifySuccess(i18n('cc-kv-hash-explorer.success.element-update'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-hash-explorer.error.element-update'));
            hashKeyCtrl.updateEditorElementState(field, 'editing');
          });
        }
      },
    );

    onEvent(
      'cc-kv-hash-explorer:add-element',
      /** @param {{field: string, value: string}} element */
      async ({ field, value }) => {
        if (component.detailState.type !== 'edit-hash') {
          return;
        }

        hashKeyCtrl.updateAddForm({ type: 'adding' });

        try {
          const result = await kvClient.setHashElement(component.detailState.key.name, field, value);

          component.resetEditorForm();

          // refetch all elements
          hashKeyCtrl.setLoading(component.detailState.key);
          hashScanner.reset();
          await hashScanner.loadMore();
          hashKeyCtrl.setLoaded(component.detailState.key);
          hashKeyCtrl.updateAddForm({ type: 'idle' });

          if (result.added) {
            notifySuccess(i18n('cc-kv-hash-explorer.success.element-add'));
          } else {
            notifySuccess(i18n('cc-kv-hash-explorer.success.element-update'));
          }
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-hash-explorer.error.element-add'));
            hashKeyCtrl.updateAddForm({ type: 'idle' });
          });
        }
      },
    );

    // -- list

    onEvent('cc-kv-list-explorer:load-more-elements', async () => {
      if (component.state.type !== 'loaded') {
        return;
      }

      listKeyCtrl.updateEditor((editor) => (editor.type = 'loading-more'));

      try {
        await listScanner.loadMore();
        listKeyCtrl.updateEditorElements(listScanner.elements);
        listKeyCtrl.updateEditor((editor) => (editor.type = 'loaded'));
      } catch (e) {
        checkIfKeyNotFoundOrElse(e, () => {
          notifyError(i18n('cc-kv-list-explorer.error.fetch-elements'));
          listKeyCtrl.updateEditor((editor) => (editor.type = 'loaded'));
        });
      }
    });

    onEvent(
      'cc-kv-list-explorer:filter-change',
      /** @param {number} index */
      async (index) => {
        if (component.detailState.type !== 'edit-list' || component.detailState.editor.type === 'loading') {
          return;
        }

        const addForm = component.detailState.editor.addForm;

        listKeyCtrl.updateEditor({ type: 'loading' });

        try {
          listScanner.setFilter({ keyName: component.detailState.key.name, index });
          await listScanner.loadMore();
          listKeyCtrl.updateEditor({ type: 'loaded', elements: listScanner.elements, addForm });
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-list-explorer.error.apply-filter'));
            listKeyCtrl.updateEditor({ type: 'loaded', elements: listScanner.elements, addForm });
          });
        }
      },
    );

    onEvent(
      'cc-kv-list-explorer:update-element',
      /**
       * @param {object} _
       * @param {number} _.index
       * @param {string} _.value
       */
      async ({ index, value }) => {
        if (component.detailState.type !== 'edit-list') {
          return;
        }

        listKeyCtrl.updateEditorElementState(index, 'updating');

        try {
          await kvClient.updateListElement(component.detailState.key.name, index, value);
          listScanner.update([{ type: 'idle', index, value }]);
          listKeyCtrl.updateEditorElements(listScanner.elements);

          notifySuccess(i18n('cc-kv-list-explorer.success.element-update'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-list-explorer.error.element-update'));
            listKeyCtrl.updateEditorElementState(index, 'editing');
          });
        }
      },
    );

    onEvent(
      'cc-kv-list-explorer:add-element',
      /** @param {{position: 'tail'|'head', value: string }} element */
      async (element) => {
        if (component.detailState.type !== 'edit-list') {
          return;
        }

        listKeyCtrl.updateAddForm({ type: 'adding' });

        try {
          const result = await kvClient.pushListElement(
            component.detailState.key.name,
            element.position,
            element.value,
          );

          component.resetEditorForm();

          // refetch all elements
          listKeyCtrl.setLoading(component.detailState.key);
          listScanner.reset();
          await listScanner.loadMore();
          listKeyCtrl.setLoaded(component.detailState.key);
          listKeyCtrl.updateAddForm({ type: 'idle' });

          notifySuccess(i18n('cc-kv-list-explorer.success.element-add', { index: result.index }));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-list-explorer.error.element-add'));
            listKeyCtrl.updateAddForm({ type: 'idle' });
          });
        }
      },
    );

    // -- set ---

    onEvent(
      'cc-kv-set-explorer:filter-change',
      /** @param {string} pattern */
      async (pattern) => {
        if (component.detailState.type !== 'edit-set' || component.detailState.editor.type === 'loading') {
          return;
        }

        const addForm = component.detailState.editor.addForm;

        setKeyCtrl.updateEditor({ type: 'loading' });

        try {
          setScanner.setFilter({ keyName: component.detailState.key.name, pattern });
          await setScanner.loadMore();
          setKeyCtrl.updateEditor({ type: 'loaded', elements: setScanner.elements, addForm });
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-set-explorer.error.apply-filter'));
            setKeyCtrl.updateEditor({ type: 'loaded', elements: setScanner.elements, addForm });
          });
        }
      },
    );

    onEvent('cc-kv-set-explorer:load-more-elements', async () => {
      if (component.state.type !== 'loaded') {
        return;
      }

      setKeyCtrl.updateEditor((editor) => (editor.type = 'loading-more'));

      try {
        await setScanner.loadMore();
        setKeyCtrl.updateEditorElements(setScanner.elements);
        setKeyCtrl.updateEditor((editor) => (editor.type = 'loaded'));
      } catch (e) {
        checkIfKeyNotFoundOrElse(e, () => {
          notifyError(i18n('cc-kv-set-explorer.error.fetch-elements'));
          setKeyCtrl.updateEditor((editor) => (editor.type = 'loaded'));
        });
      }
    });

    onEvent(
      'cc-kv-set-explorer:delete-element',
      /** @param {string} element */
      async (element) => {
        if (component.detailState.type !== 'edit-set') {
          return;
        }

        setKeyCtrl.updateEditorElementState(element, 'deleting');

        try {
          await kvClient.deleteSetElement(component.detailState.key.name, element);
          setScanner.delete(element);
          setKeyCtrl.updateEditorElements(setScanner.elements);

          notifySuccess(i18n('cc-kv-set-explorer.success.element-delete'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-set-explorer.error.element-delete'));
            setKeyCtrl.updateEditorElementState(element, 'idle');
          });
        }
      },
    );

    onEvent(
      'cc-kv-set-explorer:add-element',
      /** @param {string} element */
      async (element) => {
        if (component.detailState.type !== 'edit-set') {
          return;
        }

        setKeyCtrl.updateAddForm({ type: 'adding' });

        try {
          const result = await kvClient.addSetElement(component.detailState.key.name, element);

          component.resetEditorForm();

          if (result.added) {
            // refetch all elements
            setKeyCtrl.setLoading(component.detailState.key);
            setScanner.reset();
            await setScanner.loadMore();
            setKeyCtrl.setLoaded(component.detailState.key);

            notifySuccess(i18n('cc-kv-set-explorer.success.element-add'));
          } else {
            notifySuccess(i18n('cc-kv-set-explorer.success.element-already-exist'));
          }
          setKeyCtrl.updateAddForm({ type: 'idle' });
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-set-explorer.error.element-add'));
            setKeyCtrl.updateAddForm({ type: 'idle' });
          });
        }
      },
    );

    // -- CLI

    onEvent(
      'cc-kv-terminal:send-command',
      /** @param {string} commandLine */
      async (commandLine) => {
        updateComponent('terminalState', {
          type: 'running',
          commandLine,
          history: component.terminalState.history,
        });

        try {
          const { success, result } = await kvClient.sendCommandLine(commandLine);

          updateComponent('terminalState', {
            type: 'idle',
            history: component.terminalState.history.concat({ commandLine, result, success }),
          });
        } catch (e) {
          console.error(e);

          const err = /** @type {{responseBody: {code: string, message: string}}} */ (e);
          if (
            err.responseBody.code !== 'clever.redis-http.unknown-command' &&
            err.responseBody.code !== 'clever.redis-http.bad-command-format'
          ) {
            console.error(e);
          }

          updateComponent('terminalState', {
            type: 'idle',
            history: component.terminalState.history.concat({
              commandLine,
              result: [err.responseBody.message],
              success: false,
            }),
          });
        }
      },
    );

    // -- init ---

    updateComponent('state', { type: 'loading' });
    updateComponent('detailState', { type: 'hidden' });
    component.resetAddForm();

    try {
      const pong = await kvClient.ping();
      if (pong) {
        await fetchKeys({ keys: [], total: 0 });
      } else {
        updateComponent('state', { type: 'error' });
      }
    } catch (e) {
      console.error(e);
      updateComponent('state', { type: 'error' });
    }

    /**
     * @param {{type?: 'loading-keys'|'filtering'|'refreshing', keys?: Array<CcKvKeyState>, total?: number}} [init]
     */
    async function fetchKeys(init = {}) {
      /** @type {Array<CcKvKeyState>} */
      let keys;
      /** @type {number} */
      let total;

      if (component.state.type === 'loaded' || component.state.type === 'loading-keys') {
        keys = init.keys ?? component.state.keys;
        total = init.total ?? component.state.total;
      }

      keysCtrl.updateState({ type: init.type ?? 'loading-keys', keys: keys ?? [], total: total ?? 0 });

      try {
        if (kvKeysScanner.hasMore()) {
          await kvKeysScanner.loadMore();
          keys = kvKeysScanner.elements;
          total = kvKeysScanner.total;
        }
      } catch (e) {
        console.error(e);

        notifyError(i18n('cc-kv-explorer.error.fetch-keys'));
      } finally {
        // try to restore the selected key (the one that is currently in the form state)
        if (isEditState(component.detailState)) {
          const keyInEdition = component.detailState.key.name;
          keysCtrl.updateKeyState(keyInEdition, 'selected');
        }

        updateComponent('state', { type: 'loaded', keys, total });
      }
    }

    /**
     * @param {any} e
     * @param {function} orElse
     */
    function checkIfKeyNotFoundOrElse(e, orElse) {
      if (isKeyNotFound(e)) {
        notifyError(i18n('cc-kv-explorer.error.key-doesnt-exist'));
        keysCtrl.updateKeyState(e.responseBody.context.key, 'idle');
        updateComponent('detailState', { type: 'hidden' });
      } else {
        console.error(e);
        orElse();
      }
    }
  },
});

/**
 * @param {{responseBody?: { code?: string}}} e
 * @return {string | null} e
 */
function getErrorCode(e) {
  return e?.responseBody?.code;
}

/**
 * @param {any} e
 * @return {e is {responseBody: { context: {key: string}}}}
 */
function isKeyNotFound(e) {
  return getErrorCode(e) === 'clever.redis-http.key-not-found';
}

/**
 * @param {CcKvExplorerDetailState} state
 * @return {state is CcKvExplorerDetailStateEdit}
 */
function isEditState(state) {
  return state.type.startsWith('edit-');
}
