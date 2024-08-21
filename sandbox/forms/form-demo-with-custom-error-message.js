import { css, html, LitElement } from 'lit';
import '../../src/components/cc-button/cc-button.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';

const CUSTOM_ERROR_MESSAGES = {
  empty: '🥴 Please enter a value',
  badEmail: () => '😡 Please enter a valid email address',
};

export class DemoWithCustomError extends LitElement {
  static get properties() {
    return {};
  }

  render() {
    return html`
      <form name="my-form" ${formSubmit()}>
        <cc-input-text label="Email (default)" type="email" name="email-default" required>
          <p slot="help">With default error messages</p>
        </cc-input-text>
        <cc-input-text
          label="Email (custom)"
          type="email"
          name="email-custom"
          required
          .customErrorMessages=${CUSTOM_ERROR_MESSAGES}
        >
          <p slot="help">With custom error messages</p>
        </cc-input-text>

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

        form {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('form-demo-with-custom-error-message', DemoWithCustomError);
