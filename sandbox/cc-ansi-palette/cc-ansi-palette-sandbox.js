import { html, LitElement } from 'lit';
import '../../src/components/cc-ansi-palette/cc-ansi-palette.js';
import '../../src/components/cc-select/cc-select.js';
import '../../src/components/cc-toggle/cc-toggle.js';
import { analyzePalette } from '../../src/lib/ansi/ansi-palette-analyser.js';
import { hexToRgb, isDark } from '../../src/lib/color.js';
import { i18n } from '../../src/lib/i18n/i18n.js';
import { sandboxStyles } from '../sandbox-styles.js';
import { getGoghPalettes } from './gogh-palettes.js';

const TYPES = [
  { label: 'light', value: 'light' },
  { label: 'dark', value: 'dark' },
];

export class CcAnsiPaletteSandbox extends LitElement {
  static get properties() {
    return {
      _palettes: { type: String, state: true },
      _selectedPaletteName: { type: String, state: true },
      _type: { type: String, state: true },
    };
  }

  constructor() {
    super();

    this._type = 'light';
    this._selectedPaletteName = null;
    this._palettes = [];
    this._paletteChoices = [];
  }

  _getPaletteChoices() {
    return Object.values(this._palettes)
      .filter((p) => p.type === this._type)
      .sort((p1, p2) => {
        const compliantColors = p2.analysis.compliantColors - p1.analysis.compliantColors;
        if (compliantColors !== 0) {
          return compliantColors;
        }
        return p2.analysis.contrastAvg - p1.analysis.contrastAvg;
      })
      .map((p) => {
        return {
          label: `${p.name} - ${p.analysis.compliantColors}/${p.analysis.totalColors} - ${i18n('cc-ansi-palette.ratio', { ratio: p.analysis.contrastAvg })}`,
          value: p.name,
        };
      });
  }

  _getSelectedPalette() {
    return this._palettes[this._selectedPaletteName];
  }

  _onTypeToggle({ detail }) {
    this._type = detail;
  }

  _onPaletteToggle({ detail }) {
    this._selectedPaletteName = detail;
    console.log(this._selectedPaletteName);
  }

  firstUpdated(changedProperties) {
    getGoghPalettes().then((goghPalettes) => {
      this._palettes = Object.fromEntries(
        Object.entries(goghPalettes).map(([name, p]) => {
          return [
            name,
            {
              name: name,
              palette: p,
              type: isDark(hexToRgb(p.background)) ? 'dark' : 'light',
              analysis: analyzePalette(p),
            },
          ];
        }),
      );
    });
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('_palettes') || changedProperties.has('_type')) {
      this._paletteChoices = this._getPaletteChoices();
    }

    if (changedProperties.has('_type') || this._selectedPaletteName == null) {
      this._selectedPaletteName = this._paletteChoices[0]?.value;
    }
  }

  render() {
    return html`
      <div class="ctrl-top">
        <cc-toggle
          legend="Type"
          inline
          .value=${`${this._type}`}
          .choices=${TYPES}
          @cc-toggle:input=${this._onTypeToggle}
        ></cc-toggle>
        <cc-select
          label="Palette"
          inline
          .options=${this._paletteChoices}
          .value=${this._selectedPaletteName}
          @cc-select:input=${this._onPaletteToggle}
        ></cc-select>
      </div>
      <cc-ansi-palette
        class="main"
        .name=${this._selectedPaletteName}
        .palette=${this._getSelectedPalette()?.palette}
      ></cc-ansi-palette>
    `;
  }

  static get styles() {
    return [sandboxStyles];
  }
}

window.customElements.define('cc-ansi-palette-sandbox', CcAnsiPaletteSandbox);
