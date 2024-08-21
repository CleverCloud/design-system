import { css, html, LitElement } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { i18n } from '../../lib/i18n/i18n.js';

/**
 * A loading indicator, auto centered and with flexible size.
 *
 * ## Details
 *
 * * Size this component like you want, the loading circle will be centered automatically.
 * * One can change the default accessible name with the `a11yName` property or `a11y-name` attribute.
 *
 * @cssdisplay flex
 *
 * @cssprop {Color} --cc-loader-color - The color of the animated circle (defaults: `#2653af`).
 */
export class CcLoader extends LitElement {
  static get properties() {
    return {
      a11yName: { type: String, attribute: 'a11y-name' },
    };
  }

  constructor() {
    super();

    /** @type {string|null} The accessible name to set on the svg.
     *
     * If this prop has a value:
     *
     *  * sets a `role="img"` and `aria-label="the value of this prop"` attributes on the `<svg>` element.
     *  * creates a `<title>` element inside the `<svg>`.
     *
     * This allows assistive technologies to recognize the element as an image and convey its information.
     *
     * If this prop has no value, sets an `aria-hidden="true"` attribute on the `<svg>` element so that it can be ignored by assistive technologies.
     */
    this.a11yName = i18n('cc-loader.a11y-name');
  }

  render() {
    const a11yName = this.a11yName == null || this.a11yName.length === 0 ? undefined : this.a11yName;
    const aria = a11yName == null ? { hidden: true } : { label: a11yName, role: 'img', labelledby: 'title' };

    // language=HTML
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="20 20 40 40"
        aria-hidden=${ifDefined(aria.hidden)}
        aria-label=${ifDefined(aria.label)}
        aria-labelledby=${ifDefined(aria.labelledby)}
        role=${ifDefined(aria.role)}
      >
        ${a11yName != null ? html`<title id="title">${a11yName}</title>` : ''}
        <circle cx="40px" cy="40px" r="16px"></circle>
      </svg>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: flex;
        }

        svg {
          animation: progress-circular-rotate 1.75s linear infinite;
          height: 100%;
          margin: auto;
          max-height: 2.5em;
          max-width: 2.5em;
          width: 100%;
        }

        circle {
          animation: progress-circular-dash 1.75s ease-in-out infinite;
          fill: transparent;
          stroke: var(--cc-loader-color, var(--cc-color-bg-primary-highlight, blue));
          stroke-linecap: round;
          stroke-width: 5px;
        }

        @keyframes progress-circular-rotate {
          0% {
            transform: rotate(0turn);
          }

          100% {
            transform: rotate(1turn);
          }
        }

        /* radius is set at 16px => perimeter: 100.53096491487 ~= 100 */
        @keyframes progress-circular-dash {
          0% {
            stroke-dasharray: 0, 100px;
            stroke-dashoffset: 0;
          }

          50% {
            stroke-dasharray: 80px, 100px;
            stroke-dashoffset: 0;
          }

          100% {
            stroke-dasharray: 80px, 100px;
            stroke-dashoffset: -100px;
          }
        }
      `,
    ];
  }
}

window.customElements.define('cc-loader', CcLoader);
