import '@lit-labs/virtualizer';
import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  iconRemixAddLine as iconAdd,
  iconRemixClipboardLine as iconCopy,
  iconRemixDeleteBin_5Fill as iconDelete,
  iconRemixSearchLine as iconFilter,
  iconRemixRefreshLine as iconRefresh,
} from '../../assets/cc-remix.icons.js';
import { copyToClipboard } from '../../lib/clipboard.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { FormErrorFocusController } from '../../lib/form/form-error-focus-controller.js';
import { formSubmit } from '../../lib/form/form-submit-directive.js';
import { random, randomPick, randomString } from '../../lib/utils.js';
import { accessibilityStyles } from '../../styles/accessibility.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { i18n } from '../../translations/translation.js';
import '../cc-badge/cc-badge.js';
import '../cc-button/cc-button.js';
import '../cc-input-text/cc-input-text.js';
import '../cc-kv-hash-explorer/cc-kv-hash-explorer.js';
import { CcKvHashInput } from '../cc-kv-hash-input/cc-kv-hash-input.js';
import '../cc-kv-list-explorer/cc-kv-list-explorer.js';
import { CcKvListInput } from '../cc-kv-list-input/cc-kv-list-input.js';
import '../cc-kv-set-explorer/cc-kv-set-explorer.js';
import '../cc-kv-string-editor/cc-kv-string-editor.js';
import '../cc-kv-terminal/cc-kv-terminal.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';
import '../cc-select/cc-select.js';

/**
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerState} CcKvExplorerState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateLoaded} CcKvExplorerStateLoaded
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateLoadingKeys} CcKvExplorerStateLoadingKeys
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateFiltering} CcKvExplorerStateFiltering
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerStateRefreshing} CcKvExplorerStateRefreshing
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerDetailState} CcKvExplorerDetailState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvExplorerKeyAddFormState} CcKvExplorerKeyAddFormState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyFilter} CcKvKeyFilter
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyState} CcKvKeyState
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyType} CcKvKeyType
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKey} CcKvKey
 * @typedef {import('./cc-kv-explorer.types.js').CcKvKeyValue} CcKvKeyValue
 * @typedef {import('../cc-kv-string-editor/cc-kv-string-editor.types.js').CcKvKeyStringEditorState} CcKvKeyStringEditorState
 * @typedef {import('../cc-kv-hash-explorer/cc-kv-hash-explorer.js').CcKvHashExplorer} CcKvHashExplorer
 * @typedef {import('../cc-kv-hash-explorer/cc-kv-hash-explorer.types.js').CcKvHashExplorerState} CcKvHashExplorerState
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.js').CcKvListExplorer} CcKvListExplorer
 * @typedef {import('../cc-kv-list-explorer/cc-kv-list-explorer.types.js').CcKvListExplorerState} CcKvListExplorerState
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.js').CcKvSetExplorer} CcKvSetExplorer
 * @typedef {import('../cc-kv-set-explorer/cc-kv-set-explorer.types.js').CcKvSetExplorerState} CcKvSetExplorerState
 * @typedef {import('../cc-kv-terminal/cc-kv-terminal.types.d.ts').CcKvTerminalState} CcKvTerminalState
 * @typedef {import('../cc-button/cc-button.js').CcButton} CcButton
 * @typedef {import('../cc-input-text/cc-input-text.js').CcInputText} CcInputText
 * @typedef {import('../cc-select/cc-select.js').CcSelect} CcSelect
 * @typedef {import('../../lib/events.types.js').GenericEventWithTarget<InputEvent, HTMLInputElement>} HTMLInputElementEvent
 * @typedef {import('../../lib/events.types.js').GenericEventWithTarget<KeyboardEvent,HTMLInputElement>} HTMLInputKeyboardEvent
 * @typedef {import('../../lib/events.types.js').EventWithTarget} EventWithTarget
 * @typedef {import('../../lib/events.types.js').EventWithTarget<CcInputText>} CcInputTextInputEvent
 * @typedef {import('../../lib/events.types.js').EventWithTarget<CcSelect>} CcSelectChangeEvent
 * @typedef {import('../../lib/form/form.types.js').FormDataMap} FormDataMap
 * @typedef {import('lit').TemplateResult<1>} TemplateResult
 * @typedef {import('lit').PropertyValues<CcKvExplorer>} CcKvExplorerPropertyValues
 * @typedef {import('lit/directives/ref.js').Ref<HTMLFormElement>} HTMLFormElementRef
 * @typedef {import('lit/directives/ref.js').Ref<CcKvHashExplorer>} CcKvHashExplorerRef
 * @typedef {import('lit/directives/ref.js').Ref<CcKvListExplorer>} CcKvListExplorerRef
 * @typedef {import('lit/directives/ref.js').Ref<CcKvSetExplorer>} CcKvSetExplorerRef
 * @typedef {import('lit/directives/ref.js').Ref<CcButton>} CcButtonRef
 * @typedef {import('lit/directives/ref.js').Ref<HTMLInputElement>} HTMLInputElementRef
 * @typedef {import('lit/directives/ref.js').Ref<Virtualizer>} VirtualizerRef
 * @typedef {import('@lit-labs/virtualizer/events.js').VisibilityChangedEvent} VisibilityChangedEvent
 * @typedef {import('@lit-labs/virtualizer/LitVirtualizer.js').LitVirtualizer} Virtualizer
 */

