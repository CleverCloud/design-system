import './cc-zone.js';
import '../maps/cc-map.js';
import '../maps/cc-map-marker-server.js';
import { css, html, LitElement } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { dispatchCustomEvent } from '../lib/events.js';
import { i18n } from '../lib/i18n.js';
import { withResizeObserver } from '../mixins/with-resize-observer.js';

const SKELETON_ZONES = new Array(6).fill(null);
const CLEVER_CLOUD_ZONE = 'infra:clever-cloud';
const PRIVATE_ZONE = 'scope:private';

/**
 * A input component to select a zone with a map and a list.
 *
 * * 🎨 default CSS display: `grid`
 * <br>
 * 🧐 [component's source code on GitHub](https://github.com/CleverCloud/clever-components/blob/master/src/zones/cc-zone-input.js)
 *
 * ## Details
 *
 * * When `zones` is nullish, a skeleton screen UI pattern is displayed (loading hint).
 * * Zones are sorted in the list using `tags`. Clever Cloud, then private, then regular alphanumeric sort on the city name.
 *
 * ## Type definitions
 *
 * ```js
 * interface Zone {
 *   name: string,          // Unique code/identifier for the zone
 *   lat: number,           // Latitude
 *   lon: number,           // Longitude
 *   countryCode: string,   // ISO 3166-1 alpha-2 code of the country (2 letters): "fr", "ca", "us"...
 *   city: string,          // Name of the city in english: "Paris", "Montreal", "New York City"...
 *   country: string,       // Name of the country in english: "France", "Canada", "United States"...
 *   displayName?: string,  // Optional display name for private zones (instead of displaying city + country): "ACME (dedicated)"...
 *   tags: string[],        // Array of strings for semantic tags: ["region:eu", "infra:clever-cloud"], ["scope:private"]...
 * }
 * ```
 *
 * @prop {Boolean} error - Displays an error message.
 * @prop {String} selected - Sets the `name` of the selected zone.
 * @prop {Zone[]} zones - Sets the list of available zones.
 *
 * @event {CustomEvent<String>} cc-zone-input:input - Fires the `name` of the selected zone whenever the selection changes.
 */
export class CcZoneInput extends withResizeObserver(LitElement) {

  static get properties () {
    return {
      error: { type: Boolean, reflect: true },
      selected: { type: String },
      zones: { type: Array },
      _centerLat: { type: Number },
      _centerLon: { type: Number },
      _hovered: { type: String },
      _points: { type: Array },
    };
  }

  constructor (props) {
    super(props);
    this.error = false;
    /** @protected */
    this.breakpoints = {
      width: [600],
    };
    this._points = [];
  }

  get selected () {
    return this._selected;
  }

  get zones () {
    return this._zones;
  }

  set selected (newVal) {
    const oldVal = this._selected;
    this._selected = newVal;
    this.requestUpdate('selected', oldVal).then(() => {
      this._updatePoints();
      this._scrollIntoView(this._selected);
      // This could move the map while just after a marker is clicked but it should be a good thing in most cases
      this._panMap();
    });
  }

  set zones (newVal) {
    const oldVal = this._zones;
    this._zones = this._sortZones(newVal);
    this.requestUpdate('zones', oldVal)
      .then(() => this._updatePoints());
  }

  _updatePoints () {

    if (!Array.isArray(this.zones)) {
      return;
    }

    this._points = this.zones.map((zone) => ({
      name: zone.name,
      lat: zone.lat,
      lon: zone.lon,
      marker: { tag: 'cc-map-marker-server', state: this._getState(zone.name) },
      tooltip: { tag: 'cc-zone', zone, mode: 'small' },
      zIndexOffset: this._getZIndexOffset(zone.name),
    }));
  }

  _getState (zoneName) {
    if (this.selected === zoneName) {
      return 'selected';
    }
    if (this._hovered === zoneName) {
      return 'hovered';
    }
    return 'default';
  }

  _getZIndexOffset (zoneName) {
    if (this.selected === zoneName) {
      return 200;
    }
    if (this._hovered === zoneName) {
      return 250;
    }
    return 0;
  }

  // 1. Clever Cloud zones "infra:clever-cloud"
  // 2. Private zones "scope:private"
  // 3. Alphanum sort on city
  _sortZones (zones) {
    return [...zones].sort((a, b) => {
      if (a == null || b == null) {
        return 0;
      }
      if (a.tags.includes(CLEVER_CLOUD_ZONE) !== b.tags.includes(CLEVER_CLOUD_ZONE)) {
        return a.tags.includes(CLEVER_CLOUD_ZONE) ? -1 : 1;
      }
      if (a.tags.includes(PRIVATE_ZONE) !== b.tags.includes(PRIVATE_ZONE)) {
        return a.tags.includes(PRIVATE_ZONE) ? -1 : 1;
      }
      return a.city.localeCompare(b.city);
    });
  }

