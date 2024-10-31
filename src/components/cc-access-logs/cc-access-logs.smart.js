// @ts-expect-error FIXME: remove when clever-client exports types
import { ApplicationAccessLogStream } from '@clevercloud/client/esm/streams/access-logs.js';
// @ts-expect-error FIXME: remove when clever-client exports types
import { HttpError } from '@clevercloud/client/esm/streams/clever-cloud-sse.js';
import { Buffer } from '../../lib/buffer.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { dateRangeSelectionToDateRange } from '../cc-logs-date-range-selector/date-range-selection.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-access-logs.js';

/**
 * @typedef {import('./cc-access-logs.types.js').AccessLogsState} AccessLogsState
 * @typedef {import('../cc-logs-date-range-selector/cc-logs-date-range-selector.types.js').LogsDateRangeSelection} LogsDateRangeSelection
 * @typedef {import('../cc-logs-date-range-selector/cc-logs-date-range-selector.types.js').LogsDateRangeSelectionChangeEventData} LogsDateRangeSelectionChangeEventData
 * @typedef {import('../../lib/date/date-range.types.js').DateRange} DateRange
 * @typedef {import('../cc-logs/cc-logs.types.js').Log} Log
 * @typedef {import('./cc-access-logs.js').CcAccessLogs} CcAccessLogs
 * @typedef {import('../../lib/send-to-api.types.js').ApiConfig} ApiConfig
 */

/**
 * @typedef {Object} View
 * @property {CcAccessLogs} component
 * @property {function} update
 * @property {(state: AccessLogsState|((state: AccessLogsState) => void)) => void} updateState
 */

/**
 * @typedef {Object} ApplicationRef
 * @property {string} ownerId
 * @property {string} applicationId
 */

/**
 * @typedef {Object} LogsStreamParams
 * @property {ApplicationRef} applicationRef
 * @property {string} since
 * @property {string} until
 */

/**
 * @typedef {Object} LogsStreamCallbacks
 * @property {() => void} onOpen
 * @property {(log: Object) => void} onLog
 * @property {(error: Error) => void} onFatalError
 * @property {(error: Error) => void} onError
 * @property {(reason: string) => void} onFinish
 */

const LOGS_BUFFER_TIMEOUT = 1000;
const LOGS_BUFFER_LENGTH = 10;
const LOGS_THROTTLE_ELEMENTS = 2000;
const LOGS_THROTTLE_PER_IN_MILLIS = 100;

/**
 * @type {AccessLogsSmartController}
 */
let controller = null;

defineSmartComponent({
  selector: 'cc-access-logs-beta',
  params: {
    apiConfig: { type: Object },
    ownerId: { type: String },
    appId: { type: String },
    dateRangeSelection: { type: Object, optional: true },
  },
  /**
   * @param {Object} settings
   * @param {CcAccessLogs} settings.component
   * @param {{apiConfig: ApiConfig, ownerId: string, appId: string, dateRangeSelection: LogsDateRangeSelection}} settings.context
   * @param {(type: string, listener: (detail: any) => void) => void} settings.onEvent
   * @param {function} settings.updateComponent
   * @param {AbortSignal} settings.signal
   */
  // @ts-expect-error FIXME: remove once `onContextUpdate` is type with generics
  onContextUpdate({ component, context, onEvent, updateComponent, signal }) {
    signal.onabort = () => {
      controller?.stopAndClear();
    };

    controller?.stopAndClear();

    component.overflowWatermarkOffset = LOGS_THROTTLE_PER_IN_MILLIS;

    const { apiConfig, ownerId, appId, dateRangeSelection } = context;

    controller = new AccessLogsSmartController(
      apiConfig,
      { ownerId, applicationId: appId },
      {
        component,
        update: updateComponent,
        updateState: (arg) => updateComponent('state', arg),
      },
    );

    onEvent(
      'cc-logs-date-range-selector:change',
      /** @param {LogsDateRangeSelectionChangeEventData} eventData */
      (eventData) => {
        controller.changeDateRange(eventData.range);
      },
    );

    onEvent('cc-access-logs:pause', () => {
      controller.pause();
    });

    onEvent('cc-access-logs:resume', () => {
      controller.resume();
    });

    controller.init(dateRangeSelection ?? { type: 'live' });
  },
});

class AccessLogsSmartController {
  /**
   *
   * @param {ApiConfig} apiConfig
   * @param {ApplicationRef} applicationRef
   * @param {View} view
   */
  constructor(apiConfig, applicationRef, view) {
    this._apiConfig = apiConfig;
    this._applicationRef = applicationRef;
    this._view = view;
    this._logsBuffer = new Buffer(this._onLogsBufferFlush.bind(this), {
      timeout: LOGS_BUFFER_TIMEOUT,
      length: LOGS_BUFFER_LENGTH,
    });

    /** @type {LogsStream} */
    this._logsStream = null;

    /** @type {DateRange} */
    this._dateRange = null;
  }