/**
 * A component displaying an explorer of a KV database.
 *
 * It offers the ability to:
 *
 * * display a list of keys,
 * * ask for more keys to be loaded,
 * * ask for the addition of a key,
 * * ask for the deletion of a key,
 * * show the detail of a key,
 * * edit the value of a key,
 * * send raw commands to the database using a kind of terminal interface.
 *
 * # Supported data types
 *
 * The component supports the following data types: `string`, `hash`, `list`, `set`.
 * But one can reduce the supported types with the `supportedTypes` property.
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<CcKvKeyValue>} cc-kv-explorer:add-key - Fires whenever the add form is submitted
 * @fires {CustomEvent<string>} cc-kv-explorer:delete-key - Fires whenever a delete button is clicked
 * @fires {CustomEvent<CcKvKeyFilter>} cc-kv-explorer:filter-change - Fires whenever the filter changes
 * @fires {CustomEvent} cc-kv-explorer:load-more-keys - Fires whenever the keys panel scroll position comes close to the last key
 * @fires {CustomEvent} cc-kv-explorer:refresh-keys - Fires whenever the refresh keys button is clicked
 * @fires {CustomEvent<CcKvKey>} cc-kv-explorer:selected-key-change - Fires whenever the selected key changes
 */
export class CcKvExplorer extends LitElement {
  static get properties() {
    return {
      terminalState: { type: Object, attribute: 'terminal-state' },
      detailState: { type: Object, attribute: 'detail-state' },
      state: { type: Object },
      supportedTypes: { type: Array, attribute: 'supported-types' },
      _addFormSelectedType: { type: String, state: true },
    };
  }

  constructor() {
    super();

    /** @type {CcKvTerminalState} */
    this.terminalState = { type: 'idle', history: [] };

    /** @type {CcKvExplorerDetailState} */
    this.detailState = { type: 'hidden' };

    /** @type {CcKvExplorerState} */
    this.state = { type: 'loading' };

    /** @type {Array<CcKvKeyType>} */
    this.supportedTypes = ['string', 'hash', 'list', 'set'];

    /** @type {CcButtonRef} */
    this._addButtonRef = createRef();

    /** @type {CcKvKeyType} */
    this._addFormSelectedType = this.supportedTypes[0];

    /** @type {HTMLFormElementRef} */
    this._filterFormRef = createRef();

    /** @type {HTMLFormElementRef} */
    this._addFormRef = createRef();

    /** @type {VirtualizerRef} */
    this._keysRef = createRef();

    /** @type {CcKvHashExplorerRef} */
    this._hashEditor = createRef();

    /** @type {CcKvListExplorerRef} */
    this._listEditor = createRef();

    /** @type {CcKvSetExplorerRef} */
    this._setEditor = createRef();

    /** @type {CcKvKeyType | 'all'} */
    this._filterType = 'all';

    new FormErrorFocusController(this, this._addFormRef, () => {
      if (this.detailState.type === 'add') {
        return this.detailState.formState.errors;
      }
      return null;
    });

    // this is for lit-virtualizer
    this._renderKey = this._renderKey.bind(this);
    this._onDeleteKeyButtonClick = this._onDeleteKeyButtonClick.bind(this);
    // this is for form submission
    this._onKeyAddFormSubmit = this._onKeyAddFormSubmit.bind(this);
    this._onFilterFormSubmit = this._onFilterFormSubmit.bind(this);
  }

  /**
   * Resets the add form
   */
  resetAddForm() {
    this._addFormRef.value?.reset();
  }

