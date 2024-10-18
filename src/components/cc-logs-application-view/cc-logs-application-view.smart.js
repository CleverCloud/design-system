import { getAllInstances, getDeployment } from '@clevercloud/client/esm/api/v2/application.js';
import { pickNonNull } from '@clevercloud/client/esm/pick-non-null.js';
import { ApplicationLogStream } from '@clevercloud/client/esm/streams/application-logs.js';
import { HttpError } from '@clevercloud/client/esm/streams/clever-cloud-sse.js';
import { Buffer } from '../../lib/buffer.js';
import { isLive, lastXDays } from '../../lib/date/date-range-utils.js';
import { defineSmartComponent } from '../../lib/define-smart-component.js';
import { sendToApi } from '../../lib/send-to-api.js';
import { unique } from '../../lib/utils.js';
import { dateRangeSelectionToDateRange } from '../cc-logs-date-range-selector/date-range-selection.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-logs-application-view.js';

/**
 * @typedef {import('../cc-logs-instances/cc-logs-instances.types.js').Instance} Instance
 * @typedef {import('../cc-logs-instances/cc-logs-instances.types.js').GhostInstance} GhostInstance
 * @typedef {import('../cc-logs-instances/cc-logs-instances.types.js').Deployment} Deployment
 * @typedef {import('./cc-logs-application-view.types.js').LogsApplicationViewState} LogsApplicationViewState
 * @typedef {import('./cc-logs-application-view.types.js').LogsApplicationViewStateLogs} LogsApplicationViewStateLogs
 * @typedef {import('../cc-logs-date-range-selector/cc-logs-date-range-selector.types.js').LogsDateRangeSelection} LogsDateRangeSelection
 * @typedef {import('../cc-logs-date-range-selector/cc-logs-date-range-selector.types.js').LogsDateRangeSelectionChangeEventData} LogsDateRangeSelectionChangeEventData
 * @typedef {import('../../lib/date/date-range.types.js').DateRange} DateRange
 * @typedef {import('./cc-logs-application-view.js').CcLogsApplicationView} CcLogsApplicationView
 */

/**
 * @typedef {Object} View
 * @property {CcLogsApplicationView} component
 * @property {(propertyName: string, newProperty: any|((property:any) => void)) => void} update
 * @property {(state: LogsApplicationViewState|((state: LogsApplicationViewState) => void)) => void} updateState
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
 * @property {Array<string>} instances
 */

/**
 * @typedef {Object} LogsStreamCallbacks
 * @property {() => void} onOpen
 * @property {(log: Object) => void} onLog
 * @property {(error: Error) => void} onFatalError
 * @property {(error: Error) => void} onError
 * @property {(reason: string) => void} onFinish
 */

const INSTANCES_REFRESH_RATE = 2000;
const LOGS_BUFFER_TIMEOUT = 1000;
const LOGS_BUFFER_LENGTH = 10;
const LOGS_THROTTLE_ELEMENTS = 1000;
const LOGS_THROTTLE_PER_IN_MILLIS = 10;

/**
 * @type {LogsApplicationViewSmartController}
 */
let controller = null;

defineSmartComponent({
  selector: 'cc-logs-application-view-beta',
  params: {
    apiConfig: { type: Object },
    ownerId: { type: String },
    appId: { type: String },
    deploymentId: { type: String, optional: true },
    dateRangeSelection: { type: Object, optional: true },
  },
  /**
   * @param {Object} args
   * @param {CcLogsApplicationView} args.component
   * @param {Object} args.context
   * @param {any} args.onEvent
   * @param {any} args.updateComponent
   * @param {AbortSignal} args.signal
   */
  onContextUpdate({ component, context, onEvent, updateComponent, signal }) {
    signal.onabort = () => {
      controller?.stopAndClear();
    };

    controller?.stopAndClear();

    component.overflowWatermarkOffset = LOGS_THROTTLE_PER_IN_MILLIS;

    const { apiConfig, ownerId, appId, deploymentId, dateRangeSelection } = context;

    controller = new LogsApplicationViewSmartController(
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
        controller.setNewDateRange(eventData.range);
      },
    );

    onEvent(
      'cc-logs-application-view:instance-selection-change',
      /** @param {Array<string>} instances */
      (instances) => {
        controller.setNewInstanceSelection(instances);
      },
    );

    onEvent('cc-logs-application-view:pause', () => {
      controller.pause();
    });

    onEvent('cc-logs-application-view:resume', () => {
      controller.resume();
    });

    if (deploymentId != null) {
      controller.initByDeploymentId(deploymentId);
    } else if (dateRangeSelection != null) {
      controller.initByDateRangeSelection(dateRangeSelection);
    } else {
      controller.initByLastDeployment();
    }
  },
});

