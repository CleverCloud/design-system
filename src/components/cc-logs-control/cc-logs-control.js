import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconRemixCalendarScheduleLine as dateIcon,
  iconRemixPaletteLine as displayIcon,
  iconRemixPantoneLine as metadataIcon,
  iconRemixSettings_5Line as optionsIcon,
  iconRemixSkipDownLine as scrollToBottomIcon,
} from '../../assets/cc-remix.icons.js';
import { ansiPaletteStyle } from '../../lib/ansi/ansi-palette-style.js';
import defaultPalette from '../../lib/ansi/palettes/default.js';
import everblushPalette from '../../lib/ansi/palettes/everblush.js';
import hyoobPalette from '../../lib/ansi/palettes/hyoob.js';
import nightOwlPalette from '../../lib/ansi/palettes/night-owl.js';
import oneLightPalette from '../../lib/ansi/palettes/one-light.js';
import tokyoNightLightPalette from '../../lib/ansi/palettes/tokyo-night-light.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../translations/translation.js';
import '../cc-button/cc-button.js';
import '../cc-icon/cc-icon.js';
import '../cc-logs/cc-logs.js';
import { DATE_DISPLAYS, TIMEZONES } from '../cc-logs/date-displayer.js';
import '../cc-popover/cc-popover.js';
import '../cc-select/cc-select.js';
import '../cc-toggle/cc-toggle.js';

/**
 * @type {{[key in LogsControlPalette]: string}}
 */
const PALETTES = {
  default: ansiPaletteStyle(defaultPalette),
  'One Light': ansiPaletteStyle(oneLightPalette),
  'Tokyo Night Light': ansiPaletteStyle(tokyoNightLightPalette),
  'Night Owl': ansiPaletteStyle(nightOwlPalette),
  Everblush: ansiPaletteStyle(everblushPalette),
  Hyoob: ansiPaletteStyle(hyoobPalette),
};

/**
 * @typedef {import('../cc-logs/date-display.types.js').DateDisplay} DateDisplay
 * @typedef {import('../cc-logs/cc-logs.types.js').Log} Log
 * @typedef {import('../cc-logs/cc-logs.types.js').MetadataFilter} MetadataFilter
 * @typedef {import('../cc-logs/cc-logs.types.js').MetadataRenderer} MetadataRenderer
 * @typedef {import('../cc-logs/cc-logs.types.js').LogMessageFilterMode} LogMessageFilterMode
 * @typedef {import('./cc-logs-control.types.js').LogsMetadataDisplay} LogsMetadataDisplay
 * @typedef {import('./cc-logs-control.types.js').LogsControlPalette} LogsControlPalette
 * @typedef {import('./cc-logs-control.types.js').LogsControlOption} LogsControlOption
 * @typedef {import('../../lib/date/date.types.js').Timezone} Timezone
 */

/**
 * A component adding visual controls over `<cc-logs>` component.
 *
 * ## Details
 *
 * This component is a wrapper around a `<cc-logs>` component and adds the ability for a user to toggle some options.
 *
 * Controlled options are:
 *
 * * lines wrapping
 * * palette scheme
 * * strip ansi
 * * date display
 * * timezone
 * * displayed metadata
 *
 * Options are encapsulated into a `<cc-popover>` element.
 *
 * @cssdisplay grid
 *
 * @fires {CustomEvent<LogsControlOption>} cc-logs-control:option-change - Fires a `LogsControlOption` whenever an `option` changes.
 *
 * @slot header - The content of the space on top of the logs block.
 */
export class CcLogsControl extends LitElement {
  static get properties() {
    return {
      dateDisplay: { type: String, attribute: 'date-display' },
      follow: { type: Boolean },
      limit: { type: Number },
      logs: { type: Array },
      metadataDisplay: { type: Object },
      messageFilter: { type: String, attribute: 'message-filter' },
      messageFilterMode: { type: String, attribute: 'message-filter-mode' },
      metadataFilter: { type: Array, attribute: 'metadata-filter' },
      metadataRenderers: { type: Object },
      palette: { type: String },
      stripAnsi: { type: Boolean, attribute: 'strip-ansi' },
      timezone: { type: String },
      wrapLines: { type: Boolean, attribute: 'wrap-lines' },
    };
  }

