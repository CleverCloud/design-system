import '@lit-labs/virtualizer';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { join } from 'lit/directives/join.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconRemixFileCopy_2Line as iconCopy,
  iconRemixCheckboxBlankCircleFill as iconSelected,
} from '../../assets/cc-remix.icons.js';
import { ansiPaletteStyle } from '../../lib/ansi/ansi-palette-style.js';
import { ansiStyles, ansiToLit, stripAnsi } from '../../lib/ansi/ansi.js';
import defaultPalette from '../../lib/ansi/palettes/default.js';
import { copyToClipboard, prepareLinesOfCodeForClipboard } from '../../lib/clipboard.js';
import { hasClass } from '../../lib/dom.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { notifySuccess } from '../../lib/notifications.js';
import { isStringEmpty } from '../../lib/utils.js';
import '../cc-badge/cc-badge.js';
import '../cc-button/cc-button.js';
import '../cc-icon/cc-icon.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';
import { DateDisplayer } from './date-displayer.js';
import { LogsController } from './logs-controller.js';
import { LogsInputController } from './logs-input-controller.js';

/** @type {MetadataRendering} The default metadata renderer */
const DEFAULT_METADATA_RENDERING = {
  hidden: false,
  intent: 'neutral',
  showName: false,
  size: 'auto',
  strong: false,
};

// This style is the default ansi palette plus the ability to be overridden with the css theme.
const DEFAULT_PALETTE_STYLE = ansiPaletteStyle(
  Object.fromEntries(
    Object.entries(defaultPalette).map(([name, color]) => [name, `var(--cc-color-ansi-default-${name}, ${color})`]),
  ),
);

/**
 * A function that can be disabled during an amount of time.
 */
class TemporaryFunctionDisabler {
  /**
   * @param {() => any} callback
   * @param {number} timeout
   */
  constructor(callback, timeout) {
    this._callback = callback;
    this._timeout = timeout;
    this._timestamp = 0;
  }

  disable() {
    this._timestamp = new Date().getTime();
  }

  call() {
    const timeSinceDisabled = new Date().getTime() - this._timestamp;

    if (timeSinceDisabled > this._timeout) {
      return this._callback();
    }
  }
}

/**
 * @typedef {import('./cc-logs.types.js').Log} Log
 * @typedef {import('./cc-logs.types.js').Metadata} Metadata
 * @typedef {import('./cc-logs.types.js').MetadataFilter} MetadataFilter
 * @typedef {import('./cc-logs.types.js').MetadataRenderer} MetadataRenderer
 * @typedef {import('./cc-logs.types.js').MetadataRendering} MetadataRendering
 * @typedef {import('./cc-logs.types.js').LogMessageFilterMode} LogMessageFilterMode
 * @typedef {import('./date-display.types.js').DateDisplay} DateDisplay
 * @typedef {import('../../lib/date/date.types.js').Timezone} Timezone
 * @typedef {import('@lit-labs/virtualizer/events.js').RangeChangedEvent} RangeChangedEvent
 * @typedef {import('@lit-labs/virtualizer/events.js').VisibilityChangedEvent} VisibilityChangedEvent
 * @typedef {import('@lit-labs/virtualizer/LitVirtualizer.js').LitVirtualizer} Virtualizer
 * @typedef {import('lit').PropertyValues<CcLogs>} CcLogsPropertyValues
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 * @typedef {import('lit/directives/ref.js').Ref<Virtualizer>} VirtualizerRef
 */