  _onSelect (name) {
    this.selected = name;
    dispatchCustomEvent(this, 'input', this.selected);
  }

  _onListHover (name) {
    this._hovered = name;
    this._updatePoints();
    this._panMap();
  }

  _onMarkerHover (name) {
    this._hovered = name;
    this._updatePoints();
    this._scrollIntoView(this._hovered || this.selected);
  }

  _panMap () {
    clearTimeout(this._panMapTimeout);
    this._panMapTimeout = setTimeout(() => {
      if (this._hovered != null) {
        const zone = this.zones.find((z) => z.name === this._hovered);
        this._map.panInside(zone.lat, zone.lon);
      }
      else if (this.selected != null) {
        const zone = this.zones.find((z) => z.name === this.selected);
        this._map.panInside(zone.lat, zone.lon);
      }
    }, 200);
  }

  _scrollIntoView (name) {
    clearTimeout(this._scrollListTimeout);
    this._scrollListTimeout = setTimeout(() => {
      if (name == null) {
        return;
      }
      this.shadowRoot.querySelector(`input[id=${name}]`).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 200);
  }

  _renderZoneInput (zone) {

    // Simplified template without label/input when skeleton is enabled
    if (zone == null) {
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
          @change=${(e) => this._onSelect(zone.name)}
        >
        <label
          for=${zone.name}
          class="label ${classMap({ hovered: zone.name === this._hovered })}"
          @mouseenter=${() => this._onListHover(zone.name)}
          @mouseleave=${() => this._onListHover()}
        >
          <cc-zone .zone=${zone}></cc-zone>
        </label>
      </div>
    `;
  }

  render () {

    const skeleton = (this.zones == null);
    const zones = skeleton ? SKELETON_ZONES : this.zones;

    return html`
      <cc-map
        .points=${this._points}
        ?loading=${skeleton && !this.error}
        @cc-map:marker-click=${(e) => this._onSelect(e.detail.name)}
        @cc-map:marker-enter=${(e) => this._onMarkerHover(e.detail.name)}
        @cc-map:marker-leave=${(e) => this._onMarkerHover()}
      ></cc-map>
      <div class="zone-list-wrapper">
        ${this.error ? html`
          <cc-error>${i18n('cc-zone-input.error')}</cc-error>
        ` : ''}
        ${!this.error ? html`
          <div class="zone-list">
            ${repeat(zones, (z) => z.name, (z) => this._renderZoneInput(z))}
          </div>
        ` : ''}
      </div>
    `;
  }

  firstUpdated () {
    this._map = this.shadowRoot.querySelector('cc-map');
  }

  static get styles () {
    return [
      // language=CSS
      css`
        :host {
          background-color: #fff;
          border: 1px solid #bcc2d1;
          border-radius: 0.25rem;
          box-sizing: border-box;
          display: grid;
          grid-template-rows: 1fr;
          overflow: hidden;
        }

        :host([w-lt-600]),
        :host([error]) {
          grid-template-columns: 1fr;
        }

        :host(:not([error])[w-gte-600]) {
          grid-template-columns: 1fr 24rem;
        }

        :host([w-lt-600]) cc-map,
        :host([error]) cc-map {
          display: none;
        }

        cc-map {
          border-right: 1px solid #bcc2d1;
          height: 100%;
          width: 100%;
        }

        .zone-list-wrapper {
          box-sizing: border-box;
          height: 100%;
          overflow: auto;
        }

        :host([error]) .zone-list-wrapper {
          display: flex;
          padding: 1rem;
        }

        :host([error]) cc-error {
          margin: auto;
        }

        .zone-list {
          margin: 0.5rem;
        }

        .zone-list:not(:hover):focus-within {
          border-radius: 0.25rem;
          box-shadow: 0 0 0 .2em rgba(50, 115, 220, .25);
          outline: 0;
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
          margin: -0.5rem;
          outline: none;
        }

        .label {
          border: 2px solid var(--bd-color, transparent);
          border-radius: 0.25rem;
          box-sizing: border-box;
          display: block;
          padding: 0.5rem;
        }

        label {
          cursor: pointer;
        }

        input:checked + .label {
          --bd-color: #2b96fd;
        }

        label.hovered,
        input:hover + .label {
          background: #f3f3f3;
        }

        cc-zone {
          width: 100%;
        }
      `,
    ];
  }
}

window.customElements.define('cc-zone-input', CcZoneInput);