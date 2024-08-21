import { css, html, LitElement } from 'lit';
import '../../src/components/cc-button/cc-button.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';

/**
 * @typedef {import('../../src/lib/events.types.js').EventWithTarget<HTMLInputElement>} HTMLInputElementEvent
 */

export class FormDemoDynamicForm extends LitElement {
  static get properties() {
    return {
      _proMode: { type: Boolean, state: true },
    };
  }

  constructor() {
    super();

    this._proMode = false;
  }

  /**
   * @param {HTMLInputElementEvent} e
   */
  _onProModeChange(e) {
    this._proMode = e.target.checked;
  }

  render() {
    return html`
      <form ${formSubmit()}>
        <cc-input-text label="Name" name="name" required></cc-input-text>

        <label for="pro-mode">
          <input id="pro-mode" type="checkbox" .checked=${this._proMode} @change=${this._onProModeChange} /> Pro mode
        </label>

        ${this._proMode ? html` <cc-input-text label="Company" name="company" required></cc-input-text> ` : ''}

        <cc-button type="submit" primary>Submit</cc-button>
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
      `,
    ];
  }
}

window.customElements.define('form-demo-dynamic-form', FormDemoDynamicForm);