/**
 * A component displaying lines of log.
 *
 * A line of log is made of:
 *
 * * an id
 * * a date
 * * a message
 * * some metadata
 *
 * ## Details
 *
 * The component gives the ability to:
 *
 * * Display a huge amount of logs by using a <a href="https://github.com/lit/lit/tree/main/packages/labs/virtualizer">scroll virtualizer</a>.
 * * Limit the amount of logs to be displayed.
 * * Filter the logs by metadata.
 * * Wrap the long lines.
 * * Customize the format of the date (by default, it is displayed using <a href="https://www.w3.org/TR/NOTE-datetime">ISO-8601</a> as UTC).
 * * Hide the date.
 * * Customize the way the metadata are displayed.
 * * Follow the logs (force scroll to bottom) while some new logs are added.
 * * Select lines of logs in order to copy them into clipboard.
 * * Navigate using keyboard.
 * * Colorize the log message using ANSI format specification.
 * * Customize the ANSI color palette.
 *
 * ## Follow
 *
 * The follow property gives the ability to force the scroll to bottom while logs are added to the component.
 * This property still allows users to scroll up to stop following logs.
 * The follow behavior is automatically reactivated everytime users scroll to the bottom.
 * The `cc-logs:followChange` event is fired whenever the follow property changes because of a user interaction.
 *
 * ## Selection
 *
 * A gutter on the left allows users to select logs.
 * Selecting logs allows user to copy (using a button or the `Ctrl+C` keystroke).
 * There are two ways to select logs:
 *
 * The first one is by clicking on the select button in the gutter next to a line of log.
 * Users can then use `Ctrl` and `Shift` modifier keys to select multiple lines.
 *
 * Another way is by dragging with the mouse.
 * The drag movement is initiated when the user presses the mouse button inside the gutter.
 * It ends when the user releases the button.
 *
 * ## Keyboard navigation
 *
 * Users can navigate with keyboard through the list of logs:
 *
 * * `ArrowUp` and `ArrowDow` to move the focus from a select button to another.
 * * `Space` or `Enter` to activate the focused select button.
 * * `Escape` to clear the selection.
 * * `Ctrl+C` to copy the selection to clipboard.
 *
 * Note that the default behavior of the `ArrowUp` and `ArrowDown` keys has been overridden (by default these keys scrolls).
 * But users still have the `PageUp` and `PageDown` keys to scroll.
 *
 * ## ANSI support
 *
 * The component supports ANSI format for log messages. It supports:
 *
 * * Effects
 *   * `ESC[0m`: reset
 *   * `ESC[1m`: bold
 *   * `ESC[2m`: dim
 *   * `ESC[3m`: italic
 *   * `ESC[4m`: underline
 *   * `ESC[7m`: inverse
 *   * `ESC[8m`: hidden
 *   * `ESC[9m`: strikethrough
 * * 16 foreground and background Colors
 *   * `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`
 *   * `bright-black`, `bright-red`, `bright-green`, `bright-yellow`, `bright-blue`, `bright-magenta`, `bright-cyan`, `bright-white`
 *
 * ## Limiting
 *
 * Setting a limit is encouraged in order to cap the memory usage.
 * The limit is applied directly on the appended logs.
 * So if you have a limit of 50000, when appending the 50001st log, the first log will be discarded.
 * Note that the limit is applied before the filter.
 *
 * ## Public API
 *
 * ### Scrolling to bottom
 *
 * The component provides a method to scroll down to the bottom:
 * ```javascript
 * document.querySelector('cc-logs').scrollToBottom();
 * ```
 *
 * ### Appending logs
 *
 * The component provides a method to append logs:
 *
 * ```javascript
 * const logs = [log1, log2, log3];
 * document.querySelector('cc-logs').appendLogs(logs);
 * ```
 *
 * ## Accessibility
 *
 * This component is **not compatible with screen readers** because it relies on a virtualizer.
 * This virtualizer allows the component to display a huge amount of logs without slowing or even crashing the browser.
 *
 * Only the visible lines of logs and a few more are actually present within the DOM.
 * The rest of the logs lives in memory and is added dynamically with JavaScript.
 *
 * The component is still usable with screen readers but when it comes to scrolling back to older logs, the experience won't be very good.
 * This is why **developers implementing this component must make sure that logs can be downloaded from the same page**.
 * This is a decent solution to mitigate the issue as it allows users to view their logs with tools they are used to (their IDE for instance).
 *
 * On the contrary, the component is fully compatible with keyboard only navigation. For more information see the `Keyboard navigation` section.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent} cc-logs:followChange - Fires whenever the follow changed because of a user interaction
 *
 * @cssprop {Color} --cc-color-ansi-foreground - The foreground color
 * @cssprop {Color} --cc-color-ansi-background - The background color
 * @cssprop {Color} --cc-color-ansi-background-hover - The background color when mouse is hover a log
 * @cssprop {Color} --cc-color-ansi-background-selected - The background color when log is selected
 * @cssprop {Color} --cc-color-ansi-black - The black color
 * @cssprop {Color} --cc-color-ansi-red - The red color
 * @cssprop {Color} --cc-color-ansi-green - The green color
 * @cssprop {Color} --cc-color-ansi-yellow - The yellow color
 * @cssprop {Color} --cc-color-ansi-blue - The blue color
 * @cssprop {Color} --cc-color-ansi-magenta - The magenta color
 * @cssprop {Color} --cc-color-ansi-cyan - The cyan color
 * @cssprop {Color} --cc-color-ansi-white - The white color
 * @cssprop {Color} --cc-color-ansi-bright-black - The bright black color
 * @cssprop {Color} --cc-color-ansi-bright-red - The bright red color
 * @cssprop {Color} --cc-color-ansi-bright-green - The bright green color
 * @cssprop {Color} --cc-color-ansi-bright-yellow - The bright yellow color
 * @cssprop {Color} --cc-color-ansi-bright-blue - The bright blue color
 * @cssprop {Color} --cc-color-ansi-bright-magenta - The bright magenta color
 * @cssprop {Color} --cc-color-ansi-bright-cyan - The bright cyan color
 * @cssprop {Color} --cc-color-ansi-bright-white - The bright white color
 */