class LogsApplicationViewSmartController {
  /**
   *
   * @param {Object} apiConfig
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
    this._instancesManager = new InstancesManager(
      new Api(apiConfig, applicationRef),
      this._onInstancesChanged.bind(this),
    );

    /** @type {Array<string>} */
    this._selection = [];
    /** @type {DateRange} */
    this._dateRange = null;
  }

  openLogsStream() {
    this._stopAndClearLogs();

    this._view.updateState({
      type: 'connectingLogs',
      instances: this._instancesManager.getInstances(),
      selection: this._selection,
    });

    // ---- Optimization to be done by the API.
    const optimizedRange = this._optimizeLogsStreamParameters();
    // ----

    this._logsStream = new LogsStream(
      this._apiConfig,
      {
        applicationRef: this._applicationRef,
        since: optimizedRange.since,
        until: optimizedRange.until,
        instances: this._selection,
      },
      {
        onOpen: () => {
          this._view.updateState((state) => {
            state.type = 'receivingLogs';
          });
        },
        onLog: async (log) => {
          this._logsBuffer.add(await this._convertLog(log));
        },
        onFatalError: (e) => {
          console.error(e);

          if (e instanceof HttpError) {
            if (e.status === 404) {
              this._view.updateState({
                type: 'logStreamEnded',
                instances: this._instancesManager.getInstances(),
                selection: this._selection,
              });

              return;
            }
          }
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
              instances: this._instancesManager.getInstances(),
              selection: this._selection,
            });
          }
        },
      },
    );

    this._logsStream.open();
  }

  /**
   * @param {DateRange} dateRange
   * @param {Array<string>} selection
   * @return {void}
   */
  init(dateRange, selection) {
    this._selection = selection;
    this.setNewDateRange(dateRange);
  }

  /**
   *
   * @param {string} deploymentId
   */
  initByDeploymentId(deploymentId) {
    // todo: what should we do if deploymentId doesn't exist?

    // clear and close everything
    this.stopAndClear();

    this._instancesManager
      .fetchInstancesByDeployment(deploymentId)
      .then((instances) => {
        // todo: when instances is empty
        if (instances.length === 0) {
          this._view.updateState({ type: 'logStreamEnded', instances: [], selection: [] });
          return;
        }

        this._selection = instances.map((instance) => instance.id);

        const deployment = instances[0].deployment;

        // cold
        if (isCurrentDeployment(deployment)) {
          this._dateRange = {
            since: deployment.creationDate.toISOString(),
          };

          this._view.component.dateRangeSelection = {
            type: 'live',
          };
        } else {
          this._dateRange = {
            since: deployment.creationDate.toISOString(),
            until: deployment.endDate.toISOString(),
          };

          this._view.component.dateRangeSelection = {
            type: 'custom',
            since: this._dateRange.since,
            until: this._dateRange.until,
          };
        }

        // enable instance auto-refresh only for live mode
        this._instancesManager.enabledAutoRefresh(isLive(this._dateRange));

        // open the logs stream
        this.openLogsStream();
      })
      .catch((e) => {
        console.error(e);
        this._view.updateState({ type: 'errorInstances' });
      });
  }

  initByLastDeployment() {
    // clear and close everything
    this.stopAndClear();

    // get last 7 days (which means, give me all instances and deployments within the whole log retention period)
    const last7DaysRange = lastXDays(7);

    this._instancesManager
      .fetchInstances(last7DaysRange.since, last7DaysRange.until)
      .then((instances) => {
        if (instances.length === 0) {
          this._dateRange = last7DaysRange;
          this._view.component.dateRangeSelection = {
            type: 'preset',
            preset: 'last7Days',
          };
          this._view.updateState({ type: 'logStreamEnded', instances: [], selection: [] });
          return;
        }

        const lastDeploymentInstances = this._instancesManager.getLastDeploymentInstances();
        const lastDeployment = lastDeploymentInstances[0].deployment;

        // live mode
        if (isCurrentDeployment(lastDeployment)) {
          this._view.component.dateRangeSelection = {
            type: 'live',
          };

          const liveRange = dateRangeSelectionToDateRange(this._view.component.dateRangeSelection);

          this.init(liveRange, []);
          return;
        }

        // cold mode with 7 days and last deployment selected.
        this._dateRange = last7DaysRange;
        this._view.component.dateRangeSelection = {
          type: 'preset',
          preset: 'last7Days',
        };

        // select the last deployment instances
        this._selection = lastDeploymentInstances.map((instance) => instance.id);

        // open the logs stream
        this.openLogsStream();
      })
      .catch((e) => {
        console.error(e);
        this._view.updateState({ type: 'errorInstances' });
      });
  }

  /**
   * @param {LogsDateRangeSelection} dateRangeSelection
   */
  initByDateRangeSelection(dateRangeSelection) {
    // clear and close everything
    this.stopAndClear();

    this._view.component.dateRangeSelection = dateRangeSelection;
    const dateRange = dateRangeSelectionToDateRange(this._view.component.dateRangeSelection);
    this.init(dateRange, []);
  }

  /**
   * @param {DateRange} dateRange
   */
  setNewDateRange(dateRange) {
    // clear and close everything
    this.stopAndClear();

    const clearSelection =
      this._dateRange == null ||
      (isLive(this._dateRange) && !isLive(dateRange)) ||
      (!isLive(this._dateRange) && isLive(dateRange));

    // store the new date range
    this._dateRange = dateRange;

    this._instancesManager
      .fetchInstances(this._dateRange.since, this._dateRange.until)
      .then((instances) => {
        if (instances.length === 0) {
          this._view.updateState({ type: 'logStreamEnded', instances: [], selection: [] });
          return;
        }

        // enable instance auto-refresh only for live mode
        this._instancesManager.enabledAutoRefresh(isLive(this._dateRange));

        if (clearSelection) {
          this._selection = [];
        } else {
          // adapt the instances selection according to the new set of instances
          this._selection = this._selection.filter((id) => this._instancesManager.hasInstance(id));
        }

        // we don't want to load too many logs, so if no instance is selected, and for a 7-days range,
        // we automatically select the last deployment
        if (
          this._selection.length === 0 &&
          this._view.component.dateRangeSelection.type === 'preset' &&
          this._view.component.dateRangeSelection.preset === 'last7Days'
        ) {
          const lastDeploymentInstances = this._instancesManager.getLastDeploymentInstances();
          this._selection = lastDeploymentInstances.map((instance) => instance.id);
        }

        // open the logs stream
        this.openLogsStream();
      })
      .catch((e) => {
        console.error(e);
        this._view.updateState({ type: 'errorInstances' });
      });
  }

  /**
   * @param {Array<string>} selection
   */
  setNewInstanceSelection(selection) {
    // store the new selection
    this._selection = selection;

    this.openLogsStream();
  }

  stopAndClear() {
    this._stopAndClearLogs();
    this._stopAndClearInstances();
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

  _stopAndClearLogs() {
    this._logsStream?.close();
    this._logsBuffer.clear();
    this._view.component.clear();
  }

  _stopAndClearInstances() {
    this._instancesManager?.close();
    this._instancesManager?.clear();
    this._view.updateState({ type: 'loadingInstances' });
  }

  _onLogsBufferFlush(logs) {
    this._view.component.appendLogs(logs);
  }

  _onInstancesChanged(instances) {
    this._view.updateState((state) => {
      state.instances = instances;
    });
  }

  async _convertLog(log) {
    const instance = await this._instancesManager.getOrFetchInstance(log.instanceId);

    return {
      id: log.id,
      date: new Date(log.date),
      message: log.message,
      metadata: [
        {
          name: 'instance',
          value: instance.ghost ? '?' : instance.name,
        },
        {
          name: 'instanceId',
          value: instance.id,
        },
      ],
    };
  }

  _optimizeLogsStreamParameters() {
    // no optimization on live range because instance filtering is done on client side.
    if (isLive(this._dateRange)) {
      return this._dateRange;
    }

    // no optimization can be done if no selection
    if (this._selection.length === 0) {
      return this._dateRange;
    }
    const instances = this._selection.map((id) => this._instancesManager.getInstance(id));

    // no optimization can be done as soon as there are some ghost instances in selection
    if (instances.find((i) => isGhostInstance(i)) != null) {
      return this._dateRange;
    }

    const now = new Date().getTime();

    const minSinceInstance = instances
      .map((i) => i.creationDate.getTime())
      .reduce((previous, current) => Math.min(previous, current), Infinity);
    let maxUntilInstance = instances
      .map((i) => i.deletionDate?.getTime() ?? now)
      .reduce((previous, current) => Math.max(previous, current), -Infinity);

    maxUntilInstance = maxUntilInstance === -Infinity ? Infinity : maxUntilInstance;
    const dateUntilFromDateRange = this._dateRange.until == null ? Infinity : new Date(this._dateRange.until).getTime();
    const optimizedUntil = Math.min(maxUntilInstance, dateUntilFromDateRange);

    return {
      since: new Date(Math.max(minSinceInstance, new Date(this._dateRange.since).getTime())).toISOString(),
      until: optimizedUntil === Infinity ? null : new Date(optimizedUntil).toISOString(),
    };
  }
}

