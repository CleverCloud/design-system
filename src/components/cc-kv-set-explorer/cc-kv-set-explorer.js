import '@lit-labs/virtualizer';
import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconRemixAddLine as iconAdd,
  iconRemixDeleteBin_5Fill as iconBin,
  iconRemixClipboardLine as iconCopy,
  iconRemixSearchLine as iconFilter,
} from '../../assets/cc-remix.icons.js';
import { LostFocusController } from '../../controllers/lost-focus-controller.js';
import { copyToClipboard } from '../../lib/clipboard.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { fakeString } from '../../lib/fake-strings.js';
import { focusBySelector } from '../../lib/focus-helper.js';
import { formSubmit } from '../../lib/form/form-submit-directive.js';
import { random } from '../../lib/utils.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-button/cc-button.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-notice/cc-notice.js';

/** @type {Array<{state: CcKvSetElementState, skeleton: boolean}>} */
const SKELETON_ELEMENTS = Array(5)
  .fill(0)
  .map(() => ({ state: { type: 'idle', value: fakeString(random(10, 20)) }, skeleton: true }));

/** @type {number} */
const LOAD_MORE_THRESHOLD = 5;

/**
 * @typedef {import('./cc-kv-set-explorer.types.js').CcKvSetExplorerState} CcKvSetExplorerState
 * @typedef {import('./cc-kv-set-explorer.types.js').CcKvSetElementState} CcKvSetElementState
 * @typedef {import('../../lib/events.types.js').EventWithTarget} EventWithTarget
 * @typedef {import('../../lib/form/form.types.js').FormDataMap} FormDataMap
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 * @typedef {import('lit/directives/ref.js').Ref<HTMLFormElement>} HTMLFormElementRef
 * @typedef {import('lit/directives/ref.js').Ref<Virtualizer>} VirtualizerRef
 * @typedef {import('@lit-labs/virtualizer/events.js').VisibilityChangedEvent} VisibilityChangedEvent
 * @typedef {import('@lit-labs/virtualizer/LitVirtualizer.js').LitVirtualizer} Virtualizer
 */

/**
 * A component displaying an explorer for a kv `set` data type.
 *
 * It offers the ability to:
 *
 * * show elements
 * * dynamically ask for more elements when scrolling to the bottom of the elements panel
 * * ask for elements filtering
 * * ask for any element deletion
 * * ask for any element addition
 * * copy any element value to the clipboard
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<string>} cc-kv-set-explorer:add-element - Fires whenever the add form is submitted
 * @fires {CustomEvent<string>} cc-kv-set-explorer:delete-element - Fires whenever a delete button is clicked
 * @fires {CustomEvent<string>} cc-kv-set-explorer:filter-change - Fires whenever the filter changes
 * @fires {CustomEvent} cc-kv-set-explorer:load-more-elements - Fires whenever the almost last element becomes visible (after user scroll)
 */
export class CcKvSetExplorer extends LitElement {
  static get properties() {
    return {
      disabled: { type: Boolean },
      state: { type: Object },
    };
  }

  constructor() {
    super();

    /** @type {boolean} - Whether all actions should be disabled */
    this.disabled = false;

    /** @type {CcKvSetExplorerState} - The state of the component */
    this.state = { type: 'loading' };

    /** @type {HTMLFormElementRef} */
    this._addFormRef = createRef();

    /** @type {VirtualizerRef} */
    this._elementsRef = createRef();

    new LostFocusController(
      this,
      '.element',
      ({ suggestedElement }) => {
        focusBySelector(suggestedElement, '.delete-button');
      },
      async () => await this._elementsRef.value?.layoutComplete,
    );

    // this is for lit-virtualizer
    this._elementRender = {
      /** @param {{state: CcKvSetElementState, skeleton: boolean}} e */
      key: (e) => e.state.value,
      /**
       * @param {{state: CcKvSetElementState, skeleton: boolean}} e
       * @param {number} index
       */
      item: (e, index) => this._renderElement(e.state, e.skeleton, index),
    };
    this._onDeleteElement = this._onDeleteElement.bind(this);
    // this is for form submission
    this._onAddFormSubmit = this._onAddFormSubmit.bind(this);
    this._onFilterFormSubmit = this._onFilterFormSubmit.bind(this);
  }

  /**
   * Resets the add form.
   *
   * @param {boolean} [focus] Whether to focus the value input.
   */
  resetAddForm(focus = true) {
    this._addFormRef.value.reset();
    if (focus) {
      this._addFormRef.value.element.focus();
    }
  }

  /**
   * @return {Array<{state: CcKvSetElementState, skeleton: boolean}>}
   */
  _getElements() {
    switch (this.state.type) {
      case 'loading':
      case 'filtering':
        return SKELETON_ELEMENTS;
      case 'loaded':
        return this.state.elements.map((state) => ({ state, skeleton: false }));
      case 'loading-more':
        return [...this.state.elements.map((state) => ({ state, skeleton: false })), ...SKELETON_ELEMENTS];
    }
  }

  /**
   * @param {VisibilityChangedEvent} e
   */
  _onVisibilityChanged(e) {
    if (
      this.state.type === 'loaded' &&
      this.state.elements.length > 0 &&
      e.last >= this.state.elements.length - LOAD_MORE_THRESHOLD
    ) {
      dispatchCustomEvent(this, 'load-more-elements');
    }
  }

  /**
   * @param {EventWithTarget} e
   */
  _onDeleteElement(e) {
    if (this.state.type === 'loading') {
      return;
    }

    const element = e.target.dataset.element;
    dispatchCustomEvent(this, 'delete-element', element);
  }

