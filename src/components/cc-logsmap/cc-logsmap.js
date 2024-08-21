import { css, html, LitElement } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../translations/translation.js';
import '../cc-map-marker-dot/cc-map-marker-dot.js';
import '../cc-map/cc-map.js';
import '../cc-toggle/cc-toggle.js';

/**
 * @typedef {import('../common.types.js').HeatmapPoint} HeatmapPoint
 * @typedef {import('../common.types.js').MapModeType} MapModeType
 * @typedef {import('../common.types.js').Point} Point
 */

/**
 * World map of access logs with two modes: blinking dots or heatmap.
 *
 * ## Details
 *
 * * This component wraps `<cc-map>` with a clickable toggle for the mode.
 * * It has predefined i18n label for the toggle and the legend (to display logs).
 * * The legend is contextualized to an organization or an app so you MUST set either `orgaName` or `appName` but not both.
 * * The component has a default height of 15em and a default width 20em but this can be overridden with CSS.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<MapModeType>} cc-logsmap:mode - Fires the selected mode whenever the toggle changes.
 */
export class CcLogsMap extends LitElement {
  static get properties() {
    return {
      appName: { type: String, attribute: 'app-name' },
      availableModes: { type: Array, attribute: 'available-modes' },
      centerLat: { type: Number, attribute: 'center-lat' },
      centerLon: { type: Number, attribute: 'center-lon' },
      error: { type: Boolean, reflect: true },
      heatmapPoints: { type: Array, attribute: 'heatmap-points' },
      loading: { type: Boolean, reflect: true },
      mode: { type: String },
      orgaName: { type: String, attribute: 'orga-name' },
      viewZoom: { type: Number, attribute: 'view-zoom' },
      // Internal state for child component <cc-map>
      _points: { type: Array, state: true },
    };
  }

  constructor() {
    super();

    /** @type {string} Sets the name of the app for which we display the logs (don't use it with `orgaName`). */
    this.appName = null;

    /** @type {MapModeType[]} Sets available map modes in order: `"points"` for blinking temporary dots and `"heatmap"` for a heatmap. */
    this.availableModes = ['points', 'heatmap'];

    // Centered on Paris by default
    /** @type {number} Sets the latitude center of the map. */
    this.centerLat = 48.9;

    /** @type {number} Sets the longitude center of the map. */
    this.centerLon = 2.4;

    /** @type {boolean} Displays an error message (can be combined with `loading`). */
    this.error = false;

    /** @type {HeatmapPoint[]|null} Sets the list of points used to draw the heatmap. */
    this.heatmapPoints = null;

    /** @type {boolean} Displays a loader on top of the map (can be combined with `error`). */
    this.loading = false;

    /** @type {MapModeType} Sets map mode: `"points"` for blinking temporary dots and `"heatmap"` for a heatmap. */
    this.mode = 'points';

    /** @type {string|null} Sets the name of the organization for which we display the logs (don't use it with `appName`). */
    this.orgaName = null;

    /** @type {number} Sets the zoom of the map (between 1 and 6). */
    this.viewZoom = 2;

    /** @type {Point[]} */
    this._points = [];

    this._pointsByCoords = {};
  }

  /**
   * Add several points to the map with blinking dots markers.
   * @param {Point[]} points - List of points.
   * @param {PointsOptions} options - Options to spread the display of the different points over time.
   */
  addPoints(points, options = {}) {
    const { spreadDuration = false } = options;

    const timeStep = spreadDuration !== false ? Math.floor(spreadDuration / points.length) : 0;

    points.forEach((p, i) => {
      setTimeout(() => this._addPoint(p), timeStep * i);
    });
  }

  _addPoint({ lat, lon, count = 1, delay = 1000, tooltip }) {
    const coords = [lat, lon].join(',');
    const newPoint = { lat, lon, count, tooltip };

    // Add point now
    if (this._pointsByCoords[coords] == null) {
      this._pointsByCoords[coords] = [];
    }
    this._pointsByCoords[coords].push(newPoint);

    this._updatePoints();

    // Schedule delete point
    setTimeout(() => {
      this._pointsByCoords[coords] = this._pointsByCoords[coords].filter((p) => p !== newPoint);
      if (this._pointsByCoords[coords].length === 0) {
        delete this._pointsByCoords[coords];
      }
      this._updatePoints();
    }, delay);
  }