class InstancesManager {
  /**
   * @param {Api} api
   * @param {(instances: Array<Instance | GhostInstance>) => void} onChange
   */
  constructor(api, onChange) {
    this._api = api;
    /** @type {Map<string, Instance | GhostInstance>} */
    this._instancesMap = new Map();
    this._onChange = onChange;
    this._deploymentsManager = new DeploymentsManager(api);
  }

  /**
   * @param {string} id
   * @return {Promise<Instance | GhostInstance>}
   */
  async getOrFetchInstance(id) {
    if (this._instancesMap.has(id)) {
      return this._instancesMap.get(id);
    }
    const instance = await this._fetchAndConvert(id);
    this._instancesMap.set(id, instance);
    this._fireChanged();
    return instance;
  }

  getInstance(id) {
    return this._instancesMap.get(id);
  }

  /**
   * @param {string} since
   * @param {string} until
   * @return {Promise<Array<Instance | GhostInstance>>}
   */
  async fetchInstances(since, until) {
    // Fetch instances that have been alive between the given date range.
    const rawInstances = await this._api.fetchInstances(since, until);

    // Fetch all deployments in advance (in an optimized way) instead of letting the instance converter do it one by one
    await this._deploymentsManager.fetchOrRefreshDeployments(rawInstances.map((instance) => instance.deploymentId));

    // Convert instances
    const instances = await Promise.all(rawInstances.map((rawInstance) => this._convert(rawInstance)));

    // Index them in our map of instances
    index(instances, 'id', this._instancesMap);

    return instances;
  }