  /**
   * @param {LogsDateRangeSelection} dateRangeSelection
   */
  init(dateRangeSelection) {
    this._view.component.dateRangeSelection = dateRangeSelection;
    const dateRange = dateRangeSelectionToDateRange(this._view.component.dateRangeSelection);
    this._setDateRange(dateRange);
  }

  /**
   * @param {DateRange} dateRange
   */
  changeDateRange(dateRange) {
    this._stopAndClearLogs();
    this._setDateRange(dateRange);
  }

  stopAndClear() {
    this._stopAndClearLogs();
  }

  pause() {
    this._logsStream?.pause();
    this._view.updateState((state) => {
      state.type = 'logStreamPaused';
    });
  }

  resume() {
    this._logsStream?.resume();
    this._view.updateState((state) => {
      state.type = 'receivingLogs';
    });
  }

  /**
   * @param {DateRange} dateRange
   */
  _setDateRange(dateRange) {
    // store the new date range
    this._dateRange = dateRange;

    // open the logs stream
    this._openLogsStream();
  }

  _stopAndClearLogs() {
    this._logsStream?.close();
    this._logsBuffer.clear();
    this._view.component.clear();
  }

  _openLogsStream() {
    this._view.updateState({
      type: 'connectingLogs',
    });
    this._logsStream = new LogsStream(
      this._apiConfig,
      {
        applicationRef: this._applicationRef,
        since: this._dateRange.since,
        until: this._dateRange.until,
      },
      {
        onOpen: () => {
          this._view.updateState((state) => {
            state.type = 'receivingLogs';
          });
        },
        onLog: async (log) => {
          this._logsBuffer.add(this._convertLog(log));
        },
        onFatalError: (e) => {
          if (e instanceof HttpError && e.status === 404) {
            this._view.updateState({
              type: 'logStreamEnded',
            });

            return;
          }

          console.error(e);
          this._view.updateState((state) => {
            state.type = 'errorLogs';
          });
        },
        onError: (e) => {
          console.error(e);
          // TODO: tell the component about the instability
        },
        onFinish: async (reason) => {
          console.log(reason);
          await this._logsBuffer.flush();
          if (reason !== 'USER_CLOSE') {
            this._view.updateState({
              type: 'logStreamEnded',
            });
          }
        },
      },
    );

    this._logsStream.open();
  }

  /**
   * @param {Array<Log>} logs
   */
  _onLogsBufferFlush(logs) {
    this._view.component.appendLogs(logs);
  }

  /**
   * @param {any} log
   * @return {Log}
   */
  _convertLog(log) {
    const { id, date, http, source } = log;

    if (http == null) {
      console.log(log);
    }

    const country = source.countryCode ?? '??';

    return {
      id: id,
      date: new Date(date),
      message: http.request.path,
      metadata: [
        { name: 'ip', value: source.ip },
        { name: 'country', value: country },
        { name: 'city', value: source.city ?? '??' },
        { name: 'method', value: http.request.method },
        { name: 'status', value: http.response.statusCode },
      ],
    };
  }
}

class LogsStream {
  /**
   *
   * @param {ApiConfig} apiConfig
   * @param {LogsStreamParams} params
   * @param {LogsStreamCallbacks} callbacks
   */
  constructor(apiConfig, params, callbacks) {
    /** @type {ApplicationAccessLogStream} */
    this._logsStream = null;
    this._apiConfig = apiConfig;
    /** @type {LogsStreamParams} */
    this._params = params;
    /** @type {LogsStreamCallbacks} */
    this._callbacks = callbacks;
  }

  open() {
    if (this._logsStream != null) {
      throw new Error('Already opened');
    }

    this._logsStream = new ApplicationAccessLogStream({
      apiHost: this._apiConfig.API_HOST,
      tokens: this._apiConfig,
      ownerId: this._params.applicationRef.ownerId,
      appId: this._params.applicationRef.applicationId,
      since: this._params.since,
      until: this._params.until,
      retryConfiguration: {
        enabled: true,
        maxRetryCount: 10,
      },
      throttleElements: LOGS_THROTTLE_ELEMENTS,
      throttlePerInMilliseconds: LOGS_THROTTLE_PER_IN_MILLIS,
    })
      .on('open', this._callbacks.onOpen)
      .onLog(this._callbacks.onLog)
      .on(
        'error',
        /** @param {{error: Error}} event */
        (event) => {
          // This is not a fatal error, the logs stream will retry.
          if (this._logsStream.retryCount >= 3) {
            this._callbacks.onError(event.error);
          }
        },
      );
    this._logsStream
      .start()
      .then(
        /** @param {{reason: string}} event */
        (event) => {
          this._callbacks.onFinish(event.reason);
          this._logsStream = null;
        },
      )
      .catch(
        /** @param {Error} error */
        (error) => {
          this._callbacks.onFatalError(error);
          this._logsStream = null;
        },
      );
  }

  pause() {
    this._logsStream.pause();
  }

  resume() {
    this._logsStream.resume();
  }

  close() {
    if (this._logsStream == null) {
      return;
    }
    // todo: reason
    this._logsStream.close('USER_CLOSE');
    this._logsStream = null;
  }
}