  _updatePoints() {
    // Merge points at the same coordinates:
    // * sum "count"
    // * concatenante "tooltip" (3 max)
    this._points = Object.entries(this._pointsByCoords).map(([coords, points]) => {
      const { lat, lon } = points[0];

      const count = points.map((p) => p.count).reduce((a, b) => a + b, 0);

      const allTooltips = points.filter((p) => p.tooltip != null && p.tooltip !== '').map((p) => p.tooltip);

      const uniqueTooltips = Array.from(new Set(allTooltips));

      if (uniqueTooltips.length >= 3) {
        // Only keep first 3 values
        uniqueTooltips.length = 3;
        uniqueTooltips[2] = uniqueTooltips[2] + '...';
      }

      const tooltip = uniqueTooltips.length > 0 ? uniqueTooltips.join('<br>') : null;

      return { lat, lon, marker: { tag: 'cc-map-marker-dot', count }, tooltip };
    });
  }

  _getModes() {
    const modes = [
      { label: i18n('cc-logsmap.mode.points'), value: 'points' },
      { label: i18n('cc-logsmap.mode.heatmap'), value: 'heatmap' },
    ];
    return this.availableModes
      .map((m) => {
        return modes.find(({ value }) => value === m);
      })
      .filter((mode) => mode != null);
  }

  _getLegend() {
    if (this.mode === 'points') {
      return this.appName == null
        ? i18n('cc-logsmap.legend.points', { orgaName: this.orgaName })
        : i18n('cc-logsmap.legend.points.app', { appName: this.appName });
    }
    return this.appName == null
      ? i18n('cc-logsmap.legend.heatmap', { orgaName: this.orgaName })
      : i18n('cc-logsmap.legend.heatmap.app', { appName: this.appName });
  }

  render() {
    const modes = this._getModes();
    return html`
      ${modes.length > 1
        ? html` <cc-toggle .choices=${modes} value=${this.mode} @cc-toggle:input=${this._onModeChange}></cc-toggle> `
        : ''}
      <cc-map
        center-lat=${this.centerLat}
        center-lon=${this.centerLon}
        view-zoom=${this.viewZoom}
        mode=${this.mode}
        ?loading=${this.loading}
        ?error=${this.error}
        .heatmapPoints=${this.heatmapPoints}
        .points=${this._points}
        >${this._getLegend()}
      </cc-map>
    `;
  }

  _onModeChange({ detail: mode }) {
    this.mode = mode;
    dispatchCustomEvent(this, 'mode', this.mode);
  }

  static get styles() {
    // language=CSS
    return css`
      :host {
        background-color: var(--cc-color-bg-default, #fff);
        border: 1px solid var(--cc-color-border-neutral, #aaa);
        border-radius: var(--cc-border-radius-default, 0.25em);
        display: block;
        height: 15em;
        overflow: hidden;
        position: relative;
        width: 20em;
      }

      cc-toggle {
        left: 0.5em;
        position: absolute;
        top: 0.5em;
        z-index: 2;
      }

      cc-map {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 1;
      }

      cc-map[view-zoom='1'] {
        --cc-map-marker-dot-size: 6px;
      }

      cc-map[view-zoom='2'] {
        --cc-map-marker-dot-size: 8px;
      }

      cc-map[view-zoom='3'] {
        --cc-map-marker-dot-size: 10px;
      }

      cc-map[view-zoom='4'] {
        --cc-map-marker-dot-size: 12px;
      }

      cc-map[view-zoom='5'] {
        --cc-map-marker-dot-size: 14px;
      }

      cc-map[view-zoom='6'] {
        --cc-map-marker-dot-size: 16px;
      }
    `;
  }
}

window.customElements.define('cc-logsmap', CcLogsMap);
