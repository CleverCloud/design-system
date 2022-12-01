import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { skeletonStyles } from '../../styles/skeleton.js';

/**
 * @typedef {import('./cc-badge.types.js').BadgeIntent} BadgeIntent
 * @typedef {import('./cc-badge.types.js').BadgeWeight} BadgeWeight
 */

/**
 * A component to highlight a small chunk of text.
 *
 * @cssdisplay inline-block
 *
 * @cssprop {JustifyContent} --cc-badge-justify-content - Specify how the content should be distributed / positioned horizontally within the grid (Default: `center`. Possible values: https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items).
 */
export class CcBadge extends LitElement {
  static get properties () {
    return {
      circle: { type: Boolean },
      iconAlt: { type: String, attribute: 'icon-alt' },
      iconSrc: { type: String, attribute: 'icon-src' },
      intent: { type: String },
      skeleton: { type: Boolean },
      weight: { type: String },
    };
  }

  constructor () {
    super();

    /** @type {boolean} Sets the badge to a bubble style. Should only be used to display 1 or 2 digits figures. */
    this.circle = false;

    /** @type {string|null} Sets the `alt` attribute value on the `<img>` tag. Only use if the image conveys additional info compared to surrounding text. */
    this.iconAlt = null;

    /** @type {string|null} Sets the icon displayed on the left of the text inside the badge. */
    this.iconSrc = null;

    /** @type {BadgeIntent} Sets the accent color used for the badge. */
    this.intent = 'neutral';

    /** @type {boolean} Whether the component should be displayed as skeleton. */
    this.skeleton = false;

    /** @type {BadgeWeight} Sets the style of the badge depending on how much one wants it to stand out. */
    this.weight = 'dimmed';
  }

  render () {
    const modes = {
      dimmed: this.weight == null || this.weight === 'dimmed',
      strong: this.weight === 'strong',
      outlined: this.weight === 'outlined',
      neutral: this.intent == null || this.intent === 'neutral',
      info: this.intent === 'info',
      success: this.intent === 'success',
      warning: this.intent === 'warning',
      danger: this.intent === 'danger',
      skeleton: this.skeleton,
      circle: this.circle,
    };

    return html`
      <span class="cc-badge ${classMap(modes)}">
        ${this.iconSrc != null ? html`
          <img src=${this.iconSrc} alt=${this.iconAlt ?? ''}>
        ` : ''}
        <span>
          <slot></slot>
        </span>
      </span>
    `;
  }

  static get styles () {
    return [
      skeletonStyles,
      // language=CSS
      css`
        :host {
          display: inline-block;
        }

        .cc-badge {
          display: flex;
          align-items: center;
          justify-content: var(--cc-badge-justify-content, center);
          padding: 0.2em 0.8em;
          border-radius: 1em;
          font-size: 0.8em;
          gap: 0.3em;
        }

        /* skeleton is more important */

        .skeleton {
          background-color: #bbb !important;
          color: transparent !important;
        }

        .skeleton.outlined {
          border: 0.06em solid #777 !important;
        }

        .skeleton img {
          visibility: hidden !important;
        }

        .circle {
          width: 1.5em;
          height: 1.5em;
          min-height: unset;
          justify-content: center;
          padding: 0;
          border-radius: 50%;
          font-size: 1em;
        }

        .dimmed {
          border: 0.06em solid var(--accent-color, #ccc);
          background-color: var(--accent-color, #ccc);
        }

        .strong {
          border: 0.06em solid var(--accent-color, #777);
          background-color: var(--accent-color, #777);
          color: var(--cc-color-text-inverted, #fff);
        }

        .outlined {
          /* roughly 1px. We want the border to scale with the font size so that outlined
          badges still stand out as they should when font-size is increased. */
          border: 0.06em solid var(--accent-color, #777);
          background-color: transparent;
          color: var(--accent-color, #777);
        }

        .info {
          --accent-color: var(--cc-color-bg-primary);
        }

        .info.dimmed {
          --accent-color: var(--cc-color-bg-primary-weak);
        }

        .success {
          --accent-color: var(--cc-color-bg-success);
        }

        .success.dimmed {
          --accent-color: var(--cc-color-bg-success-weak);
        }

        .danger {
          --accent-color: var(--cc-color-bg-danger);
        }

        .danger.dimmed {
          --accent-color: var(--cc-color-bg-danger-weak);
        }

        .warning {
          --accent-color: var(--cc-color-bg-warning);
        }

        .warning.dimmed {
          --accent-color: var(--cc-color-bg-warning-weak);
        }

        .neutral {
          --accent-color: var(--cc-color-bg-strong);
        }

        .neutral.dimmed {
          --accent-color: var(--cc-color-bg-neutral-alt);
        }

        img {
          width: 1em;
          height: 1em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-badge', CcBadge);
