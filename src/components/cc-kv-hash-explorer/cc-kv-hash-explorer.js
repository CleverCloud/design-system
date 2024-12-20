import '@lit-labs/virtualizer';
import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconRemixAddLine as iconAdd,
  iconRemixDeleteBin_5Fill as iconBin,
  iconRemixCheckFill as iconCheck,
  iconRemixClipboardLine as iconCopy,
  iconRemixCloseFill as iconCross,
  iconRemixSearchLine as iconFilter,
  iconRemixEditFill as iconPen,
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

/** @type {Array<{state: CcKvHashElementState, skeleton: boolean}>} */
const SKELETON_ELEMENTS = Array(5)
  .fill(0)
  .map(() => ({
    state: { type: 'idle', field: fakeString(random(5, 10)), value: fakeString(random(10, 20)) },
    skeleton: true,
  }));

/** @type {number} */
const LOAD_MORE_THRESHOLD = 5;

/**
 * @typedef {import('./cc-kv-hash-explorer.types.js').CcKvHashExplorerState} CcKvHashExplorerState
 * @typedef {import('./cc-kv-hash-explorer.types.js').CcKvHashElementState} CcKvHashElementState
 * @typedef {import('../cc-input-text/cc-input-text.js').CcInputText} CcInputText
 * @typedef {import('../../lib/events.types.js').EventWithTarget} EventWithTarget
 * @typedef {import('../../lib/form/form.types.js').FormDataMap} FormDataMap
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 * @typedef {import('lit/directives/ref.js').Ref<CcInputText>} CcInputTextRef
 * @typedef {import('lit/directives/ref.js').Ref<HTMLFormElement>} HTMLFormElementRef
 * @typedef {import('lit/directives/ref.js').Ref<Virtualizer>} VirtualizerRef
 * @typedef {import('@lit-labs/virtualizer/events.js').VisibilityChangedEvent} VisibilityChangedEvent
 * @typedef {import('@lit-labs/virtualizer/LitVirtualizer.js').LitVirtualizer} Virtualizer
 */

/**
 * A component displaying an explorer for a kv `hash` data type.
 *
 * It offers the ability to:
 *
 * * show elements
 * * dynamically ask for more elements when scrolling to the bottom of the elements panel
 * * ask for elements filtering
 * * ask for any element deletion
 * * ask for any element update
 * * ask for any element addition
 * * copy any element value to the clipboard
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<{field:string, value: string}>} cc-kv-hash-explorer:add-element - Fires whenever the add form is submitted
 * @fires {CustomEvent<string>} cc-kv-hash-explorer:delete-element - Fires whenever a delete button is clicked
 * @fires {CustomEvent<string>} cc-kv-hash-explorer:filter-change - Fires whenever the filter changes
 * @fires {CustomEvent} cc-kv-hash-explorer:load-more-elements - Fires whenever the almost last element become visible (after user scroll)
 * @fires {CustomEvent<CcKvHashExplorerState>} cc-kv-hash-explorer:state-change - Fires whenever the state change internally
 * @fires {CustomEvent<{field:string, value: string}>} cc-kv-hash-explorer:update-element - Fires whenever an update button is clicked
 */
export class CcKvHashExplorer extends LitElement {
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

    /** @type {CcKvHashExplorerState} - The state of the component */
    this.state = { type: 'loading' };

    /** @type {HTMLFormElementRef} */
    this._addFormRef = createRef();