export class CcLogs extends LitElement {
  static get properties() {
    return {
      follow: { type: Boolean },
      limit: { type: Number },
      logs: { type: Array },
      messageFilter: { type: String, attribute: 'message-filter' },
      messageFilterMode: { type: String, attribute: 'message-filter-mode' },
      metadataFilter: { type: Array, attribute: 'metadata-filter' },
      metadataRenderers: { type: Object },
      stripAnsi: { type: Boolean, attribute: 'strip-ansi' },
      dateDisplay: { type: String, attribute: 'date-display' },
      timezone: { type: String },
      wrapLines: { type: Boolean, attribute: 'wrap-lines' },
      _horizontalScrollbarHeight: { type: Number, state: true },
    };
  }

  constructor() {
    super();

    /** @type {boolean} Whereas the component should scroll to the bottom everytime a new log line is added. */
    this.follow = false;

    /** @type {number|null} The maximum number of logs the component can handle in memory. `null` for no limit. */
    this.limit = null;

    /** @type {Array<Log>} The initial logs. */
    this.logs = [];

    /** @type {string|null} The filter to apply onto the logs' message. */
    this.messageFilter = null;

    /** @type {LogMessageFilterMode} The mode used to filter by message. */
    this.messageFilterMode = 'loose';

    /** @type {Array<MetadataFilter>} The filter to apply onto the logs' metadata. */
    this.metadataFilter = [];

    /** @type {{[key: string]: MetadataRenderer}|null} The custom renderers to use for displaying metadata. */
    this.metadataRenderers = null;

    /** @type {boolean} Whereas to strip ANSI from log messages. */
    this.stripAnsi = false;

    /** @type {DateDisplay} The date display. */
    this.dateDisplay = 'datetime-iso';

    /** @type {Timezone} The timezone to use when displaying date. */
    this.timezone = 'UTC';

    /** @type {boolean} Whereas to wrap long lines. */
    this.wrapLines = false;

    /** @type {number|null} The currently dragged log index. */
    this._draggedLogIndex = null;

    /** @type {boolean} Whereas the focused index is in the DOM. */
    this._focusedIndexIsInDom = false;

    // This function synchronizes the follow property according to the actual scroll position.
    // This function can also be disabled during a small amount of time.
    this._followSynchronizer = new TemporaryFunctionDisabler(() => this._synchronizeFollow(), 150);

    /** @type {LogsInputController} */
    this._inputCtrl = new LogsInputController(this);

    /** @type {LogsController} */
    this._logsCtrl = new LogsController(this);

    /** @type {VirtualizerRef} A reference to the logs' container. */
    this._logsRef = createRef();

    /** @type {DateDisplayer} */
    this._dateDisplayer = this._resolveDateDisplayer();

    /** @type {{last: number, first: number}} The range of visible logs in the virtualizer. */
    this._visibleRange = { first: -1, last: -1 };

    /** @type {number} The height in pixel of the horizontal scroll bar. */
    this._horizontalScrollbarHeight = 0;

    // workaround for https://github.com/lit/lit/issues/3619
    this._onMouseDownGutter = this._onMouseDownGutter.bind(this);
    this._onFocusLog = this._onFocusLog.bind(this);
  }

  // region Public methods

  /**
   * Appends some logs.
   *
   * @param {Array<Log>} logs The logs to append
   */
  appendLogs(logs) {
    // We disable the follow modifier to prevent next visibilityChanged events to change the actual follow property.
    this._followSynchronizer.disable();
    this._logsCtrl.append(logs);
  }