  /**
   * @param {string} deploymentId
   * @return {Promise<Array<Instance | GhostInstance>>}
   */
  async fetchInstancesByDeployment(deploymentId) {
    // Fetch instances that have been alive between the given date range.
    const rawInstances = await this._api.fetchInstancesByDeployment(deploymentId);

    // Fetch all deployments in advance (in an optimized way) instead of letting the instance converter do it one by one
    await this._deploymentsManager.fetchOrRefreshDeployments(rawInstances.map((instance) => instance.deploymentId));

    // Convert instances
    const instances = await Promise.all(rawInstances.map((rawInstance) => this._convert(rawInstance)));

    // Index them in our map of instances
    index(instances, 'id', this._instancesMap);

    return instances;
  }

  /**
   * @param {string} id
   * @return {boolean}
   */
  hasInstance(id) {
    return this._instancesMap.has(id);
  }

  /**
   * @return {Array<Instance | GhostInstance>}
   */
  getInstances() {
    return Array.from(this._instancesMap.values());
  }

  close() {
    this._stopRefresher();
  }

  clear() {
    this._instancesMap.clear();
  }

  enabledAutoRefresh(enable) {
    if (enable && this._refresher == null) {
      this._startRefresher();
    } else if (!enable && this._refresher != null) {
      this._stopRefresher();
    }
  }

