import { animate, AnimateController } from '@lit-labs/motion';
import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  iconRemixCloseLine as iconClose,
  iconRemixSpam_2Line as iconDanger,
  iconRemixInformationLine as iconInfo,
  iconRemixCheckboxCircleLine as iconSuccess,
  iconRemixAlertLine as iconWarning,
} from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../translations/translation.js';
import '../cc-icon/cc-icon.js';

/**
 * @typedef {import('../common.types.js').NotificationIntent} NotificationIntent
 */

/**
 * A component dedicated to display a short message and dismiss it after a short period of time.
 *
 * ## Details
 *
 * This component is not to be used directly but should be used through the `cc-toaster` component.
 *
 * * The component displays a message. Optionally, this message can be topped by a heading.
 * * The component dispatches a `cc-toast:dismiss` event after a certain amount of time. The timer starts when the component is attached to the DOM.
 * * Optionally, it can be closed manually with a close button. Clicking on the close button dispatches a `cc-toast:dismiss` event.
 * * Optionally, it can display a progress bar showing to the user that the message will be dismissed in a short amount of time.
 * * When user moves the mouse over the component, the timer is paused. It will be resumed as soon as the user moves the pointer out.
 * * As soon as a timeout is set, the toast becomes focusable. Gaining the focus will pause the timer. Losing the focus will resume the timer.
 *
 * The `message` property can be a simple string. You can also pass a DOM `Node`, but be careful not to introduce DOM-based injection vulnerability.
 *
 * ## Technical details
 *
 * The timer is implemented using [AnimateController from \@lit-labs/motion](https://github.com/lit/lit/tree/main/packages/labs/motion).
 * This Lit reactive controller is not only used to animate the progress bar, but also to control the pause/resume of the timer.
 * This means that, even if the progress bar is not displayed (`showProgress = false`), the controller is still used to handle the timeout.
 * As a consequence, even when the progress bar should not be displayed, the DOM node to animate is still there, and we just make sure it is invisible to the user.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent} cc-toast:dismiss - Fires whenever the toast is dismissed.
 * @cssprop {Color} --cc-toast-icon-color - The color of the icon on the left of the toast (defaults: `e7e7e7`).
 */
export class CcToast extends LitElement {
  static get properties() {
    return {
      closeable: { type: Boolean },
      heading: { type: String },
      intent: { type: String, reflect: true },
      message: { type: String },
      showProgress: { type: Boolean, attribute: 'show-progress' },
      timeout: { type: Number },
    };
  }

  constructor() {
    super();

    /** @type {boolean} Whether a close button is displayed. */
    this.closeable = false;

    /** @type {string|null} The heading to display. */
    this.heading = null;

    /** @type {NotificationIntent} The intent of the toast. This property drives the color and the icon of the toast. */
    this.intent = 'info';

    /** @type {string|Node|null} The message to display. */
    this.message = null;

    /** @type {boolean} Whether to show the progress bar. */
    this.showProgress = false;

    /** @type {number} The amount of time (in millis) before the `cc-toast:dismiss` event is fired. The timer starts as soon as the component is attached to the DOM. */
    this.timeout = 5000;

    this._progressAnimateCtrl = new AnimateController(this, {
      defaultOptions: {
        keyframeOptions: {
          easing: 'linear',
        },
        in: [{ width: '100%' }],
      },
      onComplete: () => this._dismiss(),
    });
  }

  /* region PRIVATE METHODS*/
  _dismiss() {
    dispatchCustomEvent(this, 'dismiss');
  }

  _getIcon() {
    if (this.intent === 'info') {
      return iconInfo;
    }
    if (this.intent === 'success') {
      return iconSuccess;
    }
    if (this.intent === 'warning') {
      return iconWarning;
    }
    if (this.intent === 'danger') {
      return iconDanger;
    }
  }

  _getIconAlt() {
    if (this.intent === 'info') {
      return i18n('cc-toast.icon-alt.info');
    }
    if (this.intent === 'success') {
      return i18n('cc-toast.icon-alt.success');
    }
    if (this.intent === 'warning') {
      return i18n('cc-toast.icon-alt.warning');
    }
    if (this.intent === 'danger') {
      return i18n('cc-toast.icon-alt.danger');
    }
  }

  _onCloseButtonClick() {
    this._dismiss();
  }