  /**
   * Clears the logs
   */
  clear() {
    this._logsCtrl.clear();
  }

  /**
   * Forces scroll to the bottom
   */
  scrollToBottom() {
    this._setFollow(true);
  }

  // endregion

  _resolveDateDisplayer() {
    return new DateDisplayer(this.dateDisplay, this.timezone);
  }

  // region Focus logic

  /**
   * This event handler is called whenever the logs' container receives the focus.
   *
   * If it was not because we lost the focus after the focused log was removed from DOM (this can happen when user scrolls far from the focused log),
   * then we clear the focus.
   */
  _onFocusLogsContainer() {
    if (this._focusedIndexIsInDom) {
      this._logsCtrl.clearFocus(false);
    }
  }

  /**
   * This event handler is called whenever a log select button receives the focus.
   *
   * In cases handled programmatically (when moving focus with arrow keys), the focus is already set.
   * But, this is needed when users click on the select button.
   *
   * @param {FocusEvent & {target: HTMLButtonElement}} e
   */
  _onFocusLog(e) {
    const button = e.target;
    const logIndex = Number(button.closest(`.log`).dataset.index);
    this._logsCtrl.focus(logIndex, false);
  }

  /**
   * This function is wired through `this._logsCtrl`.
   *
   * It is called when the focused log needs to be changed
   *
   * @param {number|null} logIndex the log index to focus or `null` if the focus is to be reset to the logs' container.
   */
  _onFocusedLogChange(logIndex) {
    if (logIndex == null) {
      this._logsRef.value.focus();
    } else {
      // Scroll to the element to focus.
      this._logsRef.value.element(logIndex)?.scrollIntoView({ block: 'nearest' });

      // The element we want to focus may not be in the DOM yet.
      // We may need to wait for the virtualizer to redo its layout before being able to focus the element.
      const tryToFocus = () => {
        const element = this._logsRef.value.querySelector(`.log[data-index="${logIndex}"] .select_button`);
        if (element != null) {
          element.focus();
          return true;
        }
        return false;
      };
      if (!tryToFocus()) {
        this._logsRef.value.layoutComplete.then(tryToFocus);
      }
    }
  }

  /**
   * This function is wired through `this._inputCtrl`.
   *
   * It is called when up or down arrow key is pressed.
   * It asks the logs controller to move the focus on the given direction.
   *
   * @param {'up'|'down'} direction
   */
  _onArrow(direction) {
    this._logsCtrl.moveFocus(direction, this._visibleRange);
  }

  /**
   * This function is wired through `this._inputCtrl`.
   *
   * It is called when `Home` key is pressed
   * It asks the logs controller to move the focus on the first log.
   * If `withCtrlShift` is enabled, it asks the logs controller to expand the selection to the first log.
   *
   * @param {boolean} withCtrlShift
   */
  _onHome(withCtrlShift) {
    if (withCtrlShift) {
      this._logsCtrl.extendSelection(0, 'replace');
    } else {
      this._logsCtrl.focus(0);
    }
  }

  /**
   * This function is wired through `this._inputCtrl`.
   *
   * It is called when `End` key is pressed
   * It asks the logs controller to move the focus on the last log.
   * If `withCtrlShift` is enabled, it asks the logs controller to expand the selection to the last log.
   *
   * @param {boolean} withCtrlShift
   */
  _onEnd(withCtrlShift) {
    if (withCtrlShift) {
      this._logsCtrl.extendSelection(this._logsCtrl.listLength - 1, 'replace');
    } else {
      this._logsCtrl.focus(this._logsCtrl.listLength - 1);
    }
  }

  /**
   * This event handler is called whenever the virtualizer adds child elements to the DOM, or removes child elements from the DOM.
   *
   * It helps in detecting when the focused button is removed from the DOM, which is when user scrolls far from the focused button.
   * When the focused button is removed from the DOM, the focus is lost which is something we want to avoid.
   * Instead, we move to focus on the logs container, and we store the index of the lost button (so that we know where we were when user plays with arrow keys).
   * @param {RangeChangedEvent} e
   */
  _onRangeChanged(e) {
    this._focusedIndexIsInDom = this._logsCtrl.isFocusedIndexInRange({ first: e.first, last: e.last });
    if (!this._focusedIndexIsInDom && this.shadowRoot.activeElement != null) {
      this._logsRef.value.focus();
    }
  }

  // endregion

  // region Drag logic

