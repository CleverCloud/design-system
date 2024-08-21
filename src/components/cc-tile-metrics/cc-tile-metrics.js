import { BarController, BarElement, CategoryScale, Chart, Filler, LinearScale, Title, Tooltip } from 'chart.js';
import { LitElement, css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconCleverGrafana as iconGrafana,
  iconCleverInfo as iconInfo,
  iconCleverRam as iconMem,
} from '../../assets/cc-clever.icons.js';
import {
  iconRemixAlertFill as iconAlert,
  iconRemixCloseLine as iconClose,
  iconRemixCpuLine as iconCpu,
} from '../../assets/cc-remix.icons.js';
import { ResizeController } from '../../controllers/resize-controller.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { isStringEmpty } from '../../lib/utils.js';
import { accessibilityStyles } from '../../styles/accessibility.js';
import { tileStyles } from '../../styles/info-tiles.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import '../cc-button/cc-button.js';
import '../cc-icon/cc-icon.js';

Chart.register(BarController, BarElement, Tooltip, CategoryScale, LinearScale, Title, Filler);

const TOP_COLOR_CHART = 'rgb(190, 52, 97)';
const MIDDLE_COLOR_CHART = 'rgb(78, 100, 234)';
const BOTTOM_COLOR_CHART = 'rgb(100, 146, 234)';

const TOP_COLOR_PERCENT = 'var(--cc-color-text-danger)';
const MIDDLE_COLOR_PERCENT = 'var(--cc-color-text-primary-strong)';
const BOTTOM_COLOR_PERCENT = 'var(--cc-color-text-primary)';

const SKELETON_COLOR = '#bbb';

const TOP_THRESHOLD = 80;
const BOTTOM_THRESHOLD = 20;

const NUMBER_OF_POINTS = 24;

const ONE_DAY = 60 * 60 * 1000 * 24;

const SKELETON_REQUESTS = Array.from(new Array(NUMBER_OF_POINTS)).map((_, index) => {
  const startTs = Date.now() - ONE_DAY;
  return {
    skeleton: true,
    value: 0,
    timestamp: startTs + index * 3600,
  };
});

/**
 * @typedef {import('./cc-tile-metrics.types.js').TileMetricsMetricsState} TileMetricsMetricsState
 * @typedef {import('./cc-tile-metrics.types.js').TileMetricsGrafanaLinkState} TileMetricsGrafanaLinkState
 * @typedef {import('./cc-tile-metrics.types.js').MetricsData} MetricsData
 * @typedef {import('./cc-tile-metrics.types.js').Metric} Metric
 * @typedef {import('lit/directives/ref.js').Ref<HTMLCanvasElement>} RefCanvas
 * @typedef {import('lit').PropertyValues<CcTileMetrics>} CcTileMetricsPropertyValues
 * @typedef {import('chart.js').ChartData} ChartData
 */

/**
 * A "tile" component to display CPU and RAM metrics in a bar chart.
 *
 * ## Details
 *
 * The tile is composed of two panels:
 *  * One for the charts (CPU and MEM).
 *  * The other one is for the docs.
 * You can switch between them by clicking on the info button.
 *
 * The Grafana link is the link to the Grafana app.
 * The Metrics link is the link to the Metrics section of the app in the console.
 *
 * @cssdisplay grid
 */
export class CcTileMetrics extends LitElement {
  static get properties() {
    return {
      metricsLink: { type: String },
      metricsState: { type: Object },
      grafanaLinkState: { type: Object },
      _docsPanelVisible: { type: Boolean, state: true },
    };
  }

  constructor() {
    super();

    /** @type {string|null} Sets the link leading to metrics within the console */
    this.metricsLink = null;

    /** @type {TileMetricsMetricsState} Sets the state of the component data */
    this.metricsState = { type: 'loading' };

    /** @type {TileMetricsGrafanaLinkState} Sets the state of the grafana link */
    this.grafanaLinkState = { type: 'loading' };

    /** @type {boolean} */
    this._docsPanelVisible = false;

    /** @type {RefCanvas} */
    this._cpuCtxRef = createRef();

    /** @type {RefCanvas} */
    this._memCtxRef = createRef();

    new ResizeController(this, {
      callback: () =>
        this.updateComplete.then(() => {
          // everytime the component is resized, we need to trigger the chartJS resize
          this._cpuChart?.resize();
          this._memChart?.resize();
        }),
    });
  }

