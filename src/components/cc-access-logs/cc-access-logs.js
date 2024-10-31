import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconRemixFullscreenExitLine as fullscreenExitIcon,
  iconRemixFullscreenLine as fullscreenIcon,
  iconRemixPauseLine,
  iconRemixPlayLine,
} from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../translations/translation.js';
import '../cc-datetime-relative/cc-datetime-relative.js';
import '../cc-icon/cc-icon.js';
import '../cc-loader/cc-loader.js';
import '../cc-logs-control/cc-logs-control.js';
import '../cc-logs-date-range-selector/cc-logs-date-range-selector.js';
import { dateRangeSelectionToDateRange } from '../cc-logs-date-range-selector/date-range-selection.js';
import '../cc-logs-instances/cc-logs-instances.js';
import '../cc-logs-message-filter/cc-logs-message-filter.js';
import '../cc-notice/cc-notice.js';
import '../cc-toggle/cc-toggle.js';

/** @type {{[k in 'ip'|'country'|'city'|'method'|'status']: MetadataRenderer}} */
const CUSTOM_METADATA_RENDERERS = {
  ip: {
    size: 15,
  },
  country: {
    size: 2,
  },
  city: (metadata) => {
    const size = 12;

    let value = metadata.value;
    if (metadata.value.length > size) {
      value = metadata.value.substring(0, size - 1) + '.';
    }

    return {
      text: value,
      size: size,
    };
  },
  method: (metadata) => {
    return {
      text: metadata.value.toUpperCase(),
      size: 7,
    };
  },
  status: (metadata) => {
    /**
     * @return {MetadataIntent}
     */
    function getIntent() {
      const statusCode = Number(metadata.value);
      if (statusCode >= 500) {
        return 'danger';
      }
      if (statusCode >= 400) {
        return 'warning';
      }
      if (statusCode >= 300) {
        return 'info';
      }
      if (statusCode >= 200) {
        return 'success';
      }

      return 'neutral';
    }

    return {
      intent: getIntent(),
      text: metadata.value,
    };
  },
};

/**
 * @typedef {import('../cc-logs-control/cc-logs-control.js').CcLogsControl} CcLogsControl
 * @typedef {import('../cc-logs-control/cc-logs-control.types.js').LogsControlOption} LogsControlOption
 * @typedef {import('../cc-logs-control/cc-logs-control.types.js').LogsMetadataDisplay} LogsMetadataDisplay
 * @typedef {import('../cc-logs-instances/cc-logs-instances.types.js').LogsInstancesState} LogsInstancesState
 * @typedef {import('./cc-access-logs.types.js').AccessLogsState} AccessLogsState
 * @typedef {import('./cc-access-logs.types.js').AccessLogsOptions} AccessLogsOptions
 * @typedef {import('./cc-access-logs.types.js').ProgressState} ProgressState
 * @typedef {import('../cc-logs/cc-logs.types.js').Log} Log
 * @typedef {import('../cc-logs/cc-logs.types.js').MetadataRenderer} MetadataRenderer
 * @typedef {import('../cc-logs/cc-logs.types.js').MetadataIntent} MetadataIntent
 * @typedef {import('../cc-logs-date-range-selector/cc-logs-date-range-selector.types.js').LogsDateRangeSelection} LogsDateRangeSelection
 * @typedef {import('../cc-logs-date-range-selector/cc-logs-date-range-selector.types.js').LogsDateRangeSelectionChangeEventData} LogsDateRangeSelectionChangeEventData
 * @typedef {import('../cc-logs-message-filter/cc-logs-message-filter.types.js').LogsMessageFilterValue} LogsMessageFilterValue
 * @typedef {import('lit/directives/ref.js').Ref<CcLogsControl>} RefCcLogsControl
 * @typedef {import('lit').PropertyValues<CcAccessLogs>} PropertyValues
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 */

/**
 *
 * @fires {CustomEvent<void>} cc-logs-application-view:pause - Fires when the pause button is clicked.
 * @fires {CustomEvent<void>} cc-logs-application-view:resume - Fires when the resume button is clicked.
 *
 * @beta
 */
