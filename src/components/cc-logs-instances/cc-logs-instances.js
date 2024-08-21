import { css, html, LitElement } from 'lit';
import {
  iconRemixToolsLine as iconBuildInstance,
  iconRemixCloseCircleFill as iconDeploymentCancelled,
  iconRemixErrorWarningFill as iconDeploymentFailed,
  iconRemixCheckboxCircleFill as iconDeploymentSucceeded,
  iconRemixCompassDiscoverLine as iconDeploymentWip,
  iconRemixCloseCircleLine as iconHeaderDeleted,
  iconRemixCompassDiscoverLine as iconHeaderDeploying,
  iconRemixGhostLine as iconHeaderGhost,
  iconRemixPlayCircleLine as iconHeaderRunning,
  iconRemixStopCircleLine as iconHeaderStopping,
  iconRemixCloseCircleLine as iconInstanceDeleted,
  iconRemixCompassDiscoverLine as iconInstanceDeploying,
  iconRemixPlayCircleLine as iconInstanceRunning,
  iconRemixStopCircleLine as iconInstanceStopping,
} from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { groupBy } from '../../lib/utils.js';
import '../cc-datetime-relative/cc-datetime-relative.js';
import '../cc-icon/cc-icon.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';
import '../cc-toggle/cc-toggle.js';

/**
 * @param {Instance} i1
 * @param {Instance} i2
 * @return {number}
 */
const INSTANCE_SORT_ORDER = (i1, i2) => {
  const number = i1.index - i2.index;
  if (number !== 0) {
    return number;
  }
  const time = i1.creationDate.getTime() - i2.creationDate.getTime();
  if (time !== 0) {
    return time;
  }
  return i1.kind === 'BUILD' ? -1 : 1;
};

/**
 * @param {GhostInstance} i1
 * @param {GhostInstance} i2
 * @return {number}
 */
const GHOST_INSTANCE_SORT_ORDER = (i1, i2) => {
  return i1.id.localeCompare(i2.id);
};

/** @type {Array<InstanceState>} */
const INSTANCE_DEPLOYING_STATES = ['BOOTING', 'STARTING', 'DEPLOYING', 'READY'];
/** @type {Array<InstanceState>} */
const INSTANCE_RUNNING_STATES = ['UP', 'MIGRATION_IN_PROGRESS', 'TASK_IN_PROGRESS', 'BUILDING'];
/** @type {Array<DeploymentState>} */
const DEPLOYMENT_WIP_STATES = ['QUEUED', 'WORK_IN_PROGRESS'];

/**
 * @typedef {import('./cc-logs-instances.types.js').LogsInstancesState} LogsInstancesState
 */

/**
 * Allows users to select some instances.
 *
 * * When using `live` mode, instances are grouped by logical state.
 * * When using `cold` mode, instances are grouped by deployment.
 *
 * @cssdisplay flex
 *
 * @fires {CustomEvent<Array<string>>} cc-logs-instances:selection-change - Fires whenever the instances selection changes
 */