  /**
   * This function is called whenever users press mouse button on the gutter.
   *
   * It initiates the drag movement.
   *
   * @param {MouseEvent} e
   */
  _onMouseDownGutter(e) {
    // If the mouse down event doesn't come from the button, a text selection can happen.
    // We don't want this!
    const isInButton = e.composedPath().some((element) => hasClass(element, 'select_button'));
    if (!isInButton) {
      e.preventDefault();
    }

    this._inputCtrl.onMouseDownGutter(e);
    this._draggedLogIndex = null;
  }

  /**
   * This function is wired through `this._inputCtrl`.
   *
   * This function is called with a logIndex OR with a direction and offset.
   *
   * If a logIndex is provided, we extend the selection to this index.
   *
   * If a direction and offset is provided, we calculate the right new index and extend the selection to it.
   * We also make sure that this index is visible in the viewport by scrolling the right amount in the right direction.
   *
   * @param {Object} movement The drag movement.
   * @param {number} [movement.logIndex] The index to drag to. If present, `direction` and `offset` are useless.
   * @param {'up'|'down'} [movement.direction] The direction of the drag movement.
   * @param {number} [movement.offset] The number of logs to drag.
   * @param {boolean} isFirstDrag Whereas this is the drag movement initiator.
   */
  _onDrag({ logIndex, direction, offset }, isFirstDrag) {
    // On first drag, we should clear the text selection because we're about to trigger a log selection
    if (isFirstDrag) {
      document.getSelection().empty();
    }

    const newIndex = logIndex != null ? logIndex : this._getNewDraggedLogIndex(direction, offset ?? 1);

    if (newIndex === this._draggedLogIndex) {
      return;
    }

    if (isFirstDrag) {
      this._logsCtrl.select(newIndex);
    } else {
      this._logsCtrl.extendSelection(newIndex, 'replace');
    }

    if (direction === 'up' || direction === 'down') {
      this._logsRef.value.element(newIndex)?.scrollIntoView({ block: 'nearest' });
    }

    this._draggedLogIndex = newIndex;
  }

  /**
   * Calculates the new drag index according to the given direction and given offset.
   *
   * @param {'up'|'down'} direction The drag direction.
   * @param {number} offset The amount of log to drag.
   * @return {number}
   */
  _getNewDraggedLogIndex(direction, offset) {
    if (direction === 'up') {
      return Math.max(0, this._draggedLogIndex - offset);
    }
    if (direction === 'down') {
      return Math.min(this._draggedLogIndex + offset, this._logsCtrl.listLength - 1);
    }
    throw new Error(`Illegal argument. direction ${direction} is not valid`);
  }

  // endregion

  // region Select logic

  /**
   * This function is wired through `this._inputCtrl`.
   *
   * Handles the logic selection with support of Ctrl and Shift modifiers key
   * @param {number} logIndex
   * @param {Object} modifiers
   * @param {boolean} modifiers.ctrl
   * @param {boolean} modifiers.shift
   */
  _onClickLog(logIndex, { ctrl, shift }) {
    if (ctrl && !shift) {
      this._logsCtrl.toggleSelection(logIndex);
    } else if (shift) {
      this._logsCtrl.extendSelection(logIndex, ctrl ? 'append' : 'replace');
    } else {
      if (!this._logsCtrl.isSelected(logIndex) || this._logsCtrl.selectionLength > 1) {
        this._logsCtrl.select(logIndex);
      } else {
        this._logsCtrl.clearSelection();
      }
    }

    // Clear regular text selection if logs selection is active
    if (!this._logsCtrl.isSelectionEmpty()) {
      document.getSelection().empty();
    }
  }

  /**
   * This function is wired through `this._inputCtrl`.
   *
   * It clears the selection when users type the Escape key.
   */
  _onEscape() {
    this._logsCtrl.clearSelection();
  }

  /**
   * This function is wired through `this._inputCtrl`.
   *
   * It clears the selection when users click on the logs container but not in the gutter area.
   * It also handles triple click: selects the whole log line (including timestamp and metadata)
   *
   * @param {MouseEvent & {target : HTMLElement}} e
   */
  _onClick(e) {
    if (e.detail === 3) {
      const logElement = e.target.closest(`.log`);
      if (logElement != null) {
        window.getSelection().empty();
        const range = document.createRange();
        range.selectNode(logElement);
        window.getSelection().addRange(range);
      }
    } else {
      this._logsCtrl.clearSelection();
    }
  }