  constructor() {
    super();

    /** @type {DateDisplay} The date display. */
    this.dateDisplay = 'datetime-iso';

    /** @type {boolean} Whether the `cc-logs` should scroll to the bottom everytime a new log line is added. */
    this.follow = false;

    /** @type {number|null} The maximum number of logs to display. `null` for no limit. */
    this.limit = null;

    /** @type {Array<Log>} The initial logs. */
    this.logs = [];

    /** @type {string|null} The filter to apply onto the logs' message. */
    this.messageFilter = null;

    /** @type {LogMessageFilterMode} The mode used to filter by message. */
    this.messageFilterMode = 'loose';

    /** @type {{[key: string]: LogsMetadataDisplay}} An object where key is the metadata name and value controls whether the corresponding metadata should be displayed. */
    this.metadataDisplay = {};

    /** @type {Array<MetadataFilter>} The filter to apply onto the logs' metadata. */
    this.metadataFilter = [];

    /** @type {{[key: string]: MetadataRenderer}} The custom renderers to use for displaying metadata. */
    this.metadataRenderers = {};

    /** @type {LogsControlPalette} The palette to be used. */
    this.palette = 'default';

    /** @type {boolean} Whether to strip ANSI from log message. */
    this.stripAnsi = false;

    /** @type {Timezone} The timezone to use when displaying date. */
    this.timezone = 'UTC';

    /** @type {boolean} Whether to wrap long lines. */
    this.wrapLines = false;

    /** @type {Ref<CcLogs>} */
    this._logsRef = createRef();

    /** @type {{[key: string]: MetadataRenderer}} The resolved metadata renderers to use for displaying metadata. */
    this._resolvedMetadataRenderers = {};
  }

  /* region Public methods */

  /**
   * Appends some logs.
   *
   * @param {Array<Log>} logs The logs to append
   */
  appendLogs(logs) {
    this._logsRef.value?.appendLogs(logs);
  }

  /**
   * Clears the logs
   */
  clear() {
    this._logsRef.value?.clear();
  }

  /* endregion */

  /* region Event handlers */

  _onScrollToBottomButtonClick() {
    this._logsRef.value?.scrollToBottom();
  }

  _onPaletteChange({ detail }) {
    this.palette = detail;
    dispatchCustomEvent(this, 'option-change', { name: 'palette', value: this.palette });
  }

  _onStripAnsiChange(e) {
    this.stripAnsi = e.target.checked;
    dispatchCustomEvent(this, 'option-change', { name: 'strip-ansi', value: this.stripAnsi });
  }

  _onWrapLinesChange(e) {
    this.wrapLines = e.target.checked;
    dispatchCustomEvent(this, 'option-change', { name: 'wrap-lines', value: this.wrapLines });
  }

  _onDateDisplayChange({ detail }) {
    this.dateDisplay = detail;
    dispatchCustomEvent(this, 'option-change', { name: 'date-display', value: this.dateDisplay });
  }

  _onTimezoneChange({ detail }) {
    this.timezone = detail;
    dispatchCustomEvent(this, 'option-change', { name: 'timezone', value: this.timezone });
  }

  _onMetadataChange(e) {
    const name = e.target.dataset.name;
    const isHidden = !e.target.checked;
    this.metadataDisplay = {
      ...this.metadataDisplay,
      [name]: {
        ...this.metadataDisplay[name],
        hidden: isHidden,
      },
    };
    const eventDetail = Object.fromEntries(Object.entries(this.metadataDisplay).map(([k, v]) => [k, !v.hidden]));
    dispatchCustomEvent(this, 'option-change', { name: 'metadata-display', value: eventDetail });
  }

  /* endregion */

  /* region Private methods */

