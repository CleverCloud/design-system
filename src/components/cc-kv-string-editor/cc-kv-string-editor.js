import { css, html, LitElement } from 'lit';
import { dispatchCustomEvent } from '../../lib/events.js';
import { formSubmit } from '../../lib/form/form-submit-directive.js';
import { i18n } from '../../translations/translation.js';
import '../cc-button/cc-button.js';
import '../cc-input-text/cc-input-text.js';

/**
 * @typedef {import('./cc-kv-string-editor.types.js').CcKvKeyStringEditorState} CcKvKeyStringEditorState
 * @typedef {import('../../lib/form/form.types.js').FormDataMap} FormDataMap
 * @typedef {import('lit').PropertyValues<CcKvStringEditor>} PropertyValues
 */

/**
 * A component displaying an editor for a kv `string` data type.
 *
 * It offers the ability to:
 *
 * * show the value
 * * ask for value update
 * * copy the value to the clipboard
 *
 * @cssdisplay block
 *
 * @fires {CustomEvent<string>} cc-kv-string-editor:update-value - Fires whenever the save button is clicked
 */
export class CcKvStringEditor extends LitElement {
  static get properties() {
    return {
      disabled: { type: Boolean },
      state: { type: Object },
      _value: { type: String, state: true },
    };
  }

  constructor() {
    super();

    /** @type {boolean} - Whether all actions should be disabled */
    this.disabled = false;

    /** @type {CcKvKeyStringEditorState} - The state of the component */
    this.state = { type: 'loading' };

    /** @type {string} */
    this._value = '';

    // this is for add form submit
    this._onFormSubmit = this._onFormSubmit.bind(this);
  }

  /**
   * @param {CustomEvent<string>} event
   */
  _onValueInput(event) {
    this._value = event.detail;
  }

  /**
   * @param {FormDataMap} formData
   */
  _onFormSubmit(formData) {
    if (this.state.type === 'loading') {
      return;
    }

    dispatchCustomEvent(this, 'update-value', formData.value);
  }

  /**
   * @param {PropertyValues} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('state')) {
      this._value = this.state.type === 'loading' ? '' : this.state.value;
    }
  }

  render() {
    const isLoading = this.state.type === 'loading';
    const isSaving = this.state.type === 'saving';
    const isDisabled = this.disabled;

    return html`<form ${formSubmit(this._onFormSubmit)}>
      <cc-input-text
        name="value"
        label=${i18n('cc-kv-string-editor.form.value')}
        .skeleton=${isLoading}
        ?disabled=${isDisabled}
        ?readonly=${isSaving}
        clipboard
        multi
        .resetValue=${this._value}
        .value=${this._value}
        @cc-input-text:input=${this._onValueInput}
      ></cc-input-text>
      <div class="buttons">
        <cc-button type="reset" .skeleton=${isLoading} .disabled=${isDisabled || isSaving}>
          ${i18n('cc-kv-string-editor.form.reset')}
        </cc-button>
        <cc-button type="submit" primary .skeleton=${isLoading} .disabled=${isDisabled} .waiting=${isSaving}>
          ${i18n('cc-kv-string-editor.form.save')}
        </cc-button>
      </div>
    </form>`;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }

        .buttons {
          display: flex;
          gap: 0.5em;
          justify-content: end;
          margin-top: 1em;
        }
      `,
    ];
  }
}

// eslint-disable-next-line wc/tag-name-matches-class
window.customElements.define('cc-kv-string-editor-beta', CcKvStringEditor);