export class CcAccessLogs extends LitElement {
  static get properties() {
    return {
      dateRangeSelection: { type: Object, attribute: 'date-range-selection' },
      limit: { type: Number },
      options: { type: Object },
      overflowWatermarkOffset: { type: Number, attribute: 'overflow-watermark-offset' },
      state: { type: Object },
      _messageFilter: { type: Object, state: true },
      _overflowDecision: { type: String, state: true },
      _fullscreen: { type: Boolean, state: true },
    };
  }

  constructor() {
    super();

    /** @type {LogsDateRangeSelection} The date range selection. */
    this.dateRangeSelection = {
      type: 'live',
    };

    /** @type {number|null} The maximum number of logs to display. `null` for no limit. */
    this.limit = 1000;

    /** @type {AccessLogsOptions} The logs options. */
    this.options = {
      'date-display': 'datetime-iso',
      palette: 'default',
      timezone: 'UTC',
    };

    /** @type {number|null} The number of logs before the limit from which the user will be asked to accept or discard logs limit overflow */
    this.overflowWatermarkOffset = 10;

    /** @type {AccessLogsState} The state of the component */
    this.state = {
      type: 'connectingLogs',
    };

    /** @type {RefCcLogsControl} */
    this._logsRef = createRef();

    this._loadingProgressCtrl = new LoadingProgressController(this);

    /** @type {LogsMessageFilterValue} */
    this._messageFilter = { value: '', mode: 'loose' };

    /** @type {'none'|'accepted'|'discarded'} */
    this._overflowDecision = 'none';

    this._fullscreen = false;
  }

  /* region Public methods */

  /**
   * @param {Array<Log>} logs
   */
  appendLogs(logs) {
    if (logs == null || logs.length <= 0) {
      return;
    }

    if (this.state.type === 'receivingLogs') {
      this._logsRef.value.appendLogs(logs);
      this._loadingProgressCtrl.progress(logs);
    }
  }

  clear() {
    this._logsRef.value?.clear();
    this._loadingProgressCtrl.reset();
  }

  /* endregion */

  /* region Private methods */

  /**
   * @return {string}
   */
  _getLoadingProgressTitle() {
    if (this._loadingProgressCtrl.state === 'completed') {
      return i18n('cc-logs-application-view.progress.loaded');
    }

    if (this._loadingProgressCtrl.percent == null) {
      return i18n('cc-logs-application-view.progress.loading.live');
    }

    return i18n('cc-logs-application-view.progress.loading', { percent: this._loadingProgressCtrl.percent / 100 });
  }

  /* endregion */

  /* region Event handlers */

  /**
   * @param {CustomEvent<LogsDateRangeSelectionChangeEventData>} event
   */
  _onDateRangeSelectionChange(event) {
    this._loadingProgressCtrl.cancel();
    this.dateRangeSelection = event.detail.selection;
    this._overflowDecision = 'none';
  }

  /**
   * @param {Object} event
   * @param {LogsControlOption} event.detail
   */
  _onLogsOptionChange({ detail }) {
    this.options = {
      ...this.options,
      [detail.name]: detail.value,
    };

    dispatchCustomEvent(this, 'options-change', this.options);
  }

  _onFullscreenToggle() {
    this._fullscreen = !this._fullscreen;
  }

  _onPause() {
    dispatchCustomEvent(this, 'pause');
  }

  _onResume() {
    dispatchCustomEvent(this, 'resume');
  }

  _onOverflowWatermarkReached() {
    if (this._overflowDecision === 'none') {
      dispatchCustomEvent(this, 'pause');
    }
  }

  _onAcceptOverflow() {
    this._overflowDecision = 'accepted';
    dispatchCustomEvent(this, 'resume');
  }

  _onDiscardOverflow() {
    this._overflowDecision = 'discarded';
    this.dateRangeSelection = {
      type: 'custom',
      since: dateRangeSelectionToDateRange(this.dateRangeSelection).since,
      until: this._loadingProgressCtrl.lastLogDate.toISOString(),
    };
  }