  /**
   * Resets the current editor add form
   */
  resetEditorForm() {
    this._hashEditor.value?.resetAddForm();
    this._listEditor.value?.resetAddForm();
    this._setEditor.value?.resetAddForm();
  }

  /**
   * Focuses the add key button
   */
  focusAddKeyButton() {
    this._addButtonRef.value.focus();
  }

  /**
   * Places focus after the deletion of a key at the given index.
   * Here we don't use a `LostFocusController` because key deletion can also take place from the button in the details panel.
   *
   * @param {number} index the index of the key that has been deleted
   */
  async focusAfterDeleteKeyAt(index) {
    await this.updateComplete;
    await this._keysRef?.value?.layoutComplete;
    const deleteButton = /** @type {HTMLElement} */ (
      this.shadowRoot.querySelector(`.delete-key-button[data-index="${index}"]`) ??
        this.shadowRoot.querySelector(`.delete-key-button[data-index="${index - 1}"]`)
    );
    if (deleteButton == null) {
      this.focusAddKeyButton();
    } else {
      deleteButton.focus();
    }
  }

  /**
   * @return {CcKvKeyState|null}
   */
  _getSelectedKey() {
    if (this.state.type !== 'loaded') {
      return null;
    }

    return this.state.keys.find((keyState) => keyState.type === 'selected');
  }

  /**
   * @param {string} keyName
   * @return {CcKvKeyState|null}
   */
  _findKeyState(keyName) {
    if (this.state.type !== 'loaded') {
      return null;
    }

    return this.state.keys.find((keyState) => keyState.key.name === keyName);
  }

  /**
   * @param {string} keyName
   * @return {CcKvKeyState['type']|null}
   */
  _getKeyState(keyName) {
    if (this.state.type === 'loaded' || this.state.type === 'loading-keys') {
      const keyState = this.state.keys.find((keyState) => keyState.key.name === keyName);
      return keyState?.type;
    }

    return null;
  }

  _isLoadingSelectedKey() {
    return (
      this.detailState != null &&
      this.detailState.type !== 'hidden' &&
      this.detailState.type !== 'unsupported' &&
      this.detailState.type !== 'add' &&
      this.detailState.editor.type === 'loading'
    );
  }

  /**
   * @param {CcKvKeyType} type
   * @return {string}
   */
  _getKeyTypeLabel(type) {
    switch (type) {
      case 'string':
        return i18n('cc-kv-explorer.key.type.string');
      case 'list':
        return i18n('cc-kv-explorer.key.type.list');
      case 'hash':
        return i18n('cc-kv-explorer.key.type.hash');
      case 'set':
        return i18n('cc-kv-explorer.key.type.set');
      default:
        return type;
    }
  }

  /**
   * @param {CcKvKeyType | 'all'} filter
   * @return {string}
   */
  _getKeyFilterLabel(filter) {
    switch (filter) {
      case 'all':
        return i18n('cc-kv-explorer.filter.all');
      default:
        return this._getKeyTypeLabel(filter);
    }
  }

  /**
   * @param {'already-used'|null} errorCode
   */
  _getAddKeyErrorMessage(errorCode) {
    switch (errorCode) {
      case 'already-used':
        return i18n('cc-kv-explorer.form.error.already-used');
      default:
        return null;
    }
  }

  async _onAddButtonClick() {
    // display editor with add mode
    this.detailState = { type: 'add', formState: { type: 'idle' } };

    // unselect any selected key
    const selectedKey = this._getSelectedKey();
    if (selectedKey != null && this.state.type === 'loaded') {
      this.state = {
        type: 'loaded',
        keys: this.state.keys.map((keyState) => {
          if (keyState.type === 'selected') {
            return {
              type: 'idle',
              key: keyState.key,
            };
          }
          return keyState;
        }),
        total: this.state.total,
      };
    }

    // move focus to the keyName input
    await this.updateComplete;
    this._addFormRef.value.keyName.focus();
  }

  /**
   * @param {VisibilityChangedEvent} e
   */
  _onVisibilityChanged(e) {
    if (this.state.type === 'loaded') {
      if (e.last >= this.state.keys.length - 5) {
        dispatchCustomEvent(this, 'load-more-keys');
      }
    }
  }