  _pause() {
    this._progressAnimateCtrl.isAnimating && this._progressAnimateCtrl.pause();
  }

  _resume() {
    this._progressAnimateCtrl.isAnimating && this._progressAnimateCtrl.play();
  }
  /* endregion*/

  render() {
    const tabIndex = this.timeout > 0 ? '0' : undefined;

    return html`
      <div
        class="toast"
        @mouseenter=${this._pause}
        @mouseleave=${this._resume}
        @focus=${this._pause}
        @blur=${this._resume}
        tabindex="${ifDefined(tabIndex)}"
      >
        <div class="icon-wrapper">
          <cc-icon class="icon" .icon="${this._getIcon()}" a11y-name="${this._getIconAlt()}"></cc-icon>
        </div>
        <div class="right">
          <div class="content">
            ${this.heading ? html`<div class="heading">${this.heading}</div>` : ''}
            ${this.message ? html`<div>${this.message}</div>` : ''}
          </div>

          ${this.closeable
            ? html`
                <button
                  class="close-button"
                  @click=${this._onCloseButtonClick}
                  @focus=${this._pause}
                  @blur=${this._resume}
                  title="${i18n('cc-toast.close')}"
                >
                  <cc-icon .icon="${iconClose}" a11y-name="${i18n('cc-toast.close')}"></cc-icon>
                </button>
              `
            : ''}
          ${this.timeout > 0
            ? html`
                <div class="progress-bar ${classMap({ invisible: !this.showProgress })}">
                  <div class="progress-bar-track" ${animate({ keyframeOptions: { duration: this.timeout } })}></div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          --padding: 0.8em;

          display: block;
        }

        /* region COMMON */

        .toast {
          align-items: stretch;
          background-color: var(--toast-color);
          border: 1px solid var(--toast-color);
          border-radius: 0.3em;
          box-shadow:
            0 2px 4px rgb(38 38 38 / 25%),
            0 5px 15px rgb(38 38 38 / 25%);
          display: flex;
          overflow: hidden;
          pointer-events: all;
        }
        /* endregion */

        /* region COLOR */

        :host([intent='info']) {
          --toast-color: var(--cc-color-bg-primary);
        }

        :host([intent='success']) {
          --toast-color: var(--cc-color-bg-success);
        }

        :host([intent='warning']) {
          --toast-color: var(--cc-color-bg-warning);
        }

        :host([intent='danger']) {
          --toast-color: var(--cc-color-bg-danger);
        }
        /* endregion */

        /* region ICON */

        .icon-wrapper {
          align-items: center;
          background-color: var(--toast-color);
          border-right: 1px solid var(--toast-color);
          display: flex;
          padding: var(--padding);
        }

        .icon {
          --cc-icon-color: var(--cc-toast-icon-color, #e7e7e7);
          --cc-icon-size: 1.8em;
        }
        /* endregion */

        .right {
          background-color: var(--cc-color-bg-default);
          display: flex;
          flex: 1 1 auto;
          justify-content: stretch;
          position: relative;
        }

        /* region CONTENT */

        .content {
          align-self: center;
          color: var(--toast-color);
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          gap: 0.5em;
          justify-content: center;
          padding: var(--padding);
        }

        .heading {
          font-weight: bold;
        }

        /* endregion */

        /* region CLOSE_BUTTON */

        .close-button {
          --cc-icon-color: var(--cc-color-text-weak);
          --cc-icon-size: 1.5em;

          align-self: start;
          background-color: transparent;
          border: none;
          border-radius: var(--cc-border-radius-small, 0.15em);
          cursor: pointer;
          height: auto;
          margin: 0.25em;
          padding: 0.2em;
          width: auto;
        }

        .close-button img {
          display: block;
          height: 1em;
          width: 1em;
        }

        .close-button:hover {
          background-color: var(--cc-color-bg-neutral-hovered);
        }

        .close-button:enabled:focus {
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }
        /* endregion */

        /* region PROGRESS */

        .progress-bar {
          bottom: 0;
          height: 0.3em;
          position: absolute;
          width: 100%;
        }

        .progress-bar-track {
          background-color: var(--toast-color);
          height: 100%;
          width: 0;
        }

        .progress-bar.invisible {
          height: 0;
        }
        /* endregion */
      `,
    ];
  }
}

window.customElements.define('cc-toast', CcToast);
