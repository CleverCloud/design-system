import { css, html, LitElement } from 'lit';
import '../../src/components/cc-input-text/cc-input-text.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';
import { isStringEmpty } from '../../src/lib/utils.js';

/**
 * @typedef {import('../../src/lib/form/form.types.js').FormValidity} FormValidity
 */

export class FormDemoWithNativeInputs extends LitElement {
  static get properties() {
    return {
      _nameErrorMessage: { type: String, state: true },
    };
  }

  constructor() {
    super();
    this._nameErrorMessage = null;
  }

  _onValid() {
    this._nameErrorMessage = null;
  }

  /**
   * @param {FormValidity} formValidity
   */
  _onInvalid(formValidity) {
    const nameValidity = formValidity.find((v) => v.name === 'name').validity;
    if (nameValidity.valid === false) {
      this._nameErrorMessage = nameValidity.code;
    } else {
      this._nameErrorMessage = null;
    }
  }

  render() {
    return html`
      <form ${formSubmit(this._onValid.bind(this), this._onInvalid.bind(this))}>
        <label for="name">Name <i>(Required)</i>:</label>
        <input type="text" name="name" id="name" required />
        ${!isStringEmpty(this._nameErrorMessage) ? html` <div class="error">${this._nameErrorMessage}</div> ` : ''}

        <cc-input-text label="Surname" name="surname" required></cc-input-text>

        <button type="submit">Submit</button>
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

        form {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }

        input:focus {
          outline: solid 2px black;
        }

        .error {
          color: red;
        }
      `,
    ];
  }
}

window.customElements.define('form-demo-with-native-inputs', FormDemoWithNativeInputs);