  /**
   * @param {HTMLInputElementEvent} e
   */
  _onSelectedKeyChange(e) {
    if (this.state.type !== 'loaded') {
      return;
    }

    const keyName = e.target.value;
    const keyState = this._findKeyState(keyName);

    if (this.supportedTypes.includes(keyState.key.type)) {
      dispatchCustomEvent(this, 'selected-key-change', keyState.key);
    } else {
      this.detailState = { type: 'unsupported', key: keyState.key };
    }
  }

  /**
   * @param {CustomEvent<CcKvKeyType|'all'>} e
   */
  async _onTypeFilterChange(e) {
    this._filterType = e.detail;
    // we need to wait for next update because the `ElementInternals` form data synchronization is done asynchronously (in `updated` stage)
    await this.updateComplete;
    this._filterFormRef.value.requestSubmit();
  }

  /**
   * @param {FormDataMap} formData
   */
  _onFilterFormSubmit(formData) {
    const filter = /** @type {CcKvKeyFilter}*/ ({
      type: formData.keyType,
      pattern: formData.pattern,
    });
    dispatchCustomEvent(this, 'filter-change', filter);
  }

  _onRefreshKeysButtonClick() {
    dispatchCustomEvent(this, 'refresh-keys');
  }

  /**
   * @param {CustomEvent<CcKvKeyType>} event
   */
  _onKeyTypeChanged({ detail }) {
    this._addFormSelectedType = detail;
  }

  /**
   * @param {EventWithTarget} e
   */
  _onDeleteKeyButtonClick(e) {
    dispatchCustomEvent(this, 'delete-key', e.target.dataset.key);
  }

  /**
   * @param {FormDataMap} formData
   */
  _onKeyAddFormSubmit(formData) {
    if (this.detailState.type !== 'add') {
      return;
    }
    this.detailState = {
      ...this.detailState,
      formState: { ...this.detailState.formState, errors: null },
    };

    const { name, type } = /** @type {{name: string, type: CcKvKeyType}} */ ({
      name: formData.keyName,
      type: formData.KeyType,
    });

    switch (type) {
      case 'string':
        dispatchCustomEvent(this, 'add-key', { name, type: 'string', value: formData.value });
        break;
      case 'hash':
        dispatchCustomEvent(this, 'add-key', {
          name,
          type: 'hash',
          elements: CcKvHashInput.decodeFormData(formData, 'value'),
        });
        break;
      case 'list':
        dispatchCustomEvent(this, 'add-key', {
          name,
          type: 'list',
          elements: CcKvListInput.decodeFormData(formData, 'value'),
        });
        break;
      case 'set':
        dispatchCustomEvent(this, 'add-key', {
          name,
          type: 'set',
          elements: CcKvListInput.decodeFormData(formData, 'value'),
        });
        break;
    }
  }

  /**
   * @param {EventWithTarget} e
   */
  _onCopyKeyButtonClick(e) {
    copyToClipboard(e.target.dataset.key);
  }

  /**
   * @param {CustomEvent<CcKvHashExplorerState>} e
   */
  _onHashEditorStateChange(e) {
    if (this.detailState.type === 'edit-hash') {
      this.detailState = {
        ...this.detailState,
        editor: e.detail,
      };
    }
  }

  /**
   * @param {CustomEvent<CcKvListExplorerState>} e
   */
  _onListEditorStateChange(e) {
    if (this.detailState.type === 'edit-list') {
      this.detailState = {
        ...this.detailState,
        editor: e.detail,
      };
    }
  }

  /**
   * @param {CustomEvent<CcKvTerminalState>} e
   */
  _onTerminalStateChange(e) {
    this.terminalState = e.detail;
  }