  /**
   * Resolves the metadata renderers according to the `metadataDisplay` and `metadataRenderers` properties.
   *
   * @param {{[key: string]: MetadataRenderer}} metadataRenderers
   * @param {{[key: string]: LogsMetadataDisplay}} metadataDisplay
   * @return {{[key: string]: MetadataRenderer}}
   */
  _resolveMetadataRenderers(metadataRenderers, metadataDisplay) {
    return Object.fromEntries(
      Object.entries(metadataRenderers).map(([name, renderer]) => {
        const display = metadataDisplay[name];

        return [name, display == null || !display.hidden ? renderer : { hidden: true }];
      }),
    );
  }

  /**
   *
   * @param {DateDisplay} dateDisplay
   * @return {string}
   */
  _getDateDisplayLabel(dateDisplay) {
    if (dateDisplay === 'none') {
      return i18n('cc-logs-control.date-display.none');
    }
    if (dateDisplay === 'datetime-iso') {
      return i18n('cc-logs-control.date-display.datetime-iso');
    }
    if (dateDisplay === 'time-iso') {
      return i18n('cc-logs-control.date-display.time-iso');
    }
    if (dateDisplay === 'datetime-short') {
      return i18n('cc-logs-control.date-display.datetime-short');
    }
    if (dateDisplay === 'time-short') {
      return i18n('cc-logs-control.date-display.time-short');
    }
  }

  /**
   *
   * @param {Timezone} timezone
   * @return {string}
   */
  _getTimezoneLabel(timezone) {
    if (timezone === 'UTC') {
      return i18n('cc-logs-control.timezone.utc');
    }
    if (timezone === 'local') {
      return i18n('cc-logs-control.timezone.local');
    }
  }

  /**
   *
   * @param {string} palette
   * @return {string}
   */
  _getPaletteLabel(palette) {
    if (palette === 'default') {
      return i18n('cc-logs-control.palette.default');
    }
    return palette;
  }

  /* endregion */

  willUpdate(changedProperties) {
    if (changedProperties.has('metadataRenderers') || changedProperties.has('metadataDisplay')) {
      this._resolvedMetadataRenderers = this._resolveMetadataRenderers(this.metadataRenderers, this.metadataDisplay);
    }
  }

  render() {
    return html`
      <div class="header"><slot name="header"></slot></div>

      <cc-button
        class="header-scroll-button"
        .icon=${scrollToBottomIcon}
        a11y-name="${i18n('cc-logs-control.scroll-to-bottom')}"
        hide-text
        @cc-button:click=${this._onScrollToBottomButtonClick}
      ></cc-button>

      <cc-popover
        class="header-options-popover"
        .icon=${optionsIcon}
        a11y-name="${i18n('cc-logs-control.show-logs-options')}"
        hide-text
        position="bottom-right"
      >
        <div class="options">
          ${this._renderDisplayOptions()} ${this._renderDateOptions()} ${this._renderMetadataOptions()}
        </div>
      </cc-popover>

      <cc-logs-beta
        class="logs"
        ${ref(this._logsRef)}
        .dateDisplay=${this.dateDisplay}
        ?follow=${this.follow}
        .limit=${this.limit}
        .logs=${this.logs}
        .messageFilter=${this.messageFilter}
        .messageFilterMode=${this.messageFilterMode}
        .metadataFilter=${this.metadataFilter}
        .metadataRenderers=${this._resolvedMetadataRenderers}
        ?strip-ansi=${this.stripAnsi}
        style=${PALETTES[this.palette]}
        .timezone=${this.timezone}
        ?wrap-lines=${this.wrapLines}
      ></cc-logs-beta>
    `;
  }