  getLastDeploymentInstances() {
    if (this._instancesMap.size === 0) {
      return [];
    }

    const lastDeployment = this._deploymentsManager.getLastDeployment();

    return Array.from(this._instancesMap.values()).filter((instance) => instance.deployment === lastDeployment);
  }

  _startRefresher() {
    this._refresher = setInterval(async () => {
      // Find all instances that needs to be refreshed: instances with non-final state or ghost instances
      const instancesToRefresh = Array.from(this._instancesMap.values()).filter((instance) => {
        return isGhostInstance(instance) || instance.deployment.state !== 'SUCCEEDED' || instance.state !== 'DELETED';
      });

      // Fetch all deployments in advance (in an optimized way) instead of letting the instance converter do it one by one
      await this._deploymentsManager.fetchOrRefreshDeployments(
        instancesToRefresh.map((instance) => instance.deployment.id),
      );

      // Fetch those instance
      const newInstances = await Promise.all(instancesToRefresh.map((instance) => this._fetchAndConvert(instance.id)));

      // If at least one has changed, index them all and notify the change by calling the `onChange` callback.
      if (newInstances.some((instance) => this._hasChanged(instance))) {
        index(newInstances, 'id', this._instancesMap);
        this._fireChanged();
      }
    }, INSTANCES_REFRESH_RATE);
  }

  _stopRefresher() {
    clearInterval(this._refresher);
    this._refresher = null;
  }

  /**
   * @param {string} id
   * @return {Promise<Instance | GhostInstance>}
   * @private
   */
  async _fetchAndConvert(id) {
    let rawInstance;
    try {
      rawInstance = await this._api.fetchInstance(id);
    } catch (e) {
      if (e?.response?.status === 404) {
        return {
          ghost: true,
          id,
        };
      }
    }
    return this._convert(rawInstance);
  }

  /**
   * @param {Object} raw
   * @return {Promise<Instance>}
   */
  async _convert(raw) {
    let deployment;
    if (raw.deploymentId == null) {
      console.error(`deploymentId is null! Could not get deployment for instance ${raw.id}.`);
      // todo, should we return null, or should we consider this as a ghost instance?
    } else {
      deployment = await this._deploymentsManager.getOrFetchDeployment(raw.deploymentId);
    }

    return {
      id: raw.id,
      name: raw.name,
      index: raw.index,
      deployment: deployment,
      state: raw.state,
      creationDate: new Date(raw.creationDate),
      deletionDate: raw.deletionDate != null ? new Date(raw.deletionDate) : null,
      kind: raw.isBuildVm ? 'BUILD' : 'RUN',
    };
  }

  _fireChanged() {
    this._onChange(this.getInstances());
  }

  /**
   * @param {Instance | GhostInstance} newInstance
   * @return {boolean}
   */
  _hasChanged(newInstance) {
    const currentInstance = this._instancesMap.get(newInstance.id);

    if (currentInstance == null) {
      return true;
    }

    if (isGhostInstance(currentInstance)) {
      return !isGhostInstance(newInstance);
    }

    return (
      currentInstance.state !== newInstance.state || currentInstance.deployment.state !== newInstance.deployment.state
    );
  }
}

class DeploymentsManager {
  /**
   * @param {Api} api
   */
  constructor(api) {
    this._api = api;
    /** @type {Map<string, Deployment>} */
    this._deploymentsMap = new Map();
  }

  /**
   * @param {string} id
   * @return {Promise<Deployment>}
   */
  async getOrFetchDeployment(id) {
    let deployment = this._deploymentsMap.get(id);
    if (deployment == null) {
      deployment = await this._fetchAndConvert(id);
      this._deploymentsMap.set(id, deployment);
    }
    return deployment;
  }

