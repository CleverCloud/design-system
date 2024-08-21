import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import {
  iconRemixCheckboxCircleLine as compliantIcon,
  iconRemixCloseCircleLine as notCompliantIcon,
} from '../../assets/cc-remix.icons.js';
import { analyzePalette } from '../../lib/ansi/ansi-palette-analyser.js';
import { ansiPaletteStyle } from '../../lib/ansi/ansi-palette-style.js';
import { i18n } from '../../lib/i18n/i18n.js';
import '../cc-icon/cc-icon.js';
import '../cc-input-text/cc-input-text.js';

const COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

/**
 * @typedef {import('../../lib/ansi/ansi.types.js').AnsiPalette} AnsiPalette
 */

/**
 * A component displaying an ANSI palette.
 *
 * @cssdisplay block
 */
export class CcAnsiPaletteComponent extends LitElement {
  static get properties() {
    return {
      name: { type: String },
      palette: { type: Object },
    };
  }

  constructor() {
    super();
    /** @type {string} The palette name.*/
    this.name = '';
    /** @type {AnsiPalette|null} The palette ANSI palette.*/
    this.palette = null;

    this._style = '';
    this._analysis = null;
  }

  willUpdate(_changedProperties) {
    if (_changedProperties.has('palette')) {
      this._style = ansiPaletteStyle(this.palette).replaceAll(';', ';\n').slice(0, -1);
      this._analysis = analyzePalette(this.palette);
    }
  }

  render() {
    if (this.palette == null) {
      return '';
    }

    return html`
      <div class="main" style="${this._style}">
        <div class="top">
          <div class="title">${this.name}</div>
          <div class="title--right">
            ${i18n('cc-ansi-palette.fg-bg', {
              foreground: this.palette.foreground,
              background: this.palette.background,
            })}
          </div>
        </div>
        <div class="hover">${i18n('cc-ansi-palette.hover', { color: this.palette['background-hover'] })}</div>
        <div class="selected">${i18n('cc-ansi-palette.selected', { color: this.palette['background-selected'] })}</div>

        <div class="colors-grid">${COLORS.map((colorName) => this.renderColorGridLine(colorName))}</div>
      </div>

      <cc-input-text readonly multi clipboard .value=${this._style}></cc-input-text>
    `;
  }

  renderColorGridLine(colorName) {
    const brightColorName = `bright-${colorName}`;
    return html`
      <div class="color color--left">${this.renderColor(colorName)}</div>
      ${this.renderSquare(colorName)} ${this.renderSquare(brightColorName)}
      <div class="color color--right">${this.renderColor(brightColorName)}</div>
    `;
  }

  renderSquare(colorName) {
    return html`<div class="square" style="background-color: var(--cc-color-ansi-${colorName});"></div>`;
  }

  renderColor(colorName) {
    const colorHex = this.palette[colorName];
    const analysis = this._analysis.contrasts[colorName];

    const icon = analysis.compliant ? compliantIcon : notCompliantIcon;
    const accessibleName = analysis.compliant
      ? i18n('cc-ansi-palette.compliant')
      : i18n('cc-ansi-palette.not-compliant');

    return html`
      <span style="color: var(--cc-color-ansi-${colorName});">AaBbMmYyZz</span>
      <span>${colorHex}</span>
      <div class="ratio ${classMap({ compliant: analysis.compliant, 'not-compliant': !analysis.compliant })}">
        <cc-icon .icon=${icon} size="lg" a11y-name="${accessibleName}"></cc-icon>
        ${i18n('cc-ansi-palette.ratio', { ratio: analysis.ratio })}
      </div>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
          font-family: var(--cc-ff-monospace, monospace);
        }

        .top {
          display: flex;
        }

        .top,
        .hover,
        .selected {
          padding: 0.2em;
        }

        .title {
          flex: 1;
          font-weight: bold;
        }

        .title--right {
          flex-shrink: 0;
        }

        .hover {
          background-color: var(--cc-color-ansi-background-hover);
        }

        .selected {
          background-color: var(--cc-color-ansi-background-selected);
        }

        .colors-grid {
          align-items: center;
          display: grid;
          grid-column-gap: 0.5em;
          grid-template-columns: 1fr min-content min-content 1fr;
          padding-bottom: 1em;
          padding-top: 1em;
        }

        .color-line {
          align-items: center;
          display: flex;
          gap: 0.5em;
        }

        .palette-squares {
          display: inline-flex;
        }

        .palette-colors {
          display: flex;
        }

        .square {
          height: 3em;
          width: 3em;
        }

        .color {
          align-items: center;
          display: inline-flex;
          gap: 1em;
          justify-content: center;
        }

        .color--left {
          justify-self: end;
        }

        .color--right {
          justify-self: start;
        }

        .ratio {
          align-items: center;
          display: inline-flex;
          gap: 0.3em;
          justify-content: center;
        }

        .compliant {
          color: var(--cc-color-text-success, green);
        }

        .not-compliant {
          color: var(--cc-color-text-danger, red);
        }

        cc-input-text {
          margin-top: 1em;
          max-height: 200px;
          overflow: auto;
        }
      `,
    ];
  }
}

window.customElements.define('cc-ansi-palette', CcAnsiPaletteComponent);