  /**
   * @param {HTMLCanvasElement} chartElement
   * @returns {Chart}
   * @private
   */
  _createChart(chartElement) {
    return new Chart(chartElement, {
      type: 'bar',
      options: {
        responsive: false,
        maintainAspectRatio: false,
        // FIXME: remove this when we upgrade chartjs (see https://github.com/CleverCloud/clever-components/issues/1056)
        // @ts-expect-error
        radius: 0,
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: false,
            stacked: true,
          },
          y: {
            display: false,
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    });
  }

  /**
   * @param {Metric[]} inputData
   * @param {boolean} skeleton
   * @returns {ChartData}
   * @private
   */
  _getChartData(inputData, skeleton) {
    const labels = inputData.map((item) => item.timestamp);
    const values = inputData.map((item) => item.value);

    // We use this series as a trick to scale the chart with the values given (0 to 100).
    // It also serves as a background for the other bar with the data.
    const maxValues = Array.from(new Array(NUMBER_OF_POINTS)).map((_) => 100);

    const colors = inputData.map(({ value }) => {
      return skeleton ? SKELETON_COLOR : this._getColorChart(value);
    });

    return {
      labels,
      datasets: [
        {
          fill: 'origin',
          data: values,
          backgroundColor: colors,
        },
        {
          fill: 'origin',
          data: maxValues,
        },
      ],
    };
  }

  /**
   * @param {number} percent
   * @returns {string} color (rgb)
   * @private
   */
  _getColorChart(percent) {
    if (percent > TOP_THRESHOLD) {
      return TOP_COLOR_CHART;
    } else if (percent > BOTTOM_THRESHOLD) {
      return MIDDLE_COLOR_CHART;
    }
    return BOTTOM_COLOR_CHART;
  }

  /**
   * @param {number} percent
   * @returns {string} color (rgb)
   * @private
   */
  _getColorLegend(percent) {
    if (percent > TOP_THRESHOLD) {
      return TOP_COLOR_PERCENT;
    } else if (percent > BOTTOM_THRESHOLD) {
      return MIDDLE_COLOR_PERCENT;
    }
    return BOTTOM_COLOR_PERCENT;
  }

  /**
   * @returns {'docs'|'error'|'empty'|'chart'|void}
   * @private
   */
  _getCurrentPanel() {
    if (this._docsPanelVisible) {
      return 'docs';
    }
    if (this.metricsState.type === 'error') {
      return 'error';
    }
    if (this.metricsState.type === 'empty') {
      return 'empty';
    }
    if (this.metricsState.type === 'loading' || this.metricsState.type === 'loaded') {
      return 'chart';
    }
  }

  /** @private */
  _onToggleDocs() {
    this._docsPanelVisible = !this._docsPanelVisible;
  }

  firstUpdated() {
    this._cpuChart = this._createChart(this._cpuCtxRef.value);
    this._memChart = this._createChart(this._memCtxRef.value);
  }

  /**
   * We rely on updated instead of willUpdate because we need this._cpuChart and this._memChart before
   * @param {CcTileMetricsPropertyValues} changedProperties
   */
  updated(changedProperties) {
    if (changedProperties.has('metricsState')) {
      this._cpuChart.data =
        this.metricsState.type === 'loaded'
          ? this._getChartData(this.metricsState.metricsData.cpuMetrics, false)
          : this._getChartData(SKELETON_REQUESTS, true);

      this._cpuChart.update();
      this._cpuChart.resize();

      this._memChart.data =
        this.metricsState.type === 'loaded'
          ? this._getChartData(this.metricsState.metricsData.memMetrics, false)
          : this._getChartData(SKELETON_REQUESTS, true);

      this._memChart.update();
      this._memChart.resize();
    }
  }

  render() {
    const skeleton = this.metricsState.type === 'loading';

    const lastCpuValue =
      this.metricsState.type === 'loaded' ? this.metricsState.metricsData.cpuMetrics.slice(-1)[0]?.value : 0;
    const lastMemValue =
      this.metricsState.type === 'loaded' ? this.metricsState.metricsData.memMetrics.slice(-1)[0]?.value : 0;

    const cpuColorType = this.metricsState.type === 'loaded' ? this._getColorLegend(lastCpuValue) : SKELETON_COLOR;
    const memColorType = this.metricsState.type === 'loaded' ? this._getColorLegend(lastMemValue) : SKELETON_COLOR;

    const grafanaLink = this.grafanaLinkState.type === 'loaded' ? this.grafanaLinkState.link : null;

    const panel = this._getCurrentPanel();

    return html`
      <div class="tile_title">
        ${i18n('cc-tile-metrics.title')}
        <div class="docs-buttons">
          ${this.grafanaLinkState.type === 'loaded'
            ? html`
                ${ccLink(
                  this.grafanaLinkState.link,
                  html`
                    <cc-icon
                      class="icon--grafana"
                      .icon=${iconGrafana}
                      a11y-name="${i18n('cc-tile-metrics.link-to-grafana')}"
                    ></cc-icon>
                  `,
                  false,
                  i18n('cc-tile-metrics.link-to-grafana'),
                )}
              `
            : ''}
          <cc-button
            class="docs-toggle ${classMap({
              'icon--close': this._docsPanelVisible,
              'icon--info': !this._docsPanelVisible,
            })}"
            .icon=${this._docsPanelVisible ? iconClose : iconInfo}
            hide-text
            @cc-button:click=${this._onToggleDocs}
          >
            ${this._docsPanelVisible ? i18n('cc-tile-metrics.close-btn') : i18n('cc-tile-metrics.about-btn')}
          </cc-button>
        </div>
      </div>
      <div class="tile_body ${classMap({ 'tile--hidden': panel !== 'chart' })}">
        <div class="category" aria-hidden="true">
          <cc-icon size="lg" class="icon--cpu" .icon=${iconCpu}></cc-icon>
          <div class="chart-container-wrapper chart-cpu">
            <div class="chart-container ${classMap({ skeleton: skeleton })}">
              <canvas id="cpu_chart" ${ref(this._cpuCtxRef)}></canvas>
            </div>
          </div>
          <div
            class="current-percentage percent-cpu ${classMap({
              skeleton,
              'skeleton-data-value': skeleton,
            })}"
            style="color: ${cpuColorType}"
          >
            ${i18n('cc-tile-metrics.percent', { percent: lastCpuValue / 100 })}
          </div>
          <div class="legend-cpu">${i18n('cc-tile-metrics.legend.cpu')}</div>
        </div>
        <div class="category" aria-hidden="true">
          <cc-icon size="lg" class="icon--mem" .icon=${iconMem}></cc-icon>
          <div class="chart-container-wrapper chart-mem">
            <div class="chart-container ${classMap({ skeleton })}">
              <canvas id="mem_chart" ${ref(this._memCtxRef)}></canvas>
            </div>
          </div>
          <div
            class="current-percentage percent-mem ${classMap({
              skeleton,
              'skeleton-data-value': skeleton,
            })}"
            style="color: ${memColorType}"
          >
            ${i18n('cc-tile-metrics.percent', { percent: lastMemValue / 100 })}
          </div>
          <div class="legend-mem">${i18n('cc-tile-metrics.legend.mem')}</div>
        </div>
        ${this.metricsState.type === 'loaded' ? this._renderAccessibleTable(this.metricsState.metricsData) : ''}
      </div>

      <div class="tile_message ${classMap({ 'tile--hidden': panel !== 'empty' })}">
        ${i18n('cc-tile-metrics.empty')}
      </div>

      <div class="tile_message ${classMap({ 'tile--hidden': panel !== 'error' })}">
        <div class="error-message">
          <cc-icon
            .icon="${iconAlert}"
            a11y-name="${i18n('cc-tile-metrics.error.icon-a11y-name')}"
            class="icon-warning"
          ></cc-icon>
          <p>${i18n('cc-tile-metrics.error')}</p>
        </div>
      </div>

      <div class="tile_docs ${classMap({ 'tile--hidden': panel !== 'docs' })}">
        ${i18n('cc-tile-metrics.docs.msg')}
        <div class="docs-links">
          <p>${i18n('cc-tile-metrics.docs.more-metrics')}</p>
          <ul>
            <li>
              ${ccLink(grafanaLink, i18n('cc-tile-metrics.grafana'), skeleton, i18n('cc-tile-metrics.link-to-grafana'))}
            </li>
            ${!isStringEmpty(this.metricsLink)
              ? html`
                  <li>
                    ${ccLink(
                      this.metricsLink,
                      i18n('cc-tile-metrics.metrics-link'),
                      false,
                      i18n('cc-tile-metrics.link-to-metrics'),
                    )}
                  </li>
                `
              : ''}
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * @param {MetricsData} metrics
   * @private
   */
  _renderAccessibleTable({ cpuMetrics, memMetrics }) {
    return html`
      <table class="visually-hidden">
        <caption>
          ${i18n('cc-tile-metrics.title')}
        </caption>
        <thead>
          <tr>
            <th lang="en">${i18n('cc-tile-metrics.a11y.table-header.timestamp')}</th>
            <th>${i18n('cc-tile-metrics.a11y.table-header.cpu')}</th>
            <th>${i18n('cc-tile-metrics.a11y.table-header.mem')}</th>
          </tr>
        </thead>
        <tbody>
          ${cpuMetrics.map((cpuMetric, index) => {
            const memMetric = memMetrics[index];

            return html`
              <tr>
                <th>${i18n('cc-tile-metrics.timestamp-format', { timestamp: cpuMetric.timestamp })}</th>
                <td>${i18n('cc-tile-metrics.percent', { percent: cpuMetric.value / 100 })}</td>
                <td>${i18n('cc-tile-metrics.percent', { percent: memMetric.value / 100 })}</td>
              </tr>
            `;
          })}
        </tbody>
      </table>
    `;
  }

  static get styles() {
    return [
      accessibilityStyles,
      linkStyles,
      skeletonStyles,
      tileStyles,
      // language=CSS
      css`
        /* region header */
        .tile_title {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }

        .tile_title .cc-link {
          align-items: center;
          /* TODO: Change variable when we have proper border token */
          border: 1px solid var(--cc-color-bg-strong);
          border-radius: var(--cc-border-radius-small, 0.15em);
          box-shadow: rgb(255 255 255 / 0%) 0 0 0 0;
          box-sizing: border-box;
          display: flex;
          height: 1.75em;
          justify-content: center;
          transition: box-shadow 75ms ease-in-out 0s;
          width: 1.75em;
        }

        .tile_title .cc-link:hover {
          box-shadow: rgb(0 0 0 / 40%) 0 1px 3px;
        }

        .docs-buttons {
          align-items: center;
          display: flex;
          font-size: 0.8em;
          gap: 0.5em;
        }

        /* endregion */

        /* region chart */

        .chart-container-wrapper {
          grid-area: chart-wrapper;
          height: 100%;
          position: relative;
          width: 100%;
        }

        .chart-cpu {
          grid-area: chart-cpu;
        }

        .chart-mem {
          grid-area: chart-mem;
        }

        .chart-container {
          /* We need this because: https://github.com/chartjs/Chart.js/issues/4156 */
          height: 100%;
          margin: auto;
          min-width: 0;
          position: absolute;
          width: 100%;
        }

        /* endregion */

        /* region tile-body */

        .tile_body {
          align-items: center;
          gap: 0 1em;
          grid-template-areas:
            'icon-cpu chart-cpu percent-cpu'
            '. legend-cpu .'
            'icon-mem chart-mem percent-mem'
            '. legend-mem .';
          grid-template-columns: min-content 1fr min-content;
          grid-template-rows: 1fr max-content 1fr max-content;
          min-height: 8.75em;
          position: relative;
        }

        .percent-cpu {
          grid-area: percent-cpu;
        }

        .percent-mem {
          grid-area: percent-mem;
        }

        .skeleton-data-value {
          background-color: #bbb;
        }

        /*
    body, message and docs are placed in the same area (on top of each other)
    this way, we can just hide the docs
    and let the tile take at least the height of the docs text content
   */

        .tile_body,
        .tile_message,
        .tile_docs {
          grid-area: 2 / 1 / 3 / 2;
        }

        /* See above why we hide instead of display:none */

        .tile--hidden {
          visibility: hidden;
        }

        .category {
          display: contents;
        }

        .current-percentage {
          justify-self: end;
        }

        .legend-cpu,
        .legend-mem {
          align-self: center;
          color: var(--cc-color-text-weak);
          font-size: 0.75em;
          font-style: italic;
          justify-self: center;
          margin-top: 0.5em;
        }

        .legend-cpu {
          grid-area: legend-cpu;
          margin-bottom: 1.25em;
        }

        .legend-mem {
          grid-area: legend-mem;
        }

        .tile_docs {
          align-content: center;
          display: grid;
        }

        p {
          margin: 0;
        }

        .tile_docs ul {
          display: flex;
          gap: 0.5em;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .docs-links {
          align-items: flex-end;
          display: flex;
          gap: 0.5em;
          margin-top: 0.5em;
        }

        /* endregion */

        /* region icons */

        .icon--close {
          --cc-icon-size: 1.4em;
        }

        .icon--info {
          --cc-icon-color: var(--color-blue-60);
          --cc-icon-size: 1.25em;
        }

        .icon--grafana {
          --cc-icon-size: 1.25em;
        }

        .icon--cpu {
          grid-area: icon-cpu;

          --cc-icon-color: var(--cc-color-text-weak);
        }

        .icon--mem {
          grid-area: icon-mem;

          --cc-icon-color: var(--cc-color-text-weak);
        }

        /* endregion */

        /* region error */

        .error-message {
          display: grid;
          gap: 0.75em;
          grid-template-columns: min-content 1fr;
          text-align: left;
        }

        .error-message p {
          margin: 0;
        }

        .icon-warning {
          align-self: center;
          color: var(--cc-color-text-warning);

          --cc-icon-size: 1.25em;
        }

        /* endregion */
      `,
    ];
  }
}

window.customElements.define('cc-tile-metrics', CcTileMetrics);