  /**
   * @param {CcKvExplorerPropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('supportedTypes')) {
      if (!this.supportedTypes.includes(this._addFormSelectedType)) {
        if (this.supportedTypes.length > 0) {
          this._addFormSelectedType = this.supportedTypes[0];
        } else {
          this._addFormSelectedType = null;
        }
      }
    }
  }

  render() {
    if (this.state.type === 'loading') {
      return html`<div class="center">
        <cc-loader></cc-loader>
      </div>`;
    }

    if (this.state.type === 'error') {
      return html`<div class="center">
        <cc-notice intent="warning" message=${i18n('cc-kv-explorer.loading.error')}></cc-notice>
      </div>`;
    }

    return html`
      <div class="wrapper">
        ${this._renderFilterBar(this.state)}
        <div class="keys">${this._renderKeysHeader(this.state)} ${this._renderKeys(this.state)}</div>
        ${this._renderDetail()}
        <cc-kv-terminal-beta
          class="terminal"
          .state=${this.terminalState}
          @cc-kv-terminal:state-change=${this._onTerminalStateChange}
        ></cc-kv-terminal-beta>
      </div>
    `;
  }

  /**
   * @param {CcKvExplorerStateLoaded | CcKvExplorerStateLoadingKeys | CcKvExplorerStateFiltering| CcKvExplorerStateRefreshing} state
   * @return {TemplateResult}
   */
  _renderFilterBar(state) {
    const isFetching = state.type === 'loading-keys' || state.type === 'filtering' || state.type === 'refreshing';
    const isFiltering = state.type === 'filtering';

    /** @type {Array<CcKvKeyType | 'all'>} */
    const redisFilters = ['all', ...this.supportedTypes];
    const kvFilterOptions = redisFilters
      // todo: remove this filter and replace by a proper `readonly` property once `<cc-select>` supports it.
      .filter((f) => !isFetching || f !== this._filterType)
      .map((f) => ({ label: this._getKeyFilterLabel(f), value: f }));

    return html`
      <form class="filter-bar" ${ref(this._filterFormRef)} ${formSubmit(this._onFilterFormSubmit)}>
        <cc-select
          name="keyType"
          inline
          label=${i18n('cc-kv-explorer.filter.by-type')}
          value="all"
          reset-value="all"
          .options=${kvFilterOptions}
          @cc-select:input=${this._onTypeFilterChange}
        ></cc-select>
        <cc-input-text
          name="pattern"
          inline
          label=${i18n('cc-kv-explorer.filter.by-pattern')}
          ?readonly=${isFetching}
        ></cc-input-text>
        <cc-button
          type="submit"
          .icon=${iconFilter}
          hide-text
          outlined
          ?disabled=${isFetching && !isFiltering}
          ?waiting=${isFiltering}
        >
          ${i18n('cc-kv-explorer.filter.apply')}
        </cc-button>
      </form>
    `;
  }

  /**
   * @param {CcKvExplorerStateLoaded | CcKvExplorerStateLoadingKeys | CcKvExplorerStateFiltering | CcKvExplorerStateRefreshing} state
   * @return {TemplateResult}
   */
  _renderKeys(state) {
    if (state.type === 'loaded' && state.keys.length === 0) {
      return html`
        <div class="keys-list-empty">
          ${state.total === 0
            ? html`
                <p>${i18n('cc-kv-explorer.keys.empty')}</p>
                <cc-button @cc-button:click=${this._onAddButtonClick}>
                  ${i18n('cc-kv-explorer.keys.empty.create-key')}
                </cc-button>
              `
            : ''}
          ${state.total > 0 ? html`<p>${i18n('cc-kv-explorer.keys.no-results')}</p>` : ''}
        </div>
      `;
    }

    const isFetching = state.type === 'loading-keys' || state.type === 'filtering' || state.type === 'refreshing';

    /** @type {Array<{keyState: CcKvKeyState, skeleton: boolean}>} */
    const keys = state.keys.map((keyState) => ({ keyState, skeleton: false }));
    if (isFetching) {
      /** @type {Array<{keyState: CcKvKeyState, skeleton: boolean}>} */
      const skeletonKeys = new Array(10).fill(0).map(() => ({
        skeleton: true,
        keyState: { type: 'idle', key: { name: randomString(random(8, 15)), type: randomPick(this.supportedTypes) } },
      }));

      keys.push(...skeletonKeys);
    }

    /**
     * @param {{keyState: CcKvKeyState, skeleton: boolean}} k
     * @return {string}
     */
    const getKeyName = (k) => k.keyState.key.name;

    return html`
      <lit-virtualizer
        ${ref(this._keysRef)}
        class="keys-list"
        ?scroller=${true}
        .items=${keys}
        .keyFunction=${getKeyName}
        .renderItem=${this._renderKey}
        tabindex="-1"
        @visibilityChanged=${this._onVisibilityChanged}
        @change=${this._onSelectedKeyChange}
      ></lit-virtualizer>
    `;
  }

