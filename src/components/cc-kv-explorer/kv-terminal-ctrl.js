/**
 * @typedef {import('./cc-kv-explorer.js').CcKvExplorer} CcKvExplorer
 * @typedef {import('./kv-client.js').KvClient} KvClient
 */

export class KvTerminalCtrl {
  /**
   * @param {{component: CcKvExplorer, update: function}} view
   * @param {KvClient} kvClient
   */
  constructor(view, kvClient) {
    this._view = view;
    this._kvClient = kvClient;
  }

  /**
   * @param {string} commandLine
   */
  async runCommandLine(commandLine) {
    this._view.update('terminalState', {
      type: 'running',
      commandLine,
      history: this._view.component.terminalState.history,
    });

    try {
      const { success, result } = await this._kvClient.sendCommandLine(commandLine);

      this._view.update('terminalState', {
        type: 'idle',
        history: this._view.component.terminalState.history.concat({ commandLine, result, success }),
      });
    } catch (e) {
      this._view.update('terminalState', {
        type: 'idle',
        history: this._view.component.terminalState.history.concat({
          commandLine,
          result: [getErrorMessage(e)],
          success: false,
        }),
      });

      const errorCode = getErrorCode(e);
      if (errorCode === 'clever.redis-http.unknown-command' || errorCode === 'clever.redis-http.bad-command-format') {
        throw e;
      }
    }
  }

  clear() {
    this._view.update('terminalState', {
      type: 'idle',
      history: [],
    });
  }
}

/**
 * @param {{responseBody?: { code?: string}}} e
 * @return {string | null} e
 */
function getErrorCode(e) {
  return e?.responseBody?.code;
}

/**
 * @param {{responseBody?: { message?: string}}} e
 * @return {string | null} e
 */
function getErrorMessage(e) {
  return e?.responseBody?.message;
}