    /** @type {CcInputTextRef} */
    this._editElementValueRef = createRef();

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
      /** @param {{state: CcKvHashElementState, skeleton: boolean}} e */
      key: (e) => e.state.value,
      /**
       * @param {{state: CcKvHashElementState, skeleton: boolean}} e
       * @param {number} index
       */
      item: (e, index) => this._renderElement(e.state, e.skeleton, index),
    };
    this._onStartEdit = this._onStartEdit.bind(this);
    this._onCancelEdit = this._onCancelEdit.bind(this);
    this._onUpdate = this._onUpdate.bind(this);
    this._onDeleteElement = this._onDeleteElement.bind(this);
    // this is for form submission
    this._onAddFormSubmit = this._onAddFormSubmit.bind(this);
    this._onFilterFormSubmit = this._onFilterFormSubmit.bind(this);
  }

  /**
   * Resets the add form.
   *
   * @param {boolean} [focus] Whether to focus the field input.
   */
  resetAddForm(focus = true) {
    this._addFormRef.value.reset();
    if (focus) {
      this._addFormRef.value.field.focus();
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
  async _onStartEdit(e) {
    if (this.state.type === 'loading') {
      return;
    }

    const field = e.target.dataset.field;

    this.state = {
      ...this.state,
      elements: this.state.elements.map((e) => {
        if (e.type === 'editing') {
          return { type: 'idle', field: e.field, value: e.value };
        }
        if (e.field === field) {
          return { type: 'editing', field: e.field, value: e.value };
        }
        return e;
      }),
    };

    dispatchCustomEvent(this, 'state-change', this.state);

    await this._elementsRef.value.layoutComplete;
    this._editElementValueRef.value.focus();
  }

  /**
   * @param {EventWithTarget} e
   */
  _onCancelEdit(e) {
    if (this.state.type === 'loading') {
      return;
    }

    const field = e.target.dataset.field;

    this.state = {
      ...this.state,
      elements: this.state.elements.map((e) => {
        if (e.field === field) {
          return { type: 'idle', field: e.field, value: e.value };
        }
        return e;
      }),
    };

    dispatchCustomEvent(this, 'state-change', this.state);
  }

  /**
   * @param {EventWithTarget} e
   */
  _onUpdate(e) {
    if (this.state.type === 'loading') {
      return;
    }
    const field = e.target.dataset.field;
    dispatchCustomEvent(this, 'update-element', { field, value: this._editElementValueRef.value.value });
  }

  /**
   * @param {EventWithTarget} e
   */
  _onDeleteElement(e) {
    if (this.state.type === 'loading') {
      return;
    }
    const field = e.target.dataset.field;
    dispatchCustomEvent(this, 'delete-element', field);
  }

  /**
   * @param {EventWithTarget} e
   */
  _onCopyKeyButtonClick(e) {
    copyToClipboard(e.target.dataset.text);
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
    dispatchCustomEvent(this, 'add-element', { field: formData.field, value: formData.value });
  }

  render() {
    const isLoading = this.state.type === 'loading';
    const isFiltering = this.state.type === 'filtering';
    const hasNoElements = this.state.type === 'loaded' && this.state.elements.length === 0;
    const elements = this._getElements();

    return html`
      <div class="wrapper">
        <form class="top-bar" ${formSubmit(this._onFilterFormSubmit)}>
          <cc-input-text
            name="pattern"
            inline
            label=${i18n('cc-kv-hash-explorer.filter')}
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
            ${i18n('cc-kv-hash-explorer.filter.apply')}
          </cc-button>
        </form>

        ${hasNoElements
          ? html`
              <div class="no-results">
                <cc-notice intent="info" message="${i18n('cc-kv-hash-explorer.no-results')}"></cc-notice>
              </div>
            `
          : ''}
        ${!hasNoElements
          ? html`
              <div class="header">
                <div>${i18n('cc-kv-hash-explorer.header.field')}</div>
                <div>${i18n('cc-kv-hash-explorer.header.value')}</div>
              </div>
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
      </div>
    `;
  }

  /**
   * @param {CcKvHashElementState} state
   * @param {boolean} skeleton
   * @param {number} index
   * @return {TemplateResult}
   */
  _renderElement(state, skeleton, index) {
    const isEditing = state.type === 'editing' || state.type === 'updating';

    return html`
      <div class="element">
        <span class=${classMap({ 'element-field': true, skeleton: skeleton })}>${state.field}</span>
        <div class="element-value">
          ${isEditing
            ? html`
                <cc-input-text
                  class="element-value-input"
                  ${ref(this._editElementValueRef)}
                  label=${i18n('cc-kv-hash-explorer.element.edit.value-input')}
                  .value=${state.value}
                  data-field=${state.field}
                  hidden-label
                  multi
                  ?skeleton=${skeleton}
                  ?readonly=${state.type === 'updating'}
                  @cc-input-text:requestimplicitsubmit=${this._onUpdate}
                ></cc-input-text>
              `
            : ''}
          ${!isEditing ? html`<span class="element-value-span ${classMap({ skeleton })}">${state.value}</span>` : ''}

          <div class="element-value-buttons">${this._renderElementButtons(state, skeleton, isEditing, index)}</div>
        </div>
      </div>
    `;
  }

  /**
   * @param {CcKvHashElementState} state
   * @param {boolean} skeleton
   * @param {boolean} isEditing
   * @param {number} index
   * @return {TemplateResult}
   */
  _renderElementButtons(state, skeleton, isEditing, index) {
    const firstButton = isEditing
      ? {
          icon: iconCross,
          class: 'edit-cancel-button',
          onClick: this._onCancelEdit,
          label: i18n('cc-kv-hash-explorer.element.edit.cancel'),
          outlined: true,
          primary: false,
          danger: false,
          waiting: false,
          disabled: state.type === 'updating',
        }
      : {
          icon: iconPen,
          class: 'edit-start-button',
          onClick: this._onStartEdit,
          label: i18n('cc-kv-hash-explorer.element.edit.start', { index: index + 1 }),
          outlined: true,
          primary: true,
          danger: false,
          waiting: false,
          disabled: state.type === 'deleting',
        };

    const secondBtn = isEditing
      ? {
          icon: iconCheck,
          class: 'edit-validate-button',
          onClick: this._onUpdate,
          label: i18n('cc-kv-hash-explorer.element.edit.save'),
          outlined: false,
          primary: true,
          danger: false,
          waiting: state.type === 'updating',
          disabled: false,
        }
      : {
          icon: iconBin,
          class: 'delete-button',
          onClick: this._onDeleteElement,
          label: i18n('cc-kv-hash-explorer.element.delete', { index }),
          outlined: true,
          primary: false,
          danger: true,
          waiting: state.type === 'deleting',
          disabled: false,
        };

    return html`
      <cc-button
        class=${firstButton.class}
        .icon=${firstButton.icon}
        a11y-name=${firstButton.label}
        data-field=${state.field}
        hide-text
        ?outlined=${firstButton.outlined}
        ?skeleton=${skeleton}
        ?danger=${firstButton.danger}
        ?primary=${firstButton.primary}
        ?disabled=${firstButton.disabled || this.disabled}
        ?waiting=${firstButton.waiting}
        @cc-button:click=${firstButton.onClick}
      ></cc-button>
      <cc-button
        class=${secondBtn.class}
        .icon=${secondBtn.icon}
        a11y-name=${secondBtn.label}
        data-field=${state.field}
        hide-text
        ?outlined=${secondBtn.outlined}
        ?skeleton=${skeleton}
        ?danger=${secondBtn.danger}
        ?primary=${secondBtn.primary}
        ?disabled=${secondBtn.disabled || this.disabled}
        ?waiting=${secondBtn.waiting}
        @cc-button:click=${secondBtn.onClick}
      ></cc-button>
      <cc-button
        .icon=${iconCopy}
        outlined
        hide-text
        data-text=${state.value}
        ?skeleton=${skeleton}
        ?disabled=${this.disabled}
        @cc-button:click=${this._onCopyKeyButtonClick}
        >${i18n('cc-kv-hash-explorer.element.copy', { index })}</cc-button
      >
    `;
  }

  _renderAddForm() {
    const isLoading = this.state.type === 'loading';
    const isFiltering = this.state.type === 'filtering';
    const isAdding = this.state.type !== 'loading' && this.state.addForm.type === 'adding';
    const isReadonly = isLoading || isFiltering || isAdding;

    return html`
      <form class="add-form" ${ref(this._addFormRef)} ${formSubmit(this._onAddFormSubmit)}>
        <cc-input-text
          name="field"
          label=${i18n('cc-kv-hash-explorer.add-form.element-field')}
          ?readonly=${isReadonly}
          ?disabled=${this.disabled}
          inline
        ></cc-input-text>
        <cc-input-text
          name="value"
          label=${i18n('cc-kv-hash-explorer.add-form.element-value')}
          ?readonly=${isReadonly}
          ?disabled=${this.disabled}
          inline
          multi
        ></cc-input-text>
        <cc-button
          type="submit"
          a11y-name=${i18n('cc-kv-hash-explorer.add-form.submit.a11y')}
          .icon=${iconAdd}
          ?waiting=${isAdding}
          ?disabled=${isLoading || isFiltering || this.disabled}
          >${i18n('cc-kv-hash-explorer.add-form.submit')}</cc-button
        >
      </form>
    `;
  }

  /**
   * @return {Array<{state: CcKvHashElementState, skeleton: boolean}>}
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
          grid-auto-columns: 1fr auto;
          grid-auto-flow: column;
          padding: 0.5em;
        }

        .elements {
          flex: 1;
        }

        .element,
        .header {
          align-items: center;
          display: grid;
          gap: 0.5em;
          grid-auto-columns: 1fr 1fr auto auto auto;
          grid-auto-flow: column;
          padding: 0.25em 0.5em;
          width: 100%;
        }

        .element-value {
          align-items: center;
          display: grid;
          gap: 0.5em;
          grid-template-columns: 1fr auto;
        }

        .element-field,
        .element-value-span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .header {
          background-color: var(--cc-color-bg-neutral-active, #d9d9d9);
          font-weight: bold;
          padding: 0.5em;
          width: unset;
        }

        .element:nth-child(odd) {
          background-color: var(--cc-color-bg-neutral, #f5f5f5);
        }

        .element:hover {
          background-color: var(--cc-color-bg-neutral-hovered, #e7e7e7);
        }

        .element-value-input {
          margin: 0.15em 0;
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
window.customElements.define('cc-kv-hash-explorer-beta', CcKvHashExplorer);