  _renderDisplayOptions() {
    const PALETTE_CHOICES = Object.entries(PALETTES).map(([p]) => ({ label: this._getPaletteLabel(p), value: p }));

    return html` <div class="options-header">
        <cc-icon .icon=${displayIcon} size="lg"></cc-icon>
        <span>${i18n('cc-logs-control.option-header.display')}</span>
      </div>
      <div class="options-group">
        <cc-select
          label="${i18n('cc-logs-control.palette')}"
          .options=${PALETTE_CHOICES}
          .value=${this.palette}
          @cc-select:input=${this._onPaletteChange}
        ></cc-select>

        <label for="strip-ansi">
          <input id="strip-ansi" type="checkbox" @change=${this._onStripAnsiChange} .checked=${this.stripAnsi} />
          ${i18n('cc-logs-control.strip-ansi')}
        </label>

        <label for="wrap-lines">
          <input id="wrap-lines" type="checkbox" @change=${this._onWrapLinesChange} .checked=${this.wrapLines} />
          ${i18n('cc-logs-control.wrap-lines')}
        </label>
      </div>`;
  }

  _renderDateOptions() {
    const DATE_DISPLAY_CHOICES = DATE_DISPLAYS.map((d) => ({ label: this._getDateDisplayLabel(d), value: d }));
    const TIMEZONE_CHOICES = TIMEZONES.map((z) => ({ label: this._getTimezoneLabel(z), value: z }));

    return html`
      <div class="options-header">
        <cc-icon .icon=${dateIcon} size="lg"></cc-icon>
        <span>${i18n('cc-logs-control.option-header.date')}</span>
      </div>
      <div class="options-group">
        <cc-select
          label="${i18n('cc-logs-control.date-display')}"
          .options=${DATE_DISPLAY_CHOICES}
          .value=${this.dateDisplay}
          @cc-select:input=${this._onDateDisplayChange}
        ></cc-select>

        <cc-select
          label="${i18n('cc-logs-control.timezone')}"
          .options=${TIMEZONE_CHOICES}
          .value=${this.timezone}
          @cc-select:input=${this._onTimezoneChange}
        ></cc-select>
      </div>
    `;
  }

  _renderMetadataOptions() {
    const metadataDisplayEntries = Object.entries(this.metadataDisplay ?? {});
    if (metadataDisplayEntries.length === 0) {
      return null;
    }

    return html`
      <div class="options-header">
        <cc-icon .icon=${metadataIcon} size="lg"></cc-icon>
        <span>${i18n('cc-logs-control.option-header.metadata')}</span>
      </div>
      <div class="options-group">
        ${metadataDisplayEntries.map(([name, display]) => {
          return html`
            <label for="metadata-${name}" class=${classMap({ span: display.icon == null })}>
              <input
                id="metadata-${name}"
                type="checkbox"
                data-name="${name}"
                @change=${this._onMetadataChange}
                .checked=${!display.hidden}
              />
              ${display.label}
            </label>
          `;
        })}
      </div>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          align-items: center;
          column-gap: 0.35em;
          display: grid;
          grid-template-areas:
            'header scroll-button options-popover'
            'logs   logs          logs';
          grid-template-columns: 1fr auto auto;
          grid-template-rows: max-content 1fr;
          row-gap: 0.5em;
        }

        .header {
          grid-area: header;
        }

        .header-scroll-button {
          grid-area: scroll-button;
        }

        .header-options-popover {
          grid-area: options-popover;
        }

        .logs {
          align-self: normal;
          grid-area: logs;
        }

        .options {
          margin: 0.5em 0.75em;
          white-space: nowrap;
        }

        .options-header {
          align-items: center;
          color: var(--cc-color-text-weak, #333);
          display: grid;
          font-weight: bold;
          grid-gap: 0.5em;
          grid-template-columns: auto auto 1fr;
          width: 100%;
        }

        .options-header:not(:first-of-type) {
          margin-top: 1.85em;
        }

        .options-header::after {
          background-color: var(--cc-color-text-weak, #333);
          content: '';
          height: 1px;
        }

        .options-group {
          display: grid;
          grid-template-columns: minmax(max-content, 1fr);
          margin: 1em 0.75em 0.75em;
          row-gap: 0.75em;
        }

        input[type='checkbox'] {
          height: 1em;
          margin: 0;
          width: 1em;
        }

        input[type='checkbox']:focus {
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }
      `,
    ];
  }
}

window.customElements.define('cc-logs-control-beta', CcLogsControl);