  /**
   * From the given array of ids, fetches or refreshes all deployments that are not in a final state.
   *
   * @param {Array<string>} ids
   * @return {Promise<void>}
   */
  async fetchOrRefreshDeployments(ids) {
    const idsToFetch = ids
      // We don't want to fetch twice the same id
      .flatMap(unique)
      // We want to fetch only deployments that we don't already know, or deployments that have a non-final state.
      .filter((id) => {
        const deployment = this._deploymentsMap.get(id);
        return deployment == null || deployment.state === 'QUEUED' || deployment.state === 'WORK_IN_PROGRESS';
      });

    // We fetch and convert them all in parallel
    const fetchedDeployments = await Promise.all(idsToFetch.map((id) => this._fetchAndConvert(id)));

    // We add them to our deployments map.
    index(fetchedDeployments, 'id', this._deploymentsMap);
  }

  getLastDeployment() {
    if (this._deploymentsMap.size === 0) {
      return null;
    }

    const sortFn = (d1, d2) => {
      if (isCurrentDeployment(d1)) {
        return -1;
      }
      if (isCurrentDeployment(d2)) {
        return 1;
      }
      return d2.creationDate.getTime() - d1.creationDate.getTime();
    };

    const deployments = Array.from(this._deploymentsMap.values()).sort(sortFn);
    return deployments[0];
  }

  /**
   * @param {string} id
   * @return {Promise<Deployment>}
   */
  async _fetchAndConvert(id) {
    try {
      return await this._convertV4(await this._api.fetchDeployment(id), 'v4');
    } catch (e) {
      // fallback to API v2. This is to be removed one day.
      if (e?.response?.status === 404) {
        return await this._convertV2(await this._api.fetchDeploymentV2(id), 'v2');
      }
      throw e;
    }
  }

  /**
   * @param {Object} raw
   * @return {Deployment}
   */
  _convertV4(raw) {
    const result = {
      id: raw.id,
      state: raw.state,
      creationDate: new Date(raw.startDate),
      commitId: raw.version.commitId,
    };

    if (result.state === 'SUCCEEDED' || result.state === 'FAILED' || result.state === 'CANCELLED') {
      result.endDate = new Date(raw.steps.find((s) => s.state === result.state).date);
    }

    return result;
  }

  /**
   * @param {Object} raw
   * @return {Deployment}
   */
  async _convertV2(raw) {
    // V2: WIP | OK | CANCELLED | FAIL
    // V4: QUEUED, WORK_IN_PROGRESS, FAILED, CANCELLED and SUCCEEDED.

    let state;
    if (raw.state === 'QUEUED') {
      state = 'QUEUED';
    } else if (raw.state === 'WIP') {
      state = 'WORK_IN_PROGRESS';
    } else if (raw.state === 'OK') {
      state = 'SUCCEEDED';
    } else if (raw.state === 'CANCELLED') {
      state = 'CANCELLED';
    } else if (raw.state === 'FAIL') {
      state = 'FAILED';
    }

    let endTime = null;
    if (state === 'SUCCEEDED' || state === 'FAILED' || state === 'CANCELLED') {
      const instances = await this._api.fetchInstancesByDeployment(raw.uuid);

      for (const instance of instances) {
        if (instance.deletionDate == null) {
          endTime = null;
          break;
        }
        const deletionTime = new Date(instance.deletionDate).getTime();
        if (endTime == null) {
          endTime = deletionTime;
        } else {
          endTime = Math.max(endTime, deletionTime);
        }
      }
    }

    return {
      id: raw.uuid,
      state: state,
      creationDate: new Date(raw.date),
      endDate: endTime == null ? null : new Date(endTime),
      commitId: raw.commit,
    };
  }
}