  /**
   * @param {CcKvExplorerStateLoaded | CcKvExplorerStateLoadingKeys | CcKvExplorerStateFiltering | CcKvExplorerStateRefreshing} state
   * @return {TemplateResult}
   */
  _renderKeysHeader(state) {
    const isFetching = state.type === 'loading-keys' || state.type === 'filtering' || state.type === 'refreshing';
    const skeleton = state.type === 'loading-keys' || state.type === 'refreshing';
    const isRefreshing = state.type === 'refreshing';

    return html`<div class="keys-header">
      <div>
        <span class=${classMap({ skeleton })}>
          ${i18n('cc-kv-explorer.keys.header.total', { total: state.total })}
        </span>
      </div>

      <cc-button
        ${ref(this._addButtonRef)}
        a11y-name=${i18n('cc-kv-explorer.keys.header.add-key.a11y')}
        .icon=${iconAdd}
        primary
        @cc-button:click=${this._onAddButtonClick}
        >${i18n('cc-kv-explorer.keys.header.add-key')}</cc-button
      >
      <cc-button
        .icon=${iconRefresh}
        hide-text
        outlined
        ?disabled=${isFetching && !isRefreshing}
        ?waiting=${isRefreshing}
        @cc-button:click=${this._onRefreshKeysButtonClick}
        >${i18n('cc-kv-explorer.keys.header.refresh')}</cc-button
      >
    </div>`;
  }

  /**
   * @param {object} _
   * @param {CcKvKeyState} _.keyState
   * @param {boolean} _.skeleton
   * @param {number} index
   * @return {TemplateResult}
   */
  _renderKey({ keyState, skeleton }, index) {
    const isSelected = keyState.type === 'selected';
    const isLoading = isSelected && this._isLoadingSelectedKey();
    const isDeleting = keyState.type === 'deleting';
    const id = `key-${keyState.key.name}`;
    const buttonTabindex = isLoading ? undefined : -1;

    return html`<div class="key">
      <input
        class="visually-hidden"
        type="radio"
        id=${id}
        name="selectedKey"
        .value=${keyState.key.name}
        .checked=${isSelected}
        .disabled=${skeleton}
      />
      <label for=${id}>
        <span class="key-name ${classMap({ skeleton })}">${keyState.key.name}</span>
        <cc-badge weight="outlined" ?skeleton=${skeleton}>${this._getKeyTypeLabel(keyState.key.type)}</cc-badge>
        <cc-button
          class="delete-key-button"
          tabindex=${ifDefined(buttonTabindex)}
          ?disabled=${isLoading || skeleton}
          ?waiting=${isDeleting}
          ?skeleton=${skeleton}
          hide-text
          danger
          circle
          outlined
          a11y-name=${i18n('cc-kv-explorer.key.delete', { index })}
          .icon=${iconDelete}
          data-key=${keyState.key.name}
          data-index=${index}
          @cc-button:click=${this._onDeleteKeyButtonClick}
        ></cc-button>
      </label>
    </div>`;
  }

  _renderDetail() {
    switch (this.detailState.type) {
      case 'hidden':
        if (this.state.type === 'loading' || this.state.type === 'error' || this.state.total === 0) {
          return null;
        }
        return html`<div class="detail-empty">
          <p>${i18n('cc-kv-explorer.details.empty')}</p>
        </div>`;
      case 'unsupported':
        return html`<div class="detail-empty">
          <cc-notice intent="danger" message=${i18n('cc-kv-explorer.details.unsupported')}></cc-notice>
        </div>`;
      case 'add':
        return html`<div class="detail">${this._renderDetailAdd(this.detailState.formState)}</div>`;
      default:
        return html`<div class="detail">${this._renderDetailEdit(this.detailState.key)}</div>`;
    }
  }

  /**
   * @param {CcKvExplorerKeyAddFormState} formState
   * @return {TemplateResult}
   */
  _renderDetailAdd(formState) {
    const typeOptions = this.supportedTypes.map((type) => ({ label: this._getKeyTypeLabel(type), value: type }));
    const isSaving = formState.type === 'adding';

    return html`<form class="detail-add" ${ref(this._addFormRef)} ${formSubmit(this._onKeyAddFormSubmit)}>
      <div class="add-form-header">
        <cc-input-text
          name="keyName"
          label=${i18n('cc-kv-explorer.form.key')}
          required
          ?readonly=${isSaving}
          .errorMessage=${this._getAddKeyErrorMessage(formState.errors?.keyName)}
        ></cc-input-text>
        <cc-select
          name="KeyType"
          label=${i18n('cc-kv-explorer.form.type')}
          required
          ?disabled=${isSaving}
          .options=${typeOptions}
          .value=${this._addFormSelectedType}
          @cc-select:input=${this._onKeyTypeChanged}
        ></cc-select>
      </div>
      ${this._renderAdd(this._addFormSelectedType, isSaving)}
      <div class="buttons">
        <cc-button type="reset" ?disabled=${isSaving}>${i18n('cc-kv-explorer.form.reset')}</cc-button>
        <cc-button type="submit" primary ?waiting=${isSaving}>${i18n('cc-kv-explorer.form.add')}</cc-button>
      </div>
    </form>`;
  }