  /**
   * @param {FormDataMap} formData
   */
  _onFilterFormSubmit(formData) {
    if (this.state.type === 'loading') {
      return;
    }
    const pattern = /** @type {string} */ (formData.pattern);
    dispatchCustomEvent(this, 'filter-change', pattern);
  }

  /**
   * @param {FormDataMap} formData
   */
  _onAddFormSubmit(formData) {
    if (this.state.type === 'loading') {
      return;
    }

    dispatchCustomEvent(this, 'add-element', formData.element);
  }

  /**
   * @param {EventWithTarget} e
   */
  _onCopyKeyButtonClick(e) {
    copyToClipboard(e.target.dataset.text);
  }

  render() {
    const isLoading = this.state.type === 'loading';
    const isFiltering = this.state.type === 'filtering';
    const hasNoElements = this.state.type === 'loaded' && this.state.elements.length === 0;
    const elements = this._getElements();

    return html`<div class="wrapper">
      <form class="top-bar" ${formSubmit(this._onFilterFormSubmit)}>
        <cc-input-text
          name="pattern"
          inline
          label=${i18n('cc-kv-set-explorer.filter')}
          ?disabled=${this.disabled}
          ?readonly=${isLoading || isFiltering}
        ></cc-input-text>
        <cc-button
          type="submit"
          .icon=${iconFilter}
          hide-text
          outlined
          ?disabled=${this.disabled || isLoading}
          ?waiting=${isFiltering}
        >
          ${i18n('cc-kv-set-explorer.filter.apply')}
        </cc-button>
      </form>

      ${hasNoElements
        ? html`
            <div class="no-results">
              <cc-notice intent="info" message="${i18n('cc-kv-set-explorer.no-results')}"></cc-notice>
            </div>
          `
        : ''}
      ${!hasNoElements
        ? html`
            <lit-virtualizer
              ${ref(this._elementsRef)}
              class="elements"
              ?scroller=${true}
              .items=${elements}
              .keyFunction=${this._elementRender.key}
              .renderItem=${this._elementRender.item}
              @visibilityChanged=${this._onVisibilityChanged}
            ></lit-virtualizer>
          `
        : ''}
      ${this._renderAddForm()}
    </div>`;
  }

  /**
   * @param {CcKvSetElementState} state
   * @param {boolean} skeleton
   * @param {number} index
   * @return {TemplateResult}
   */
  _renderElement(state, skeleton, index) {
    return html`
      <div class="element">
        <span class="element-value ${classMap({ skeleton })}">${state.value}</span>
        <div class="element-value-buttons">
          <cc-button
            class="delete-button"
            .icon=${iconBin}
            a11y-name=${i18n('cc-kv-set-explorer.element.delete', { index })}
            data-element=${state.value}
            hide-text
            outlined
            ?skeleton=${skeleton}
            danger
            ?disabled=${this.disabled}
            ?waiting=${state.type === 'deleting'}
            @cc-button:click=${this._onDeleteElement}
          ></cc-button>
          <cc-button
            .icon=${iconCopy}
            outlined
            hide-text
            data-text=${state.value}
            ?skeleton=${skeleton}
            ?disabled=${this.disabled}
            @cc-button:click=${this._onCopyKeyButtonClick}
            >${i18n('cc-kv-set-explorer.element.copy', { index })}</cc-button
          >
        </div>
      </div>
    `;
  }

  _renderAddForm() {
    const isLoading = this.state.type === 'loading';
    const isFiltering = this.state.type === 'filtering';
    const isAdding = this.state.type !== 'loading' && this.state.addForm.type === 'adding';
    const isReadonly = isLoading || isFiltering || isAdding;

    return html`<form class="add-form" ${ref(this._addFormRef)} ${formSubmit(this._onAddFormSubmit)}>
      <cc-input-text
        name="element"
        label=${i18n('cc-kv-set-explorer.add-form.element-value')}
        ?readonly=${isReadonly}
        ?disabled=${this.disabled}
        inline
        multi
      ></cc-input-text>
      <cc-button
        type="submit"
        a11y-name=${i18n('cc-kv-set-explorer.add-form.submit.a11y')}
        .icon=${iconAdd}
        ?waiting=${isAdding}
        ?disabled=${isLoading || isFiltering || this.disabled}
        >${i18n('cc-kv-set-explorer.add-form.submit')}</cc-button
      >
    </form>`;
  }

  static get styles() {
    return [
      skeletonStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .top-bar {
          align-items: center;
          border-bottom: 1px solid var(--cc-color-border-neutral-strong);
          display: grid;
          gap: 0.5em;
          grid-template-columns: 1fr auto;
          padding: 0.5em;
        }

        .elements {
          flex: 1;
        }

        .element {
          align-items: center;
          display: grid;
          gap: 0.5em;
          grid-template-columns: 1fr auto;
          padding: 0.25em 0.5em;
          width: 100%;
        }

        .element-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .element:nth-child(odd) {
          background-color: var(--cc-color-bg-neutral, #f5f5f5);
        }

        .element:hover {
          background-color: var(--cc-color-bg-neutral-hovered, #e7e7e7);
        }

        .element-value-buttons {
          display: flex;
          gap: 0.35em;
        }

        .skeleton {
          background-color: #bbb;
          border-color: #777;
          color: transparent;
        }

        .no-results {
          align-items: center;
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          padding: 0.5em;
        }

        .add-form {
          border-top: 1px solid var(--cc-color-border-neutral-strong);
          display: flex;
          gap: 1em;
          padding: 0.5em;
        }

        .add-form cc-input-text {
          flex: 1;
        }
      `,
    ];
  }
}

// eslint-disable-next-line wc/tag-name-matches-class
window.customElements.define('cc-kv-set-explorer-beta', CcKvSetExplorer);
