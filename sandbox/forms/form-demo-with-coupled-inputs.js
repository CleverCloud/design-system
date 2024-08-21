import { css, html, LitElement } from 'lit';
import '../../src/components/cc-button/cc-button.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import '../../src/components/cc-select/cc-select.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';
import { Validation } from '../../src/lib/form/validation.js';

const CASE_OPTIONS = [
  {
    label: 'UPPERCASE',
    value: 'uppercase',
  },
  {
    label: 'lowercase',
    value: 'lowercase',
  },
];

const CASE_ERROR_MESSAGE = {
  'not-uppercase': 'Should be in upper case',
  'not-lowercase': 'Should be in lower case',
};

/**
 * @typedef {import('../../src/lib/form/form.types.js').FormDataMap} FormDataMap
 * @typedef {import('../../src/lib/form/validation.types.js').Validity} Validity
 */

export class FormDemoWithCoupledInputs extends LitElement {
  render() {
    const customValidator = {
      /**
       *
       * @param {any} value
       * @param {FormDataMap} formData
       * @return {Validity}
       */
      validate(value, formData) {
        if (formData.case === 'uppercase') {
          return value.toUpperCase() === value ? Validation.VALID : Validation.invalid('not-uppercase');
        }
        if (formData.case === 'lowercase') {
          return value.toLowerCase() === value ? Validation.VALID : Validation.invalid('not-lowercase');
        }
        return Validation.VALID;
      },
    };

    return html`
      <form ${formSubmit()}>
        <cc-select label="Case" .options=${CASE_OPTIONS} name="case" required></cc-select>
        <cc-input-text
          label="Value"
          name="val"
          required
          .customValidator=${customValidator}
          .customErrorMessages=${CASE_ERROR_MESSAGE}
        ></cc-input-text>

        <cc-button primary type="submit">Submit</cc-button>
      </form>
    `;
  }

  static get styles() {
    return [
      // language=CSS
      css`
        :host {
          display: flex;
          flex-direction: column;
          gap: 1em;
        }

        form {
          display: flex;
          flex-direction: column;
          padding: 0.5em;
          border: 1px solid #111;
          gap: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('form-demo-with-coupled-inputs', FormDemoWithCoupledInputs);