  /**
   * This function is called by `this._logsCtrl` whenever the selection has changed.
   *
   * It forces follow to stop.
   */
  _onSelectionChanged() {
    this._followSynchronizer.disable();
    this._setFollow(false);
  }

  _onSelectAll() {
    this._logsCtrl.selectAll();
  }

  // endregion

  // region Copy logic

  /**
   * This event handler captures the Ctrl+C native shortcut for copy to clipboard.
   * It takes the browser text selection as input.
   * Both plain text and html version of this text selection are put in the clipboard.
   *
   * @param {ClipboardEvent} e
   */
  _onCopy(e) {
    const lines = document
      .getSelection()
      .toString()
      .split(/[\r\n]+/gm);
    const data = prepareLinesOfCodeForClipboard(lines);
    e.clipboardData.setData('text/plain', data.text);
    e.clipboardData.setData('text/html', data.html);
    e.preventDefault();
  }

  /**
   * This event handler is called when the copy button is clicked.
   * It takes the logic selection (done with the gutter) as input.
   * Both plain text and html version of this text selection are put in the clipboard.
   */
  _onCopySelectionToClipboard() {
    if (this._logsCtrl.isSelectionEmpty()) {
      return;
    }

    const lines = this._logsCtrl.getSelectedLogs().map((log) => {
      const ts = this._dateDisplayer.format(log.date);
      const meta =
        log.metadata
          ?.map((metadata) => ({ metadata, metadataRendering: this._getMetadataRendering(metadata) }))
          .filter(({ metadataRendering }) => !metadataRendering.hidden)
          .map(({ metadata, metadataRendering }) => this._getMetadataText(metadata, metadataRendering)) ?? [];
      const msg = stripAnsi(log.message);
      return [ts, ...meta, msg].filter((t) => t?.length > 0).join(' ');
    });

    const data = prepareLinesOfCodeForClipboard(lines);

    copyToClipboard(data.text, data.html).then(() => {
      notifySuccess(i18n('cc-logs.copied', { count: lines.length }));
    });
  }

  // endregion

  // region Follow logic

  /**
   * When logs are appended very fast, the visibilityChanged event is fired very often.
   * We need to listen to the wheel event to force unfollowing.
   *
   * @param {WheelEvent} e
   */
  _onWheel(e) {
    if (e.deltaY < 0) {
      // When wheel up is detected, this means that the user wants to unfollow.
      // We disable the follow modifier to prevent next visibilityChanged events to go against the user decision.
      this._followSynchronizer.disable();
      this._setFollow(false);
    }
  }

  /**
   * This event handler is called whenever the visible items in the logs container viewport change.
   *
   * It synchronizes the `follow` property according to the scroll position.
   * It also keeps track of the first and last visible elements needed for keyboard navigation.
   *
   * @param {VisibilityChangedEvent} e
   */
  _onVisibilityChanged(e) {
    this._visibleRange = { first: e.first, last: e.last };
    this._followSynchronizer.call();
  }

  /**
   * Synchronizes the `follow` property according to the actual scroll position.
   *
   * If the scroll position shows the last line of log, the follow is activated.
   * Otherwise, the follow is deactivated.
   * An event is dispatched when the follow state changes.
   */
  _synchronizeFollow() {
    this._setFollow(this._visibleRange.last === Math.max(0, this._logsCtrl.listLength - 1));
  }

  /**
   * @param {boolean} follow
   */
  _setFollow(follow) {
    const oldFollow = this.follow;
    this.follow = follow;
    if (oldFollow !== this.follow) {
      dispatchCustomEvent(this, 'followChange', this.follow);
    }
  }

  // endregion

  // region Metadata logic

  /**
   * @param {Metadata} metadata
   * @return {MetadataRendering}
   */
  _getMetadataRendering(metadata) {
    const renderer = this.metadataRenderers?.[metadata.name];

    if (renderer == null) {
      return DEFAULT_METADATA_RENDERING;
    }

    const metadataRendering = typeof renderer === 'function' ? renderer(metadata) : renderer;

    /** @type {MetadataRendering} */
    return {
      ...DEFAULT_METADATA_RENDERING,
      ...metadataRendering,
    };
  }

  /**
   * @param {Metadata} metadata
   * @param {MetadataRendering} metadataRendering
   * @return {string}
   */
  _getMetadataText(metadata, metadataRendering) {
    return metadataRendering.text != null
      ? metadataRendering.text
      : `${metadataRendering.showName ? `${metadata.name}: ` : ''}${metadata.value}`;
  }