  /**
   * @param {CustomEvent<LogsMessageFilterValue>} event
   */
  _onMessageFilterInput(event) {
    this._messageFilter = event.detail;
  }

  /* endregion */

  /**
   * @param {PropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    const stateTypeWillChange =
      changedProperties.has('state') && changedProperties.get('state')?.type !== this.state.type;

    if (stateTypeWillChange) {
      if (this.state.type === 'errorLogs') {
        this._loadingProgressCtrl.reset();
      } else if (this.state.type === 'connectingLogs') {
        this._loadingProgressCtrl.init(this.dateRangeSelection);
      } else if (this.state.type === 'receivingLogs') {
        this._loadingProgressCtrl.start();
      } else if (this.state.type === 'logStreamPaused') {
        this._loadingProgressCtrl.pause();
      } else if (this.state.type === 'logStreamEnded') {
        this._loadingProgressCtrl.complete();
      }
    }
  }

  render() {
    const overlay = {
      overlay: true,
      fullscreen: this._fullscreen,
    };
    const wrapper = {
      wrapper: true,
      fullscreen: this._fullscreen,
    };
    return html`
      <div class=${classMap(overlay)}>
        <div class=${classMap(wrapper)}>
          <div class="left">${this._renderDateRangeSelection()} ${this._renderLoadingProgress()}</div>

          <div class="logs-wrapper">${this._renderLogs()}</div>
        </div>
      </div>
    `;
  }

  _renderDateRangeSelection() {
    return html`
      <cc-logs-date-range-selector-beta
        .value=${this.dateRangeSelection}
        @cc-logs-date-range-selector:change=${this._onDateRangeSelectionChange}
      ></cc-logs-date-range-selector-beta>
    `;
  }

  /**
   * @return {TemplateResult|null}
   */
  _renderLoadingProgress() {
    if (this._loadingProgressCtrl.value === 0) {
      return null;
    }

    const shouldAskForOverflowDecision =
      this._overflowDecision === 'none' && this._loadingProgressCtrl.overflowWatermarkReached;
    const shouldDisplayPauseResumeControls =
      !shouldAskForOverflowDecision &&
      (this._loadingProgressCtrl.state === 'running' || this._loadingProgressCtrl.state === 'paused');
    const shouldDisplayOverflowWarning = !shouldAskForOverflowDecision && this._loadingProgressCtrl.overflowing;

    const getPlayPauseButton = () => {
      if (!shouldDisplayPauseResumeControls) {
        return null;
      }
      if (this._loadingProgressCtrl.state === 'running') {
        return {
          icon: iconRemixPauseLine,
          a11yName: i18n('cc-logs-application-view.progress.pause'),
          onclick: this._onPause,
        };
      }
      if (this._loadingProgressCtrl.state === 'paused') {
        return {
          icon: iconRemixPlayLine,
          a11yName: i18n('cc-logs-application-view.progress.resume'),
          onclick: this._onResume,
        };
      }
      return null;
    };

    const playPauseButton = getPlayPauseButton();

    return html`
      <div class="logs-loading-state">
        <div class="loading-state-heading">
          <div class="loading-state-title">${this._getLoadingProgressTitle()}</div>

          ${playPauseButton != null
            ? html`
                <cc-button
                  .icon=${playPauseButton.icon}
                  hide-text
                  a11y-name=${playPauseButton.a11yName}
                  @cc-button:click=${playPauseButton.onclick}
                ></cc-button>
              `
            : ''}
        </div>
        ${this._loadingProgressCtrl.percent != null
          ? html`
              <div class="progress-bar">
                <div class="progress-bar-track" style="width: ${this._loadingProgressCtrl.percent}%;"></div>
              </div>
            `
          : ''}
        <div class="loading-state-content">
          <div class="loading-state-text">
            ${i18n('cc-logs-application-view.progress.message', { count: this._loadingProgressCtrl.value })}
          </div>

          ${shouldAskForOverflowDecision
            ? html`
                <cc-notice intent="info" heading="${i18n('cc-logs-application-view.progress.overflow.title')}">
                  <div slot="message">
                    ${i18n('cc-logs-application-view.progress.overflow.message.almost', { limit: this.limit })}
                    <div class="overflow-control">
                      <cc-button link @cc-button:click=${this._onAcceptOverflow}>
                        ${i18n('cc-logs-application-view.progress.overflow.continue')}
                      </cc-button>
                      <cc-button link @cc-button:click=${this._onDiscardOverflow}>
                        ${i18n('cc-logs-application-view.progress.overflow.stop')}
                      </cc-button>
                    </div>
                  </div>
                </cc-notice>
              `
            : ''}
          ${shouldDisplayOverflowWarning
            ? html`
                <cc-notice intent="info" no-icon>
                  <div slot="message">
                    ${i18n('cc-logs-application-view.progress.overflow.message', { limit: this.limit })}
                  </div>
                </cc-notice>
              `
            : ''}
        </div>
      </div>
    `;
  }

