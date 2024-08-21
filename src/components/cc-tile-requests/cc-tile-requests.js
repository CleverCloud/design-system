import { BarController, BarElement, CategoryScale, Chart, LinearScale, Title, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { LitElement, css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { iconCleverInfo as iconInfo } from '../../assets/cc-clever.icons.js';
import { iconRemixAlertFill as iconAlert, iconRemixCloseLine as iconClose } from '../../assets/cc-remix.icons.js';
import { ResizeController } from '../../controllers/resize-controller.js';
import { tileStyles } from '../../styles/info-tiles.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-button/cc-button.js';

Chart.register(BarController, BarElement, Tooltip, CategoryScale, LinearScale, Title);

/** @type {RequestsData[]} */
const SKELETON_REQUESTS = Array.from(new Array(24)).map(() => [0, 0, 1]);

/**
 * @typedef {import('./cc-tile-requests.types.js').RequestsData} RequestsData
 * @typedef {import('./cc-tile-requests.types.js').TileRequestsState} TileRequestsState
 * @typedef {import('./cc-tile-requests.types.js').TileRequestsStateLoaded} TileRequestsStateLoaded
 * @typedef {import('./cc-tile-requests.types.js').TileRequestsStateLoading} TileRequestsStateLoading
 * @typedef {import('./cc-tile-requests.types.js').TileRequestsStateError} TileRequestsStateError
 * @typedef {import('lit/directives/ref.js').Ref<HTMLCanvasElement>} RefCanvas
 * @typedef {import('lit').PropertyValues<CcTileRequests>} CcTileRequestsPropertyValues
 */

/**
 * A "tile" component to display HTTP requests distribution over the last 24 hours in a bar chart.
 *
 * ## Details
 *
 * * When `data` is nullish, a skeleton screen UI pattern is displayed (loading hint).
 * * A short doc is available when the (i) button is clicked.
 * * `data` MUST be an array of 24 slices of one hour but the display will depend on the width of the component:
 *   * 6 bars of 4 hours
 *   * 8 bars of 3 hours
 *   * 12 bars of 2 hours
 *
 * @cssdisplay grid
 */
export class CcTileRequests extends LitElement {
  static get properties() {
    return {
      state: { type: Object },
      _barCount: { type: Number, state: true },
      _docs: { type: Boolean, state: true },
      _empty: { type: Boolean, state: true },
    };
  }

  constructor() {
    super();

    /** @type {TileRequestsState} Sets the state of the component. */
    this.state = { type: 'loading' };

    // Default to lower resolution
    /** @type {number} */
    this._barCount = 6;

    /** @type {RefCanvas} */
    this._ctxRef = createRef();

    /** @type {boolean} */
    this._docs = false;

    /** @type {boolean} */
    this._empty = false;

    /** @type {ResizeController} */
    this._resizeController = new ResizeController(this);
  }

  /** @private */
  _onToggleDocs() {
    this._docs = !this._docs;
  }

  /** @private */
  async _refreshChart() {
    const skeleton = this.state.type === 'loading';

    const data = this.state.type === 'loaded' ? this.state.data : SKELETON_REQUESTS;

    this._empty = data.length === 0;

    if (this._empty) {
      return;
    }

    const windowSize = 24 / this._barCount;

    this._groupedData = Array.from(new Array(this._barCount)).map((_, i) => {
      const fromIndex = i * windowSize;
      const toIndex = (i + 1) * windowSize;
      const fromTs = data[fromIndex][0];
      const toTs = data[toIndex - 1][1];
      const requestCount = data
        .slice(fromIndex, toIndex)
        .map((item) => item[2])
        .reduce((a, b) => a + b, 0);
      return [fromTs, toTs, requestCount];
    });

    this._groupedValues = this._groupedData.map(([_, __, requestCount]) => requestCount);

    this._xLabels = skeleton
      ? this._groupedData.map(() => '??')
      : this._groupedData.map(([from]) => i18n('cc-tile-requests.date-hours', { date: from }));

    const backgroundColor = skeleton ? '#bbb' : '#30ab61';

    await this.updateComplete;

    // * 1.2 helps to let some white space on top of the bar for the label
    // (I didn't found a better yet)
    const maxRequestCount = Math.ceil(Math.max(...this._groupedValues) * 1.2);
    // @ts-expect-error TODO : remove when we updrade ChartJS (see https://github.com/CleverCloud/clever-components/issues/1056)
    this._chart.options.scales.y.suggestedMax = maxRequestCount;

    this._chart.options.plugins.tooltip.enabled = !skeleton;

    const totalRequests = this._groupedValues.reduce((a, b) => a + b, 0);
    this._chart.options.plugins.title.text = skeleton
      ? '...'
      : i18n('cc-tile-requests.requests-nb.total', { totalRequests });

    this._chart.data = {
      labels: this._xLabels,
      datasets: [
        {
          backgroundColor,
          data: this._groupedValues,
        },
      ],
    };

    // Disable animations when skeleton
    // @ts-expect-error TODO : remove when we updrade ChartJS (see https://github.com/CleverCloud/clever-components/issues/1056)
    this._chart.options.animation.duration = skeleton ? 0 : 300;

    this._chart.update();
    this._chart.resize();
  }

  firstUpdated() {
    this._chart = new Chart(this._ctxRef.value, {
      // @ts-expect-error TODO : remove when we updrade ChartJS (see https://github.com/CleverCloud/clever-components/issues/1056)
      plugins: [ChartDataLabels],
      type: 'bar',
      options: {
        // We don't need the responsive mode because we already observe resize to compute bar count
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            position: 'bottom',
            padding: 0,
            font: {
              style: 'italic',
              weight: 'normal',
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#000',
            displayColors: false,
            callbacks: {
              title: ([context]) => {
                const [from, to] = this._groupedData[context.dataIndex];
                return i18n('cc-tile-requests.date-tooltip', { from, to });
              },
              label: (context) => {
                const windowHours = 24 / this._barCount;
                return i18n('cc-tile-requests.requests-nb', {
                  value: this._groupedValues[context.dataIndex],
                  windowHours,
                });
              },
            },
          },
          datalabels: {
            anchor: 'end',
            offset: 0,
            align: 'end',
            formatter: (value) => {
              return this.state.type === 'loading'
                ? '?'
                : i18n('cc-tile-requests.requests-count', { requestCount: value });
            },
          },
        },
        scales: {
          x: {
            grid: {
              drawOnChartArea: false,
              drawTicks: false,
            },
            ticks: {
              padding: 10,
              font: { size: 12 },
            },
          },
          y: {
            display: false,
            beginAtZero: true,
          },
        },
        animation: {
          duration: 0,
        },
      },
    });
  }

  willUpdate() {
    const { width } = this._resizeController;

    if (width < 380) {
      this._barCount = 6;
    }
    if (width >= 380 && width < 540) {
      this._barCount = 8;
    }
    if (width >= 540) {
      this._barCount = 12;
    }

    this._refreshChart();
  }

  // updated and not udpate because we need this._chart before
  /** @param {CcTileRequestsPropertyValues} changedProperties */
  updated(changedProperties) {
    if (changedProperties.has('state') && (this.state.type === 'loaded' || this.state.type === 'loading')) {
      this._refreshChart();
    }
    super.updated(changedProperties);
  }

  render() {
    const displayChart = (this.state.type === 'loaded' || this.state.type === 'loading') && !this._empty && !this._docs;
    const displayError = this.state.type === 'error' && !this._docs;
    const displayEmpty = this.state.type === 'loaded' && this._empty && !this._docs;
    const displayDocs = this._docs;

    return html`
      <div class="tile_title tile_title--image">
        ${i18n('cc-tile-requests.title')}
        <cc-button
          class="docs-toggle ${displayDocs ? 'close' : 'info'}"
          .icon=${displayDocs ? iconClose : iconInfo}
          hide-text
          outlined
          primary
          @cc-button:click=${this._onToggleDocs}
          >${this._docs ? i18n('cc-tile-requests.close-btn') : i18n('cc-tile-requests.about-btn')}
        </cc-button>
      </div>

      <div class="tile_body ${classMap({ 'tile--hidden': !displayChart })}">
        <div class="chart-container ${classMap({ skeleton: this.state.type === 'loading' })}">
          <canvas ${ref(this._ctxRef)}></canvas>
        </div>
      </div>

      <div class="tile_message ${classMap({ 'tile--hidden': !displayEmpty })}">${i18n('cc-tile-requests.empty')}</div>

      <div class="tile_message ${classMap({ 'tile--hidden': !displayError })}">
        <div class="error-message">
          <cc-icon
            .icon="${iconAlert}"
            a11y-name="${i18n('cc-tile-requests.error.icon-a11y-name')}"
            class="icon-warning"
          ></cc-icon>
          <p>${i18n('cc-tile-requests.error')}</p>
        </div>
      </div>

      <div class="tile_docs ${classMap({ 'tile--hidden': !displayDocs })}">
        <p>${i18n('cc-tile-requests.docs.msg', { windowHours: 24 / this._barCount })}</p>
      </div>
    `;
  }

  static get styles() {
    return [
      tileStyles,
      skeletonStyles,
      // language=CSS
      css`
        .tile_title {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }

        .docs-toggle {
          font-size: 0.8em;
          margin: 0 0 0 1em;
        }

        .docs-toggle.close {
          --cc-icon-size: 1.5em;
        }

        .docs-toggle.info {
          --cc-icon-size: 1.25em;
        }

        .chart-container {
          /* We need this because: https://github.com/chartjs/Chart.js/issues/4156 */
          height: 100%;
          min-width: 0;
          position: absolute;
          width: 100%;
        }

        /*
    body, message and docs are placed in the same area (on top of each other)
    this way, we can just hide the docs
    and let the tile take at least the height of the docs text content
   */

        .tile_body,
        .tile_message,
        .tile_docs {
          grid-area: 2 / 1 / 2 / 1;
        }

        /* See above why we hide instead of display:none */

        .tile--hidden {
          visibility: hidden;
        }

        .tile_body {
          min-height: 140px;
          position: relative;
        }

        .tile_docs {
          align-self: center;
          font-size: 0.9em;
          font-style: italic;
        }

        .tile_docs_link {
          color: var(--cc-color-text-primary-highlight);
          text-decoration: underline;
        }

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
      `,
    ];
  }
}

window.customElements.define('cc-tile-requests', CcTileRequests);
