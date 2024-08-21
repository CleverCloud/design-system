import { i18n } from '../../lib/i18n/i18n.js';

const trackedElements = [];
let updateIntervalId;

function updateTrackedElements() {
  trackedElements.forEach(($element) => $element._triggerUpdate());
}

/**
 * A text-only component to display a localized humanized relative date (ex: "two minutes ago").
 *
 * ## Details
 *
 * * This component relies on the i18n system of this component library to format the relative date.
 * * Once the element is attached to the DOM, the displayed text is updated every 10 seconds.
 * * The 10 second update loop is the same for all instances of this component.
 * * A tooltip is available (with `title=""`) with the full formatted date and time.
 *
 * ## Technical details
 *
 * * This is mainly inspired by GitHub's [relative-time-element](https://github.com/github/time-elements/blob/master/src/relative-time-element.js).
 * * This component does not use lit* deps on purpose (keep small and not useful).
 *
 * @cssdisplay not defined, should default to `inline` in most browsers
 */
export class CcDatetimeRelative extends HTMLElement {
  static get observedAttributes() {
    return ['datetime'];
  }

  constructor() {
    super();

    /** @type {string|number|null} datetime - Date as ISO string or timestamp. */
    this.datetime = null;
  }

  get datetime() {
    return this.getAttribute('datetime');
  }

  /** @required */
  set datetime(value) {
    if (value != null) {
      this.setAttribute('datetime', value);
    }
  }

  attributeChangedCallback(attrName, old, date) {
    if (attrName === 'datetime') {
      this.title = i18n('cc-datetime-relative.title', { date });
      this._triggerUpdate();
    }
  }

  connectedCallback() {
    trackedElements.push(this);
    if (updateIntervalId == null) {
      updateTrackedElements();
      // 10 seconds
      updateIntervalId = setInterval(updateTrackedElements, 10 * 1000);
    }
  }

  disconnectedCallback() {
    const idx = trackedElements.indexOf(this);
    if (idx !== -1) {
      trackedElements.splice(idx, 1);
    }
    if (trackedElements.length > 0 && updateIntervalId != null) {
      clearInterval(updateIntervalId);
      updateIntervalId = null;
    }
  }

  _triggerUpdate() {
    const date = this.getAttribute('datetime');
    const newContent = i18n('cc-datetime-relative.distance', { date });
    if (this.textContent !== newContent) {
      this.textContent = newContent;
    }
  }
}

window.customElements.define('cc-datetime-relative', CcDatetimeRelative);