  /**
   * @return {TemplateResult}
   */
  _renderLogs() {
    if (this.state.type === 'errorLogs') {
      return html`
        <div class="center-logs-wrapper">
          <cc-notice slot="header" intent="warning" message=${i18n('cc-logs-application-view.logs.error')}></cc-notice>
        </div>
      `;
    }

    return html`
      <cc-logs-control-beta
        ${ref(this._logsRef)}
        class="logs"
        follow
        limit="${this.limit}"
        .dateDisplay=${this.options['date-display']}
        .messageFilter=${this._messageFilter.value}
        .messageFilterMode=${this._messageFilter.mode}
        .metadataRenderers=${CUSTOM_METADATA_RENDERERS}
        .palette=${this.options.palette}
        .timezone=${this.options.timezone}
        @cc-logs-control:option-change=${this._onLogsOptionChange}
      >
        <div slot="header" class="logs-header">
          <cc-logs-message-filter-beta
            class="logs-message-filter"
            .filter=${this._messageFilter}
            @cc-logs-message-filter:input=${this._onMessageFilterInput}
          ></cc-logs-message-filter-beta>

          <cc-button
            class="header-fullscreen-button"
            .icon=${this._fullscreen ? fullscreenExitIcon : fullscreenIcon}
            a11y-name=${this._fullscreen
              ? i18n('cc-logs-application-view.fullscreen.exit')
              : i18n('cc-logs-application-view.fullscreen')}
            hide-text
            @cc-button:click=${this._onFullscreenToggle}
          ></cc-button>
        </div>
      </cc-logs-control-beta>

      ${this._loadingProgressCtrl.state === 'completed' && this._loadingProgressCtrl.value === 0
        ? html`
            <div class="overlay-logs-wrapper">
              <cc-notice
                intent="info"
                heading=${i18n('cc-logs-application-view.logs.warning.no-logs.title')}
                message=${i18n('cc-logs-application-view.logs.warning.no-logs.message')}
              ></cc-notice>
            </div>
          `
        : ''}
      ${this._loadingProgressCtrl.state === 'init' || this._loadingProgressCtrl.state === 'started'
        ? html`
            <div class="overlay-logs-wrapper">
              <cc-notice intent="info" no-icon>
                <div class="overlay-logs-wrapper--loader" slot="message">
                  <cc-loader></cc-loader>
                  <span>${i18n('cc-logs-application-view.logs.loading')}</span>
                </div>
              </cc-notice>
            </div>
          `
        : ''}
      ${this._loadingProgressCtrl.state === 'waiting'
        ? html`
            <div class="overlay-logs-wrapper">
              <cc-notice
                intent="info"
                heading=${i18n('cc-logs-application-view.logs.warning.waiting.title')}
                message=${i18n('cc-logs-application-view.logs.warning.waiting.message')}
              ></cc-notice>
            </div>
          `
        : ''}
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        /* stylelint-disable no-duplicate-selectors */
        :host {
          display: block;
        }

        .overlay {
          display: flex;
          height: 100%;
        }

        .overlay.fullscreen {
          backdrop-filter: blur(5px);
          bottom: 0;
          left: 0;
          position: fixed;
          right: 0;
          top: 0;
          z-index: 999;
        }

        .wrapper {
          display: flex;
          flex: 1;
          gap: 0.5em;
        }

        .wrapper.fullscreen {
          background-color: var(--cc-color-bg-default);
          border: 1px solid var(--cc-color-border-neutral);
          border-radius: var(--cc-border-radius-default);
          margin: 1em;
          padding: 1em;
        }

        .left {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          height: 100%;
          width: 18em;
        }

        .cc-logs-instances {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          flex: 1;
        }

        .logs-loading-state {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
        }

        .loading-state-heading {
          align-items: center;
          background-color: var(--cc-color-bg-neutral, #eee);
          border-top-left-radius: var(--cc-border-radius-default, 0.25em);
          border-top-right-radius: var(--cc-border-radius-default, 0.25em);
          display: flex;
          gap: 0.3em;
          max-height: 2em;
          padding: 0.5em;
        }

        .loading-state-title {
          color: var(--cc-color-text-default, #000);
          flex: 1;
          font-weight: bold;
        }

        .loading-state-content {
          color: var(--cc-color-text-weak);
          display: flex;
          flex-direction: column;
          gap: 1em;
          padding: 1em;
        }

        .progress-bar {
          background-color: var(--cc-color-bg-primary-weak);
          height: 0.2em;
          overflow: hidden;
          width: 100%;
        }

        .progress-bar-track {
          background-color: var(--cc-color-bg-primary);
          height: 100%;
        }

        .progress-bar-track.indeterminate {
          animation: indeterminate-animation 1s infinite linear;
          transform-origin: 0 50%;
          width: 100%;
        }

        .overflow-control {
          display: flex;
          gap: 1.5em;
        }

        @keyframes indeterminate-animation {
          0% {
            transform: translateX(0) scaleX(0);
          }

          40% {
            transform: translateX(0) scaleX(0.4);
          }

          100% {
            transform: translateX(100%) scaleX(0.5);
          }
        }

        .logs-wrapper {
          flex: 1;
          position: relative;
        }

        .logs {
          height: 100%;
        }

        .logs-header {
          align-items: center;
          display: flex;
          gap: 1em;
          width: 100%;
        }

        .logs-message-filter {
          flex: 1;
        }

        .center-logs-wrapper {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: 100%;
          justify-content: center;
        }

        .overlay-logs-wrapper {
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .overlay-logs-wrapper--loader {
          align-items: center;
          display: flex;
          gap: 0.5em;
        }

        .overlay-logs-wrapper--loader cc-loader {
          height: 1.5em;
          width: 1.5em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-access-logs-beta', CcAccessLogs);

/**
 * State:
 * * `none`: No progression yet, reset state
 * * 'init': The dateRange has been set and the progress is ready to start
 * * 'started': The progress has been started (but no logs have been received yet)
 * * 'waiting': The progress has been started since a long time and no logs have been received yet (this state is used only on live mode)
 * * 'running': The progress is running: some logs are being received
 * * 'paused': The progress is on pause
 * * 'completed': The progress is completed
 */
class LoadingProgressController {
  /**
   *
   * @param {CcAccessLogs} host
   */
  constructor(host) {
    this._host = host;
    this._debug = true;
    this.reset(false);
  }

  reset(requestUpdate = true) {
    this._dateRange = null;
    this._isLive = false;
    this._dateRangeStart = null;
    this._dateRangeDuration = null;
    this._lastLogDate = null;
    /** @type {ProgressState} */
    this._state = 'none';
    this._percent = 0;
    this._value = 0;
    this._clearWaitingTimeout();

    if (requestUpdate) {
      this._host.requestUpdate();
    }
  }

  /**
   * @param {LogsDateRangeSelection} dateRangeSelection
   */
  init(dateRangeSelection) {
    this.reset();

    this._dateRange = dateRangeSelectionToDateRange(dateRangeSelection);
    this._step('init', {
      none: () => {
        this._isLive = dateRangeSelection.type === 'live';
        this._dateRangeStart = new Date(this._dateRange.since).getTime();
        this._dateRangeDuration = this._isLive ? 0 : new Date(this._dateRange.until).getTime() - this._dateRangeStart;

        console.log(this._dateRange);

        return 'init';
      },
    });
  }

  start() {
    this._step('start', {
      none: () => {
        return 'none';
      },
      paused: () => {
        return 'running';
      },
      init: () => {
        this._waitingTimeoutId = setTimeout(() => {
          this._step('nothingReceived', {
            started: () => {
              console.log(this._isLive);
              return this._isLive ? 'waiting' : 'completed';
            },
          });
        }, 2000);
        return 'started';
      },
    });
  }

  /**
   *
   * @param {Array<Log>} logs
   */
  progress(logs) {
    if (logs.length === 0) {
      return;
    }

    const doProgress = () => {
      this._value = this._value + logs.length;
      this._lastLogDate = logs[logs.length - 1].date;

      if (!this._isLive) {
        const timeProgress = this._lastLogDate.getTime() - this._dateRangeStart;
        this._percent = (100 * timeProgress) / this._dateRangeDuration;
      }

      if (this.overflowWatermarkReached) {
        this._host._onOverflowWatermarkReached();
      }
    };

    this._step('progress', {
      started: () => {
        this._clearWaitingTimeout();
        doProgress();
        return 'running';
      },
      waiting: () => {
        doProgress();
        return 'running';
      },
      running: () => {
        doProgress();
        return 'running';
      },
      completed: () => {
        doProgress();
        return 'running';
      },
    });
  }

  pause() {
    this._step('pause', {
      running: () => {
        return 'paused';
      },
    });
  }

  complete() {
    this._step('complete', {
      none: () => {
        return 'none';
      },
      init: () => {
        return 'init';
      },
      started: () => {
        this._clearWaitingTimeout();
        this._percent = 100;
        return 'completed';
      },
      '*': () => {
        this._percent = 100;
        return 'completed';
      },
    });
  }

  cancel() {
    this._step('cancel', {
      '*': () => {
        this.reset();
        return 'none';
      },
    });
  }

  /**
   * @return {ProgressState}
   */
  get state() {
    return this._state;
  }

  /**
   * @return {number|null}
   */
  get percent() {
    return this._isLive ? null : this._percent;
  }

  /**
   * @return {number}
   */
  get value() {
    return this._value;
  }

  /**
   * @return {boolean}
   */
  get overflowing() {
    return this._value > this._host.limit;
  }

  /**
   * @return {boolean}
   */
  get overflowWatermarkReached() {
    return this._value >= this._host.limit - this._host.overflowWatermarkOffset;
  }

  /**
   * @return {Date}
   */
  get lastLogDate() {
    return this._lastLogDate;
  }

  _clearWaitingTimeout() {
    if (this._waitingTimeoutId != null) {
      clearTimeout(this._waitingTimeoutId);
      this._waitingTimeoutId = null;
    }
  }

  /**
   * @param {string} actionName
   * @param {Partial<{[state in ProgressState|'*']: () => ProgressState|null}>} machine
   */
  _step(actionName, machine) {
    this._log(`ACTION<${actionName}> from STATE<${this._state}>`);

    const step = machine[this._state] ?? machine['*'];

    if (step == null) {
      console.warn(`progressCtrl: ACTION<${actionName}>: no step walker found from state ${this._state}`);
      return;
    }

    const newState = step();

    if (newState != null) {
      const oldState = this._state;
      if (newState !== oldState) {
        this._state = newState;
      }
      this._host.requestUpdate();

      this._log(`STATE<${oldState}> -> STATE<${this._state}>`);
    }
  }

  /**
   * @param {string} message
   */
  _log(message) {
    if (this._debug) {
      console.log(`progressCtrl: ${message}`);
    }
  }
}
