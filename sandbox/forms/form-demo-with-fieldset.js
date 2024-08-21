import { css, html, LitElement } from 'lit';
import '../../src/components/cc-button/cc-button.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import '../../src/components/cc-toggle/cc-toggle.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';
import { focusFirstFormControlWithError } from '../../src/lib/form/form-utils.js';
import { Validation } from '../../src/lib/form/validation.js';

/**
 * @typedef {import('../../src/lib/form/validation.types.js').Validity} Validity
 * @typedef {import('../../src/lib/form/form.types.js').FormDataMap} FormDataMap
 */

const UNIQUE_VALIDATOR = {
  /**
   *
   * @param {any} value
   * @param {FormDataMap} formData
   * @return {any}
   */
  validate(value, formData) {
    if (Array.isArray(formData.items) && formData.items.filter((i) => i === value).length > 1) {
      return Validation.invalid('Must be unique');
    }
    return Validation.VALID;
  },
};

export class FormDemoWithFieldset extends LitElement {
  _onInvalid() {
    focusFirstFormControlWithError(this.shadowRoot.querySelector('fieldset'));
  }

  render() {
    return html`
      <form ${formSubmit()} @form:invalid=${this._onInvalid}>
        <fieldset>
          <legend>Unique items</legend>

          <cc-input-text label="Item 1" name="items" required .customValidator=${UNIQUE_VALIDATOR}></cc-input-text>
          <cc-input-text label="Item 2" name="items" required .customValidator=${UNIQUE_VALIDATOR}></cc-input-text>
          <cc-input-text label="Item 3" name="items" required .customValidator=${UNIQUE_VALIDATOR}></cc-input-text>
        </fieldset>

        <cc-button primary type="submit">Submit</cc-button>
      </form>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: block;
        }

        form,
        fieldset {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('form-demo-with-fieldset', FormDemoWithFieldset);