  // endregion

  /**
   * @param {CcLogsPropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('dateDisplay') || changedProperties.has('timezone')) {
      this._dateDisplayer = this._resolveDateDisplayer();
    }

    if (changedProperties.has('logs')) {
      this.clear();
      this.appendLogs(this.logs);
    }

    if (changedProperties.has('limit')) {
      this._logsCtrl.limit = this.limit;
    }

    if (
      changedProperties.has('messageFilter') ||
      changedProperties.has('messageFilterMode') ||
      changedProperties.has('metadataFilter')
    ) {
      this._logsCtrl.filter = {
        message: isStringEmpty(this.messageFilter) ? null : { value: this.messageFilter, type: this.messageFilterMode },
        metadata: this.metadataFilter,
      };
    }
  }

  /**
   * @param {CcLogsPropertyValues} _changedProperties
   */
  updated(_changedProperties) {
    this._horizontalScrollbarHeight = this.wrapLines
      ? 0
      : this._logsRef.value.offsetHeight - this._logsRef.value.clientHeight;
  }

  render() {
    const layout =
      this.follow && this._logsCtrl.listLength > 0
        ? {
            pin: {
              index: this._logsCtrl.listLength - 1,
              block: 'start',
            },
          }
        : null;

    /**
     * @param {Log} it
     * @return {string}
     */
    function keyFunction(it) {
      return it.id;
    }

    /**
     * @param {Log} item
     * @param {number} index
     * @return {TemplateResult}
     */
    const renderItem = (item, index) => {
      return this._renderLog(item, index);
    };

    return html`
      <div class="wrapper" style="--last-log-margin: ${this._horizontalScrollbarHeight}px">
        <lit-virtualizer
          ${ref(this._logsRef)}
          class="logs_container"
          tabindex="0"
          .items=${this._logsCtrl.getList().slice()}
          ?scroller=${true}
          .keyFunction=${keyFunction}
          .renderItem=${renderItem}
          .layout=${layout}
          @click=${this._inputCtrl.onClick}
          @keydown=${this._inputCtrl.onKeyDown}
          @keyup=${this._inputCtrl.onKeyUp}
          @copy=${this._onCopy}
          @focus=${this._onFocusLogsContainer}
          @visibilityChanged=${this._onVisibilityChanged}
          @rangeChanged=${this._onRangeChanged}
          @wheel=${this._onWheel}
        ></lit-virtualizer>
        ${!this._logsCtrl.isSelectionEmpty()
          ? html` <cc-button class="copy_button" .icon=${iconCopy} @cc-button:click=${this._onCopySelectionToClipboard}>
              ${i18n('cc-logs.copy')}
            </cc-button>`
          : null}
      </div>
    `;
  }

  /**
   * Renders a single line of log.
   *
   * @param {Log} log
   * @param {number} index
   */
  _renderLog(log, index) {
    const wrap = this.wrapLines;
    const dateDisplayer = this._dateDisplayer;

    const selected = this._logsCtrl.isSelected(index);
    const selectButtonLabel = selected
      ? i18n('cc-logs.unselect-button.label', { index: index + 1 })
      : i18n('cc-logs.select-button.label', { index: index + 1 });

    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`
      <p class="log ${classMap({ selected })}" data-index="${index}">
        <span class="gutter" @mousedown=${this._onMouseDownGutter} @click=${this._inputCtrl.onClickLog}>
          <button
            class="select_button"
            title="${selectButtonLabel}"
            aria-label="${selectButtonLabel}"
            aria-pressed=${selected}
            tabindex="-1"
            @click=${this._inputCtrl.onClickLog}
            @focus=${this._onFocusLog}
          >
            <cc-icon .icon=${iconSelected} size="xs"></cc-icon>
          </button>
        </span>
        ${this._renderLogTimestamp(log, dateDisplayer)}
        <span class="log--right ${classMap({ wrap })}"
          >${this._renderLogMetadata(log)}${this._renderLogMessage(log)}</span
        >
      </p>
    `;
  }

  /**
   * @param {Log} log
   * @param {DateDisplayer} dateDisplayer
   */
  _renderLogTimestamp(log, dateDisplayer) {
    if (dateDisplayer.display === 'none') {
      return null;
    }

    return html`<span class="date">
      ${dateDisplayer.formatAndMapParts(log.date, (k, v) => html`<span class="${k}">${v}</span>`)}
    </span>`;
  }

