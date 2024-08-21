import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { ResizeController } from '../../controllers/resize-controller.js';
import { scrollChildIntoParent } from '../../lib/dom.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { PRIVATE_ZONE, sortZones } from '../../lib/zone.js';
import { i18n } from '../../translations/translation.js';
import '../cc-map-marker-server/cc-map-marker-server.js';
import '../cc-map/cc-map.js';
import '../cc-notice/cc-notice.js';
import '../cc-zone/cc-zone.js';

const SKELETON_ZONES = new Array(6).fill();
const BREAKPOINTS = [600];

/**
 * @typedef {import('./cc-zone-input.types.js').ZoneInputState} ZoneInputState
 * @typedef {import('./cc-zone-input.types.js').ZoneInputPoint} ZoneInputPoint
 * @typedef {import('./cc-zone-input.types.js').ZonePointMarkerState} ZonePointMarkerState
 * @typedef {import('../cc-map/cc-map.js').CcMap} CcMap
 * @typedef {import('../common.types.js').Zone} Zone
 * @typedef {import('lit/directives/ref.js').Ref<CcMap>} CcMapRef
 * @typedef {import('lit').PropertyValues<CcZoneInput>} CcZoneInputPropertyValues
 */

/**
 * A input component to select a zone with a map and a list.
 *
 * ## Details
 *
 * * Zones are sorted in the list using `tags`. Clever Cloud, then private, then regular alphanumeric sort on the city name.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<string>} cc-zone-input:input - Fires the `name` of the selected zone whenever the selection changes.
 */
export class CcZoneInput extends LitElement {
  static get properties() {
    return {
      selected: { type: String },
      state: { type: Object },
      _hovered: { type: String, state: true },
      _legend: { type: String, state: true },
      _points: { type: Array, state: true },
      _sortedZones: { type: Array, state: true },
    };
  }

  constructor() {
    super();

    /** @type {string|null} Sets the `name` of the selected zone. */
    this.selected = null;

    /** @type {ZoneInputState} Sets the state of the component. */
    this.state = { type: 'loading' };

    /** @type {CcMapRef} */
    this._ccMapRef = createRef();

    /** @type {string|null} */
    this._hovered = null;

    /** @type {string} */
    this._legend = '';

    /** @type {ZoneInputPoint[]} */
    this._points = [];

    /** @type {Zone[]|null} */
    this._sortedZones = null;

    new ResizeController(this, {
      widthBreakpoints: BREAKPOINTS,
    });
  }

  /**
   * @param {string} zoneName
   * @returns {ZonePointMarkerState}
   * @private
   */
  _getState(zoneName) {
    if (this.selected === zoneName) {
      return 'selected';
    }
    if (this._hovered === zoneName) {
      return 'hovered';
    }
    return 'default';
  }

  /**
   * @param {string} zoneName
   * @returns {number}
   * @private
   */
  _getZIndexOffset(zoneName) {
    if (this.selected === zoneName) {
      return 200;
    }
    if (this._hovered === zoneName) {
      return 250;
    }
    return 0;
  }

  /**
   * @param {string} [name]
   * @private
   */
  _onListHover(name) {
    this._hovered = name;
    this._updatePoints();
    this._panMap();
  }

  /**
   * @param {Event & { detail: { name: string } }} [event]
   * @private
   */
  _onMarkerHover(event) {
    const name = event?.detail?.name;
    this._hovered = name;
    this._updatePoints();
    this._scrollChildIntoParent(this._hovered || this.selected);
  }

  /**
   * @param {string} name
   * @private
   */
  _onSelect(name) {
    this.selected = name;
    dispatchCustomEvent(this, 'input', this.selected);
  }

  /** @private */
  _panMap() {
    clearTimeout(this._panMapTimeout);
    this._panMapTimeout = setTimeout(() => {
      if (this._hovered != null) {
        const zone = this._sortedZones.find((z) => z.name === this._hovered);
        this._ccMapRef.value?.panInside(zone.lat, zone.lon);
      } else if (this.selected != null) {
        const zone = this._sortedZones.find((z) => z.name === this.selected);
        this._ccMapRef.value?.panInside(zone.lat, zone.lon);
      }
    }, 200);
  }

  /**
   * @param {string} name
   * @private
   */
  _scrollChildIntoParent(name) {
    const parent = this.shadowRoot.querySelector(`.zone-list-wrapper`);
    const child = this.shadowRoot.querySelector(`input[id=${name}]`);
    scrollChildIntoParent(parent, child);
  }

  /** @private */
  _updatePoints() {
    if (!Array.isArray(this._sortedZones)) {
      return;
    }

    // Filter out private zones from the map for now as they may be at the same coordinates and overlap
    this._points = this._sortedZones
      .filter((zone) => !zone.tags.includes(PRIVATE_ZONE))
      .map(
        /**
         * @param {Zone} zone
         * @returns {ZoneInputPoint}
         */
        (zone) => ({
          name: zone.name,
          lat: zone.lat,
          lon: zone.lon,
          marker: { tag: 'cc-map-marker-server', state: this._getState(zone.name), keyboard: false },
          tooltip: { tag: 'cc-zone', state: { type: 'loaded', ...zone }, mode: 'small' },
          zIndexOffset: this._getZIndexOffset(zone.name),
        }),
      );

    this._legend = this._sortedZones.some((zone) => zone.tags.includes(PRIVATE_ZONE))
      ? i18n('cc-zone-input.private-map-warning')
      : '';
  }

