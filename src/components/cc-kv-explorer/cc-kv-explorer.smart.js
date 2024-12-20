import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { notifyError, notifySuccess } from '../../lib/notifications.js';
import { i18n } from '../../translations/translation.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-kv-explorer.js';
import { KvClient } from './kv-client.js';
import { KvDetailsCtrl } from './kv-details-ctrl.js';
import { KvKeysCtrl } from './kv-keys-ctrl.js';

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
 * @typedef {import('./kv-key-editor-hash-ctrl.js').KvKeyEditorHashCtrl} KvKeyEditorHashCtrl
 * @typedef {import('./kv-key-editor-list-ctrl.js').KvKeyEditorListCtrl} KvKeyEditorListCtrl
 * @typedef {import('./kv-key-editor-set-ctrl.js').KvKeyEditorSetCtrl} KvKeyEditorSetCtrl
 * @typedef {import('./kv-key-editor-string-ctrl.js').KvKeyEditorStringCtrl} KvKeyEditorStringCtrl
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

    const view = {
      component,
      update: updateComponent,
    };

    const keysCtrl = new KvKeysCtrl(view, kvClient);
    const detailsCtrl = new KvDetailsCtrl(view, kvClient);

    // -- keys ---

    onEvent(
      'cc-kv-explorer:filter-change',
      /** @param { CcKvKeyFilter } filter */
      async ({ type, pattern }) => {
        try {
          await keysCtrl.filter(type, pattern);
        } catch (e) {
          console.error(e);
          notifyError(i18n('cc-kv-explorer.error.fetch-keys'));
        }
      },
    );

    onEvent('cc-kv-explorer:refresh-keys', async () => {
      try {
        await keysCtrl.refresh();
      } catch (e) {
        console.error(e);
        notifyError(i18n('cc-kv-explorer.error.fetch-keys'));
      }
    });

    onEvent('cc-kv-explorer:load-more-keys', async () => {
      try {
        await keysCtrl.loadMore();
      } catch (e) {
        console.error(e);
        notifyError(i18n('cc-kv-explorer.error.fetch-keys'));
      }
    });

    onEvent(
      'cc-kv-explorer:selected-key-change',
      /** @param {CcKvKey} key */
      async (key) => {
        if (keysCtrl.select(key)) {
          try {
            await detailsCtrl.load(key);
          } catch (e) {
            checkIfKeyNotFoundOrElse(e, () => {
              notifyError(i18n('cc-kv-explorer.error.get-key'));
              keysCtrl.clearSelection();
              detailsCtrl.hide();
            });
          }
        }
      },
    );

    onEvent(
      'cc-kv-explorer:delete-key',
      /** @param {string} key */
      async (key) => {
        try {
          await keysCtrl.delete(key);
          notifySuccess(i18n('cc-kv-explorer.success.delete-key'));

          if (detailsCtrl.keyName === key) {
            detailsCtrl.hide();
          }
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-explorer.error.delete-key'));
          });
        }
      },
    );

    onEvent(
      'cc-kv-explorer:add-key',
      /** @param {CcKvKeyValue} keyValue */
      async (keyValue) => {
        try {
          await detailsCtrl.add(keyValue);

          keysCtrl.add({ name: keyValue.name, type: keyValue.type });

          notifySuccess(i18n('cc-kv-explorer.success.add-key'));
        } catch (e) {
          console.error(e);
          notifyError(i18n('cc-kv-explorer.error.add-key'));
        }
      },
    );

    // -- string ---

    onEvent(
      'cc-kv-string-editor:update-value',
      /** @param {string} value */
      async (value) => {
        const editorCtrl = /** @type {KvKeyEditorStringCtrl} */ (detailsCtrl.editorCtrl);

        try {
          await editorCtrl.save(value);

          notifySuccess(i18n('cc-kv-string-editor.success.update-value'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-string-editor.error.update-value'));
          });
        }
      },
    );

    // -- hash ---

    onEvent(
      'cc-kv-hash-explorer:filter-change',
      /** @param {string} pattern */
      async (pattern) => {
        const editorCtrl = /** @type {KvKeyEditorHashCtrl} */ (detailsCtrl.editorCtrl);

        try {
          await editorCtrl.filter(pattern);
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-hash-explorer.error.apply-filter'));
          });
        }
      },
    );

    onEvent('cc-kv-hash-explorer:load-more-elements', async () => {
      const editorCtrl = /** @type {KvKeyEditorHashCtrl} */ (detailsCtrl.editorCtrl);

      try {
        await editorCtrl.loadMore();
      } catch (e) {
        checkIfKeyNotFoundOrElse(e, () => {
          notifyError(i18n('cc-kv-hash-explorer.error.fetch-elements'));
        });
      }
    });

    onEvent(
      'cc-kv-hash-explorer:delete-element',
      /** @param {string} field */
      async (field) => {
        const editorCtrl = /** @type {KvKeyEditorHashCtrl} */ (detailsCtrl.editorCtrl);

        try {
          await editorCtrl.deleteElement(field);
          notifySuccess(i18n('cc-kv-hash-explorer.success.element-delete'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-hash-explorer.error.element-delete'));
          });
        }
      },
    );

    onEvent(
      'cc-kv-hash-explorer:update-element',
      /** @param {{field: string, value: string}} element */
      async ({ field, value }) => {
        const editorCtrl = /** @type {KvKeyEditorHashCtrl} */ (detailsCtrl.editorCtrl);

        try {
          await editorCtrl.updateElement(field, value);
          notifySuccess(i18n('cc-kv-hash-explorer.success.element-update'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-hash-explorer.error.element-update'));
          });
        }
      },
    );

    onEvent(
      'cc-kv-hash-explorer:add-element',
      /** @param {{field: string, value: string}} element */
      async ({ field, value }) => {
        const editorCtrl = /** @type {KvKeyEditorHashCtrl} */ (detailsCtrl.editorCtrl);

        try {
          const added = await editorCtrl.addElement(field, value);

          if (added) {
            notifySuccess(i18n('cc-kv-hash-explorer.success.element-add'));
          } else {
            notifySuccess(i18n('cc-kv-hash-explorer.success.element-update'));
          }
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-hash-explorer.error.element-add'));
          });
        }
      },
    );

    // -- list

    onEvent(
      'cc-kv-list-explorer:filter-change',
      /** @param {number} index */
      async (index) => {
        const editorCtrl = /** @type {KvKeyEditorListCtrl} */ (detailsCtrl.editorCtrl);

        try {
          await editorCtrl.filter(index);
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-list-explorer.error.apply-filter'));
          });
        }
      },
    );

    onEvent('cc-kv-list-explorer:load-more-elements', async () => {
      const editorCtrl = /** @type {KvKeyEditorListCtrl} */ (detailsCtrl.editorCtrl);

      try {
        await editorCtrl.loadMore();
      } catch (e) {
        checkIfKeyNotFoundOrElse(e, () => {
          notifyError(i18n('cc-kv-list-explorer.error.fetch-elements'));
        });
      }
    });

    onEvent(
      'cc-kv-list-explorer:update-element',
      /**
       * @param {{index: number, value: string}} element
       */
      async ({ index, value }) => {
        const editorCtrl = /** @type {KvKeyEditorListCtrl} */ (detailsCtrl.editorCtrl);

        try {
          await editorCtrl.updateElement(index, value);
          notifySuccess(i18n('cc-kv-list-explorer.success.element-update'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-list-explorer.error.element-update'));
          });
        }
      },
    );

    onEvent(
      'cc-kv-list-explorer:add-element',
      /** @param {{position: 'tail'|'head', value: string }} element */
      async ({ position, value }) => {
        const editorCtrl = /** @type {KvKeyEditorListCtrl} */ (detailsCtrl.editorCtrl);

        try {
          const index = await editorCtrl.addElement(position, value);

          notifySuccess(i18n('cc-kv-list-explorer.success.element-add', { index }));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-list-explorer.error.element-add'));
          });
        }
      },
    );

    // -- set ---

    onEvent(
      'cc-kv-set-explorer:filter-change',
      /** @param {string} pattern */
      async (pattern) => {
        const editorCtrl = /** @type {KvKeyEditorSetCtrl} */ (detailsCtrl.editorCtrl);

        try {
          await editorCtrl.filter(pattern);
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-set-explorer.error.apply-filter'));
          });
        }
      },
    );

    onEvent('cc-kv-set-explorer:load-more-elements', async () => {
      const editorCtrl = /** @type {KvKeyEditorSetCtrl} */ (detailsCtrl.editorCtrl);

      try {
        await editorCtrl.loadMore();
      } catch (e) {
        checkIfKeyNotFoundOrElse(e, () => {
          notifyError(i18n('cc-kv-set-explorer.error.fetch-elements'));
        });
      }
    });

    onEvent(
      'cc-kv-set-explorer:delete-element',
      /** @param {string} element */
      async (element) => {
        const editorCtrl = /** @type {KvKeyEditorSetCtrl} */ (detailsCtrl.editorCtrl);

        try {
          await editorCtrl.deleteElement(element);
          notifySuccess(i18n('cc-kv-set-explorer.success.element-delete'));
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-set-explorer.error.element-delete'));
          });
        }
      },
    );

    onEvent(
      'cc-kv-set-explorer:add-element',
      /** @param {string} element */
      async (element) => {
        const editorCtrl = /** @type {KvKeyEditorSetCtrl} */ (detailsCtrl.editorCtrl);

        try {
          const added = await editorCtrl.addElement(element);

          if (added) {
            notifySuccess(i18n('cc-kv-set-explorer.success.element-add'));
          } else {
            notifySuccess(i18n('cc-kv-set-explorer.success.element-already-exist'));
          }
        } catch (e) {
          checkIfKeyNotFoundOrElse(e, () => {
            notifyError(i18n('cc-kv-set-explorer.error.element-add'));
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
    detailsCtrl.hide();
    component.resetAddForm();

    let ready = false;
    try {
      ready = await kvClient.ping();
    } catch (e) {
      console.error(e);
      updateComponent('state', { type: 'error' });
    }
    try {
      if (ready) {
        await keysCtrl.fetchKeys({ keys: [], total: 0 });
      }
    } catch (e) {
      console.error(e);
      notifyError(i18n('cc-kv-explorer.error.fetch-keys'));
    }

    /**
     * @param {any} e
     * @param {function} orElse
     */
    function checkIfKeyNotFoundOrElse(e, orElse) {
      if (isKeyNotFound(e)) {
        notifyError(i18n('cc-kv-explorer.error.key-doesnt-exist'));
        keysCtrl.onKeyNotFound(e.responseBody.context.key);
        detailsCtrl.hide();
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