class LogsStream {
  /**
   *
   * @param {Object} apiConfig
   * @param {LogsStreamParams} params
   * @param {LogsStreamCallbacks} callbacks
   */
  constructor(apiConfig, params, callbacks) {
    /** @type {ApplicationLogStream} */
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

    this._logsStream = new ApplicationLogStream({
      apiHost: this._apiConfig.API_HOST,
      tokens: this._apiConfig,
      ownerId: this._params.applicationRef.ownerId,
      appId: this._params.applicationRef.applicationId,
      since: this._params.since,
      until: this._params.until,
      instanceId: this._params.instances,
      retryConfiguration: {
        enabled: true,
        maxRetryCount: 10,
      },
      throttleElements: LOGS_THROTTLE_ELEMENTS,
      throttlePerInMilliseconds: LOGS_THROTTLE_PER_IN_MILLIS,
    })
      .on('open', this._callbacks.onOpen)
      .onLog(this._callbacks.onLog)
      .on('error', (event) => {
        // This is not a fatal error, the logs stream will retry.
        if (this._logsStream.retryCount >= 3) {
          this._callbacks.onError(event.error);
        }
      });
    this._logsStream
      .start()
      .then((e) => {
        this._callbacks.onFinish(e.reason);
        this._logsStream = null;
      })
      .catch((error) => {
        this._callbacks.onFatalError(error);
        this._logsStream = null;
      });
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

class Api {
  /**
   * @param {ApiConfig} apiConfig
   * @param {ApplicationRef} applicationRef
   */
  constructor(apiConfig, applicationRef) {
    this._apiConfig = apiConfig;
    this._commonApiPrams = { id: applicationRef.ownerId, appId: applicationRef.applicationId };
  }

  fetchDeployment(deploymentId) {
    return v4.getDeployment({ ...this._commonApiPrams, deploymentId }).then(sendToApi({ apiConfig: this._apiConfig }));
  }

  fetchDeploymentV2(deploymentId) {
    return v2.getDeployment({ ...this._commonApiPrams, deploymentId }).then(sendToApi({ apiConfig: this._apiConfig }));
  }

  fetchInstances(since, until) {
    return v4
      .getInstances({ ...this._commonApiPrams, limit: 100, since, until })
      .then(sendToApi({ apiConfig: this._apiConfig }));
  }

  fetchInstancesByDeployment(deploymentId) {
    return v4
      .getInstances({ ...this._commonApiPrams, limit: 100, deploymentId })
      .then(sendToApi({ apiConfig: this._apiConfig }));
  }

  fetchInstance(instanceId) {
    return v4.getInstance({ ...this._commonApiPrams, instanceId }).then(sendToApi({ apiConfig: this._apiConfig }));
  }
}

// --- APIs ------

const v4 = {
  getInstances(params) {
    return Promise.resolve({
      method: 'get',
      url: `/v4/orchestration/organisations/${params.id}/applications/${params.appId}/instances`,
      headers: { Accept: 'application/json' },
      queryParams: pickNonNull(params, ['limit', 'since', 'until', 'deploymentId', 'includeState']),
    });
  },
  getInstance(params) {
    return Promise.resolve({
      method: 'get',
      url: `/v4/orchestration/organisations/${params.id}/applications/${params.appId}/instances/${params.instanceId}`,
      headers: { Accept: 'application/json' },
    });
  },
  getDeployment(params) {
    return Promise.resolve({
      method: 'get',
      url: `/v4/orchestration/organisations/${params.id}/applications/${params.appId}/deployments/${params.deploymentId}`,
      headers: { Accept: 'application/json' },
    });
  },
};

const v2 = {
  getDeployment: getDeployment,
  getAllInstances: getAllInstances,
};

// --- utils ------

/**
 * @param {Array<Object>} objects
 * @param {string} key
 * @param {Map} map
 */
function index(objects, key, map) {
  objects.forEach((o) => {
    map.set(o[key], o);
  });
}

/**
 *
 * @param {Instance | GhostInstance} instance
 * @return {boolean}
 */
function isGhostInstance(instance) {
  return instance.ghost === true;
}

function isCurrentDeployment(deployment) {
  return deployment.state === 'WORK_IN_PROGRESS' || deployment.state === 'QUEUED' || deployment.endDate == null;
}

//
// function getDeployments (params) {
// // "https://api.clever-cloud.com/v4/orchestration/organisations/orga_8b852f0a-1135-4b4f-8eee-a538f538b640/applications/app_4bc68315-c93e-49eb-8086-430314475568/deployments?limit=1"  | jq
//   const urlBase = `/orchestration/organisations/${params.id}/applications/${params.appId}/deployments`;
//   return Promise.resolve({
//     method: 'get',
//     url: `/v4${urlBase}/applications/${params.appId}/deployments`,
//     headers: { Accept: 'application/json' },
//     queryParams: pickNonNull(params, ['limit', 'offset', 'action']),
//     // no body
//   });
//
// }