  /**
   * @param {Log} log
   */
  _renderLogMetadata(log) {
    if (log.metadata == null || log.metadata.length === 0) {
      return null;
    }

    const metadata = log.metadata.map((metadata) => this._renderMetadata(metadata)).filter((t) => t != null);

    if (metadata.length === 0) {
      return null;
    }

    // keep this on one line to make sure we do not break the white-space css rule
    return html`<span class="metadata--wrapper">${join(metadata, html`&nbsp;`)}</span>`;
  }

  /**
   * @param {Metadata} metadata
   */
  _renderMetadata(metadata) {
    const metadataRendering = this._getMetadataRendering(metadata);
    if (metadataRendering.hidden) {
      return null;
    }

    const text = this._getMetadataText(metadata, metadataRendering);
    const size = metadataRendering.size ?? 0;
    const classInfo = {
      metadata: true,
      strong: metadataRendering.strong,
      [metadataRendering.intent]: true,
    };

    // Keep this in one line to avoid any extra whitespace.
    return html`<span class="${classMap(classInfo)}" style="min-width: ${size}ch;">${text}</span>`;
  }

  /**
   * @param {Log} log
   */
  _renderLogMessage(log) {
    // keep this on one line to make sure we do not break the white-space css rule
    return html`<span class="message">${this.stripAnsi ? stripAnsi(log.message) : ansiToLit(log.message)}</span>`;
  }

  static get styles() {
    return [
      ...ansiStyles,
      unsafeCSS(`:host {${DEFAULT_PALETTE_STYLE}}`),
      // language=CSS
      css`
        :host {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          display: block;
          overflow: hidden;

          --font-size: 0.875em;
        }

        :focus {
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: var(--cc-focus-outline-offset, 2px);
        }

        .wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }

        .logs_container {
          flex: 1;
          font-family: var(--cc-ff-monospace, monospace);
          font-size: var(--font-size);
        }

        .log {
          align-items: center;
          display: flex;
          gap: 0.5em;
          margin: 0;
          width: 100%;

          /* We don't need em here. At least with px we avoid strange blinking effect. */
          --spacing: 2px;
          --gutter-size: 1.5em;
        }

        .log:hover {
          background-color: var(--cc-color-ansi-background-hover);
        }

        .log.selected {
          background-color: var(--cc-color-ansi-background-selected);
        }

        .log:last-of-type {
          margin-bottom: var(--last-log-margin);
        }

        .date,
        .log--right {
          line-height: var(--gutter-size);
          padding: var(--spacing) 0;
        }

        .log--right {
          white-space: pre;
        }

        .log--right.wrap {
          white-space: pre-wrap;
        }

        .gutter {
          align-self: stretch;
          border-right: 1px solid var(--cc-color-ansi-foreground);
          cursor: pointer;
          flex: 0 0 auto;
        }

        .select_button {
          align-items: center;
          background: none;
          border: 0;
          color: var(--cc-color-ansi-foreground);
          cursor: pointer;
          display: flex;
          height: var(--gutter-size);
          justify-content: center;
          margin: var(--spacing);
          outline-offset: 0;
          padding: 0;
          width: var(--gutter-size);
        }

        .select_button cc-icon {
          color: #737373;
          opacity: 0;
        }

        .log:hover cc-icon,
        .select_button:focus cc-icon {
          opacity: 1;
        }

        .select_button[aria-pressed='true'] cc-icon {
          color: var(--cc-color-text-primary, #000);
          opacity: 1;
        }

        .copy_button {
          position: absolute;
          right: 1em;
          top: 0.5em;
        }

        .metadata {
          display: inline-block;
        }

        .metadata--wrapper {
          margin-right: var(--font-size);
        }

        .strong {
          font-weight: bold;
        }

        .neutral {
          color: var(--cc-color-ansi-foreground);
        }

        .info {
          color: var(--cc-color-ansi-blue);
        }

        .success {
          color: var(--cc-color-ansi-green);
        }

        .warning {
          color: var(--cc-color-ansi-yellow);
        }

        .danger {
          color: var(--cc-color-ansi-red);
        }

        .date {
          align-self: start;
          white-space: nowrap;
        }

        .milliseconds,
        .separator,
        .timezone {
          opacity: 0.7;
        }
      `,
    ];
  }
}

window.customElements.define('cc-logs-beta', CcLogs);