export class CcLogsInstances extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {LogsInstancesState} State of the component. */
    this.state = {
      state: 'loading',
    };
  }

  _isSelected(instanceId) {
    return this.state.state === 'loaded' && this.state.selection != null && this.state.selection.includes(instanceId);
  }

  _onInstanceClick(e) {
    const instanceId = e.target.id;
    if (this._isSelected(instanceId)) {
      this.state = {
        ...this.state,
        selection: this.state.selection.filter((i) => i !== instanceId),
      };
    } else {
      this.state = {
        ...this.state,
        selection: [...(this.state.selection ?? []), instanceId],
      };
    }

    dispatchCustomEvent(this, 'selection-change', this.state.selection);
  }

  render() {
    if (this.state.state === 'error') {
      return html`
        <div class="wrapper wrapper--center">
          <cc-notice intent="warning" message="${i18n('cc-logs-instances.loading.error')}"></cc-notice>
        </div>
      `;
    }

    if (this.state.state === 'loading') {
      return html`
        <div class="wrapper wrapper--center">
          <cc-loader a11y-name="${i18n('cc-logs-instances.loading.loader')}"></cc-loader>
        </div>
      `;
    }

    if (this.state.mode === 'cold') {
      return this._renderColdMode(this.state.instances);
    }

    return this._renderLiveMode(this.state.instances);
  }

  /**
   * @param {Array<Instance|GhostInstance>} instances
   */
  _renderColdMode(instances) {
    const { ghost: ghostInstances, real: realInstances } = groupBy(instances, (instance) =>
      instance.ghost ? 'ghost' : 'real',
    );

    return html`
      <fieldset class="section section--cold">
        ${this._renderHeader({
          title: i18n('cc-logs-instances.cold.header'),
        })}
        ${realInstances?.length > 0
          ? this._renderInstancesGroupedByDeployment(instances, false)
          : html`<div class="empty">${i18n('cc-logs-instances.cold.empty')}</div>`}
      </fieldset>
      ${this._renderGhostInstances(ghostInstances)}
    `;
  }

  /**
   * @param {Array<Instance|GhostInstance>} instances
   */
  _renderLiveMode(instances) {
    /** @type {Array<Instance>} */
    const deployingInstances = [];
    /** @type {Array<Instance>} */
    const runningInstances = [];
    /** @type {Array<Instance>} */
    const stoppingInstances = [];
    /** @type {Array<Instance>} */
    const deletedInstances = [];

    const { ghost: ghostInstances, real: realInstances } = groupBy(instances, (instance) =>
      instance.ghost ? 'ghost' : 'real',
    );

    (realInstances || []).sort(INSTANCE_SORT_ORDER).forEach((instance) => {
      if (DEPLOYMENT_WIP_STATES.includes(instance.deployment.state)) {
        deployingInstances.push(instance);
      } else if (instance.state === 'DELETED') {
        deletedInstances.push(instance);
      } else if (instance.state === 'STOPPING') {
        stoppingInstances.push(instance);
      } else {
        runningInstances.push(instance);
      }
    });

    return html`
      ${this._renderDeployingInstances(deployingInstances)} ${this._renderRunningInstances(runningInstances)}
      ${this._renderStoppingInstances(stoppingInstances)} ${this._renderDeletedInstances(deletedInstances)}
      ${this._renderGhostInstances(ghostInstances)}
    `;
  }

  /**
   * @param {Array<Instance>} instances
   */
  _renderDeployingInstances(instances) {
    if (instances.length === 0) {
      return '';
    }

    return html`
      <fieldset class="section section--deploying">
        ${this._renderHeader({
          title: i18n('cc-logs-instances.deploying.header'),
          icon: iconHeaderDeploying,
          commit: instances[0].deployment.commitId,
        })}
        <div class="section-content instances instances--with-state">${this._renderInstances(instances, true)}</div>
      </fieldset>
    `;
  }

  /**
   * @param {Array<Instance>} instances
   */
  _renderRunningInstances(instances) {
    if (instances.length === 0) {
      return html`
        <fieldset class="section section--running">
          ${this._renderHeader({
            title: i18n('cc-logs-instances.running.header'),
            icon: iconHeaderRunning,
          })}
          <div class="empty">${i18n('cc-logs-instances.running.empty')}</div>
        </fieldset>
      `;
    }

    return html`
      <fieldset class="section section--running">
        ${this._renderHeader({
          title: i18n('cc-logs-instances.running.header'),
          icon: iconHeaderRunning,
          commit: instances[0].deployment.commitId,
        })}
        <div class="section-content instances">${this._renderInstances(instances, false)}</div>
      </fieldset>
    `;
  }

  /**
   * @param {Array<Instance>} instances
   */
  _renderStoppingInstances(instances) {
    if (instances.length === 0) {
      return '';
    }

    return html`
      <fieldset class="section section--stopping">
        ${this._renderHeader({
          title: i18n('cc-logs-instances.stopping.header'),
          icon: iconHeaderStopping,
          commit: instances[0].deployment.commitId,
        })}
        <div class="section-content instances">${this._renderInstances(instances, false)}</div>
      </fieldset>
    `;
  }

  /**
   * @param {Array<Instance>} instances
   */
  _renderDeletedInstances(instances) {
    if (instances.length === 0) {
      return '';
    }

    return html`
      <fieldset class="section section--deleted">
        ${this._renderHeader({
          title: i18n('cc-logs-instances.deleted.header'),
          icon: iconHeaderDeleted,
        })}
        ${this._renderInstancesGroupedByDeployment(instances, false)}
      </fieldset>
    `;
  }

  /**
   * @param {Array<GhostInstance>|null} instances
   */
  _renderGhostInstances(instances) {
    if (instances == null || instances.length === 0) {
      return '';
    }

    return html`
      <fieldset class="section section--ghost">
        ${this._renderHeader({
          title: i18n('cc-logs-instances.ghost.header'),
          icon: iconHeaderGhost,
        })}

        <div class="section-content">
          <cc-notice intent="info" message="${i18n('cc-logs-instances.ghost.notice')}"></cc-notice>
          <div class="instances instances--ghost">
            ${instances.sort(GHOST_INSTANCE_SORT_ORDER).map(
              (instance) => html`
                <label class="instance" for="${instance.id}">
                  <input
                    type="checkbox"
                    id="${instance.id}"
                    .checked=${this._isSelected(instance.id)}
                    @change=${this._onInstanceClick}
                  />
                  <span class="instance-id">${instance.id}</span>
                </label>
              `,
            )}
          </div>
        </div>
      </fieldset>
    `;
  }

  _renderHeader({ title, icon, commit }) {
    return html`
      <legend class="section-header">
        ${icon != null ? html` <cc-icon class="section-header-icon" .icon=${icon}></cc-icon> ` : ''}
        <span class="section-header-title">${title}</span>
        ${commit != null ? this._renderCommit(commit) : ''}
      </legend>
    `;
  }

  /**
   * @param {Array<Instance>} instances
   * @param {boolean} renderState
   */
  _renderInstancesGroupedByDeployment(instances, renderState) {
    const groups = groupBy(instances, (instance) => instance.deployment?.id);

    return html`
      <div class="section-content deployments">
        ${Object.values(groups)
          // deployment date is the date of the deployment of the first instance in the group
          .map((instances) => ({ deploymentDate: instances[0].deployment.creationDate, instances }))
          // sort by deployment date
          .sort((o1, o2) => o2.deploymentDate - o1.deploymentDate)
          // render group of instances
          .map(
            ({ instances }) => html`
              <fieldset class="deployment">
                ${this._renderDeploymentDetails(instances[0].deployment)}
                <div class="instances">${this._renderInstances(instances, renderState)}</div>
              </fieldset>
            `,
          )}
      </div>
    `;
  }

  /**
   * @param {Array<Instance>} instances
   * @param {boolean} renderState
   */
  _renderInstances(instances, renderState) {
    return instances.sort(INSTANCE_SORT_ORDER).map((instance) => this._renderInstance(instance, renderState));
  }

  /**
   *
   * @param {Instance} instance
   * @param {boolean} renderState
   */
  _renderInstance(instance, renderState) {
    return html`
      <label class="instance" for="${instance.id}">
        <input
          type="checkbox"
          id="${instance.id}"
          .checked=${this._isSelected(instance.id)}
          @change=${this._onInstanceClick}
        />
        <span class="instance-name">${instance.name}</span>
      </label>
      ${renderState ? this._renderInstanceState(instance) : ''} ${this._renderInstanceIndex(instance)}
    `;
  }

  /**
   * @param {Deployment} deployment
   */
  _renderDeploymentDetails(deployment) {
    return html`
      <legend class="deployment-detail">
        <div>${this._renderDeploymentState(deployment.state)}</div>
        <div>
          ${i18n('cc-logs-instances.deployment.deployed')}&nbsp;<cc-datetime-relative
            datetime=${deployment.creationDate.toISOString()}
          ></cc-datetime-relative>
        </div>
        ${this._renderCommit(deployment.commitId)}
      </legend>
    `;
  }

  /**
   *
   * @param {DeploymentState} state
   * @return {{icon: IconModel, a11yName: string, class: string}}
   */
  _getDeploymentStateIcon(state) {
    if (DEPLOYMENT_WIP_STATES.includes(state)) {
      return {
        a11yName: i18n('cc-logs-instances.deployment.state.wip'),
        icon: iconDeploymentWip,
        class: 'deployment-state--wip',
      };
    }

    if (state === 'SUCCEEDED') {
      return {
        a11yName: i18n('cc-logs-instances.deployment.state.succeeded'),
        icon: iconDeploymentSucceeded,
        class: 'deployment-state--succeeded',
      };
    }

    if (state === 'FAILED') {
      return {
        a11yName: i18n('cc-logs-instances.deployment.state.failed'),
        icon: iconDeploymentFailed,
        class: 'deployment-state--failed',
      };
    }

    if (state === 'CANCELLED') {
      return {
        a11yName: i18n('cc-logs-instances.deployment.state.cancelled'),
        icon: iconDeploymentCancelled,
        class: 'deployment-state--cancelled',
      };
    }
  }

  /**
   * @param {DeploymentState} state
   */
  _renderDeploymentState(state) {
    const icon = this._getDeploymentStateIcon(state);
    return html`
      <cc-icon .icon=${icon.icon} a11y-name="${icon.a11yName}" class="deployment-state ${icon.class}"></cc-icon>
    `;
  }

  /**
   * @param {Instance} instance
   */
  _getInstanceStateIcon(instance) {
    if (INSTANCE_DEPLOYING_STATES.includes(instance.state)) {
      return {
        a11yName: i18n('cc-logs-instances.instance.state.deploying'),
        icon: iconInstanceDeploying,
        class: 'instance-state--deploying',
      };
    }
    if (INSTANCE_RUNNING_STATES.includes(instance.state)) {
      return {
        a11yName: i18n('cc-logs-instances.instance.state.running'),
        icon: iconInstanceRunning,
        class: 'instance-state--running',
      };
    }
    if (instance.state === 'STOPPING') {
      return {
        a11yName: i18n('cc-logs-instances.instance.state.stopping'),
        icon: iconInstanceStopping,
        class: 'instance-state--stopping',
      };
    }
    if (instance.state === 'DELETED' && instance.deployment.state === 'WORK_IN_PROGRESS') {
      return {
        a11yName: i18n('cc-logs-instances.instance.state.deleted'),
        icon: iconInstanceDeleted,
        class: 'instance-state--deleted',
      };
    }
    return null;
  }

  /**
   *
   * @param {Instance} instance
   */
  _renderInstanceState(instance) {
    const icon = this._getInstanceStateIcon(instance);
    if (icon == null) {
      return html`<span></span>`;
    }

    return html`
      <cc-icon .icon=${icon.icon} a11y-name="${icon.a11yName}" class="instance-state ${icon.class}"></cc-icon>
    `;
  }

  _renderCommit(commit) {
    return html` <span class="commit" title=${i18n('cc-logs-instances.commit.title', { commit })}>
      ${commit.substring(0, 7)}
    </span>`;
  }

  _renderInstanceIndex(instance) {
    const title =
      instance.kind === 'BUILD'
        ? i18n('cc-logs-instances.instance.build')
        : i18n('cc-logs-instances.instance.index', { index: instance.index });

    return html` <span class="instance-index" title=${title}>
      ${instance.kind === 'BUILD' ? html` <cc-icon .icon=${iconBuildInstance}></cc-icon> ` : ''}
      ${instance.kind !== 'BUILD' ? html` ${instance.index} ` : ''}
    </span>`;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: flex;
          flex-direction: column;
          overflow: auto;
        }

        /* RESET */

        fieldset {
          border: 0;
          display: flex;
          flex-direction: column;
          margin: 0;
          min-width: 0;
          padding: 0;
        }

        legend {
          display: table;
          float: left;
          margin: 0;
          padding: 0;
        }

        .wrapper {
          padding: 0.5em 0.75em;
        }

        .wrapper.wrapper--center {
          align-items: center;
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: center;
        }

        cc-loader.loading {
          min-height: 20em;
        }

        .section {
          margin-bottom: 1em;
        }

        .section--deploying {
          --section-header-color: var(--cc-color-text-primary);
        }

        .section--running {
          --section-header-color: var(--cc-color-text-success);
        }

        .section--stopping {
          --section-header-color: var(--cc-color-text-warning);
        }

        .section--deleted,
        .section--cold,
        .section--ghost {
          --section-header-color: var(--cc-color-text-weak, #555);
        }

        .section-header {
          align-items: center;
          background-color: var(--cc-color-bg-neutral, #eee);
          color: var(--cc-color-text-weak, #555);
          display: flex;
          gap: 0.5em;
          margin-bottom: 0.5em;
          padding: 0.5em 0.75em;
        }

        .section-header-icon {
          height: 1.5em;
          width: 1.5em;

          --cc-icon-color: var(--section-header-color);
        }

        .section-header-title {
          flex: 1;
          font-size: 1em;
          font-weight: bold;
        }

        .commit {
          align-items: center;
          background-color: var(--cc-color-bg-neutral-readonly, #aaa);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          color: var(--cc-color-text-weak, #555);
          display: flex;
          font-family: var(--cc-ff-monospace, monospace);
          font-size: 0.7em;
          padding: 0.2em;
        }

        .section-content {
          display: flex;
          flex-direction: column;
          padding: 0.25em 0.75em 0.25em 1em;
        }

        .instances {
          align-items: center;
          display: grid;
          gap: 0.5em;
          grid-template-columns: max-content max-content;
        }

        .instances.instances--with-state {
          grid-template-columns: max-content max-content max-content;
        }

        .instances.instances--ghost {
          display: flex;
          flex-direction: column;
          margin-top: 1em;
        }

        .instance {
          align-items: center;
          display: flex;
          gap: 0.5em;
        }

        .instance-id {
          line-height: 1em;
          overflow-wrap: break-word;
        }

        .instance-index {
          align-items: center;
          background-color: var(--cc-color-bg-neutral-readonly, #aaa);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: 100%;
          color: var(--cc-color-text-weak, #555);
          display: flex;
          font-family: var(--cc-ff-monospace, monospace);
          font-size: 0.7em;
          height: 1em;
          justify-content: center;
          padding: 0.2em;
          width: 1em;
        }

        .instance-state {
          --cc-icon-size: 1.2em;
        }

        .deployments {
          gap: 1em;
        }

        .deployment {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }

        .deployment-detail {
          align-items: center;
          color: var(--cc-color-text-weak, #555);
          display: grid;
          gap: 0.5em;
          grid-template-columns: auto 1fr auto;
        }

        .deployment .instances {
          padding-left: 1.5em;
        }

        cc-icon.deployment-state {
          display: inline-flex;
          flex: auto 0 0;
          height: 1.2em;
          width: 1.2em;
        }

        .instance-state--deploying,
        .deployment-state--wip {
          --cc-icon-color: var(--cc-color-text-primary);
        }

        .instance-state--running,
        .deployment-state--succeeded {
          --cc-icon-color: var(--cc-color-text-success);
        }

        .instance-state--stopping,
        .deployment-state--cancelled {
          --cc-icon-color: var(--cc-color-text-warning);
        }

        .instance-state--deleted {
          --cc-icon-color: var(--cc-color-text-weak, #555);
        }

        .deployment-state--failed {
          --cc-icon-color: var(--cc-color-text-danger);
        }

        .empty {
          font-style: italic;
          padding-left: 0.75em;
        }

        input[type='checkbox'] {
          height: 1em;
          /* pixel perfect horizontal alignement with the header icon */
          margin: 0 0 0 0.1em;
          width: 1em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-logs-instances-beta', CcLogsInstances);