  /**
   * updated and not willUdpate because we need this._ccMapRef before
   * @param {CcZoneInputPropertyValues} changedProperties
   */
  updated(changedProperties) {
    if (changedProperties.has('selected') && this.state.type !== 'error') {
      this._updatePoints();
      this._scrollChildIntoParent(this.selected);
      // This could move the map while just after a marker is clicked but it should be a good thing in most cases
      this._panMap();
    }

    if (changedProperties.has('state') && this.state.type === 'loaded') {
      this._updatePoints();
    }

    super.updated(changedProperties);
  }

  /** @param {CcZoneInputPropertyValues} changedProperties */
  willUpdate(changedProperties) {
    if (changedProperties.has('state') && this.state.type === 'loaded') {
      this._sortedZones = sortZones(this.state.zones);
    }
  }

  render() {
    const skeleton = this.state.type === 'loading';
    const zones = this.state.type === 'loaded' ? this._sortedZones : SKELETON_ZONES;

    if (this.state.type === 'error') {
      return html` <cc-notice intent="warning" message="${i18n('cc-zone-input.error')}"></cc-notice> `;
    }

    // Try to zoom out and center the map
    return html`
      <div class="wrapper">
        <cc-map
          view-zoom="1"
          center-lat="35"
          .points=${this._points}
          ?loading=${skeleton}
          @cc-map:marker-click=${
            /** @param {Event & { detail: { name: string } }} event */
            ({ detail }) => this._onSelect(detail.name)
          }
          @cc-map:marker-enter=${this._onMarkerHover}
          @cc-map:marker-leave=${() => this._onMarkerHover()}
          ${ref(this._ccMapRef)}
          >${this._legend}
        </cc-map>
        <div class="zone-list-wrapper">
          <div class="zone-list">
            ${repeat(
              zones,
              (z) => z?.name ?? '',
              (z) => this._renderZoneInput(z, skeleton),
            )}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @param {Zone} zone
   * @param {boolean} skeleton
   * @private
   */
  _renderZoneInput(zone, skeleton) {
    // Simplified template without label/input when skeleton is enabled
    if (skeleton) {
      return html`
        <div class="zone">
          <div class="label">
            <cc-zone></cc-zone>
          </div>
        </div>
      `;
    }

    return html`
      <div class="zone-choice">
        <input
          type="radio"
          name="zone"
          .value=${zone.name}
          id=${zone.name}
          .checked=${zone.name === this.selected}
          @change=${() => this._onSelect(zone.name)}
        />
        <label
          for=${zone.name}
          class="label ${classMap({ hovered: zone.name === this._hovered })}"
          @mouseenter=${() => this._onListHover(zone.name)}
          @mouseleave=${() => this._onListHover()}
        >
          <cc-zone .state=${{ type: 'loaded', ...zone }}></cc-zone>
        </label>
      </div>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }

        .wrapper {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          box-sizing: border-box;
          display: flex;
          height: 100%;
          overflow: hidden;
        }

        cc-map,
        .zone-list-wrapper {
          flex-grow: 1;
        }

        cc-map {
          border-right: 1px solid var(--cc-color-border-neutral, #aaa);
          flex-basis: 0;
          height: 100%;
          width: 100%;
        }

        :host([w-lt-600]) cc-map {
          display: none;
        }

        .zone-list-wrapper {
          box-sizing: border-box;
          height: 100%;
          overflow: auto;
        }

        :host([w-gte-600]) .zone-list-wrapper {
          flex-basis: 24em;
          max-width: 24em;
        }

        .zone-list {
          margin: 0.5em;
        }

        .zone-list:not(:hover):focus-within {
          border-radius: var(--cc-border-radius-default, 0.25em);
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .zone-choice {
          display: grid;
          overflow: hidden;
        }

        input,
        .label {
          grid-area: 1 / 1 / 2 / 2;
        }

        input {
          -moz-appearance: none;
          -webkit-appearance: none;
          appearance: none;
          border: 0;
          box-sizing: border-box;
          display: block;
          margin: -0.5em;
          outline: none;
        }

        .label {
          border: 2px solid var(--bd-color, transparent);
          border-radius: var(--cc-border-radius-default, 0.25em);
          box-sizing: border-box;
          display: block;
          padding: 0.5em;
        }

        label {
          cursor: pointer;
        }

        input:checked + .label {
          --bd-color: var(--cc-color-bg-primary-highlight, #000);
        }

        label.hovered,
        input:hover + .label {
          background: var(--cc-color-bg-neutral, #f9f9f9);
        }

        cc-zone {
          width: 100%;
        }
      `,
    ];
  }
}

window.customElements.define('cc-zone-input', CcZoneInput);