  /**
   * @param {CcKvKeyType} type
   * @param {boolean} isSaving
   * @return {TemplateResult}
   */
  _renderAdd(type, isSaving) {
    switch (type) {
      case 'string':
        return this._renderAddString(isSaving);
      case 'hash':
        return this._renderAddHash(isSaving);
      case 'list':
        return this._renderAddList(isSaving);
      case 'set':
        return this._renderAddSet(isSaving);
    }
  }

  /**
   * @param {boolean} isSaving
   * @return {TemplateResult}
   */
  _renderAddString(isSaving) {
    return html`<cc-input-text
      name="value"
      label=${i18n('cc-kv-explorer.form.string.value')}
      ?readonly=${isSaving}
      multi
    ></cc-input-text>`;
  }

  /**
   * @param {boolean} isSaving
   * @return {TemplateResult}
   */
  _renderAddHash(isSaving) {
    return html`<cc-kv-hash-input-beta name="value" ?readonly=${isSaving}></cc-kv-hash-input-beta>`;
  }

  /**
   * @param {boolean} isSaving
   * @return {TemplateResult}
   */
  _renderAddList(isSaving) {
    return html`<cc-kv-list-input-beta name="value" ?readonly=${isSaving}></cc-kv-list-input-beta>`;
  }

  /**
   * @param {boolean} isSaving
   * @return {TemplateResult}
   */
  _renderAddSet(isSaving) {
    return html`<cc-kv-list-input-beta name="value" ?disabled=${isSaving}></cc-kv-list-input-beta>`;
  }

  /**
   * @param {CcKvKey} key
   * @return {TemplateResult}
   */
  _renderDetailEdit(key) {
    const keyState = this._getKeyState(key.name);
    const isDeleting = keyState === 'deleting';
    const isLoading = this._isLoadingSelectedKey();

    return html`<div class="detail-edit">
      <div class="edit-header">
        <cc-badge weight="outlined">${this._getKeyTypeLabel(key.type)}</cc-badge>
        <div class="edit-header-key-name">${key.name}</div>
        <cc-button
          .icon=${iconCopy}
          outlined
          hide-text
          data-key=${key.name}
          @cc-button:click=${this._onCopyKeyButtonClick}
          >${i18n('cc-kv-explorer.key.header.copy')}</cc-button
        >
        <cc-button
          .icon=${iconDelete}
          outlined
          danger
          ?disabled=${isLoading}
          ?waiting=${isDeleting}
          data-key=${key.name}
          @cc-button:click=${this._onDeleteKeyButtonClick}
          >${i18n('cc-kv-explorer.key.header.delete')}</cc-button
        >
      </div>
      ${this._renderEdit(this.detailState, isDeleting)}
    </div>`;
  }

  /**
   * @param {CcKvExplorerDetailState} detailState
   * @param {boolean} disabled
   * @return {TemplateResult}
   */
  _renderEdit(detailState, disabled) {
    switch (detailState.type) {
      case 'edit-string':
        return this._renderEditString(detailState.editor, disabled);
      case 'edit-hash':
        return this._renderEditHash(detailState.editor, disabled);
      case 'edit-list':
        return this._renderEditList(detailState.editor, disabled);
      case 'edit-set':
        return this._renderEditSet(detailState.editor, disabled);
    }
    console.warn('Unsupported type for edition. This should never happen!');
    return html``;
  }

  /**
   * @param {CcKvKeyStringEditorState} state
   * @param {boolean} disabled
   * @return {TemplateResult}
   */
  _renderEditString(state, disabled) {
    return html`<cc-kv-string-editor-beta
      class="string-editor"
      .state=${state}
      ?disabled=${disabled}
    ></cc-kv-string-editor-beta>`;
  }

  /**
   * @param {CcKvHashExplorerState} state
   * @param {boolean} disabled
   * @return {TemplateResult}
   */
  _renderEditHash(state, disabled) {
    return html`<cc-kv-hash-explorer-beta
      ${ref(this._hashEditor)}
      .state=${state}
      ?disabled=${disabled}
      @cc-kv-hash-explorer:state-change=${this._onHashEditorStateChange}
    ></cc-kv-hash-explorer-beta>`;
  }

  /**
   * @param {CcKvListExplorerState} state
   * @param {boolean} disabled
   * @return {TemplateResult}
   */
  _renderEditList(state, disabled) {
    return html`<cc-kv-list-explorer-beta
      ${ref(this._listEditor)}
      .state=${state}
      ?disabled=${disabled}
      @cc-kv-list-explorer:state-change=${this._onListEditorStateChange}
    ></cc-kv-list-explorer-beta>`;
  }

  /**
   * @param {CcKvSetExplorerState} state
   * @param {boolean} disabled
   * @return {TemplateResult}
   */
  _renderEditSet(state, disabled) {
    return html`<cc-kv-set-explorer-beta
      ${ref(this._setEditor)}
      .state=${state}
      ?disabled=${disabled}
    ></cc-kv-set-explorer-beta>`;
  }

  static get styles() {
    return [
      accessibilityStyles,
      skeletonStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .center {
          align-items: center;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: center;
        }

        .wrapper {
          display: grid;
          grid-gap: 1em;
          grid-template-areas:
            'top-bar  top-bar'
            'keys     detail'
            'terminal terminal';
          grid-template-columns: minmax(auto, 400px) 1fr;
          grid-template-rows: auto 1fr auto;
          height: 100%;
        }

        .filter-bar {
          align-items: center;
          display: flex;
          gap: 1em;
          grid-area: top-bar;
        }

        .filter-bar cc-input-text {
          flex: 1;
        }

        .keys {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          display: grid;
          grid-area: keys;
          grid-auto-rows: auto 1fr;
          overflow: hidden;
        }

        .keys-header {
          align-items: center;
          background-color: var(--cc-color-bg-neutral);
          border-bottom: 1px solid var(--cc-color-border-neutral-strong);
          display: grid;
          gap: 0.5em;
          grid-template-columns: 1fr auto auto;
          padding: 1em;
        }

        .keys-list-empty {
          align-items: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .keys-list-empty p {
          font-style: italic;
        }

        cc-notice {
          margin: 0.5em;
        }

        .detail {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          display: flex;
          flex-direction: column;
          grid-area: detail;
          min-height: 0;
          overflow: auto;
        }

        .detail-empty {
          align-items: center;
          display: flex;
          grid-area: detail;
          justify-content: center;
        }

        .detail-empty p {
          font-style: italic;
        }

        .key {
          display: flex;
          width: 100%;
        }

        .key label {
          align-items: center;
          cursor: pointer;
          display: flex;
          flex: 1;
          gap: 0.25em;
          min-width: 0;
          padding: 0.35em;
        }

        .key label:hover {
          background-color: var(--cc-color-bg-neutral-hovered, #e7e7e7);
        }

        .key:nth-child(even) {
          background-color: var(--cc-color-bg-neutral, #f5f5f5);
        }

        .key input[type='radio']:checked + label {
          background-color: var(--cc-color-bg-neutral-active, #d9d9d9);
        }

        .key input[type='radio']:focus + label {
          outline: var(--cc-focus-outline, #000 solid 2px);
          outline-offset: -2px;
        }

        .key-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .key-name.skeleton {
          background-color: #bbb;
        }

        .detail-add {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          padding: 1em;
        }

        .add-form-header {
          display: grid;
          gap: 0.35em;
          grid-template-columns: 1fr auto;
        }

        .detail-edit {
          display: grid;
          flex: 1;
          grid-auto-rows: auto 1fr;
        }

        .edit-header {
          align-items: center;
          background-color: var(--cc-color-bg-neutral);
          border-bottom: 1px solid var(--cc-color-border-neutral-strong);
          display: grid;
          gap: 0.5em;
          grid-template-columns: auto 1fr auto auto;
          padding: 1em;
        }

        .edit-header-key-name {
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .string-editor {
          margin: 1em;
        }

        .buttons {
          border-top: 1px solid var(--cc-color-border-neutral);
          display: flex;
          flex-direction: row;
          gap: 0.5em;
          justify-content: end;
          margin-top: 1em;
          padding-top: 1em;
        }

        .terminal {
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          grid-area: terminal;
          max-height: 25em;
        }

        .skeleton {
          background-color: #bbb;
        }
      `,
    ];
  }
}

// eslint-disable-next-line wc/tag-name-matches-class
window.customElements.define('cc-kv-explorer-beta', CcKvExplorer);
