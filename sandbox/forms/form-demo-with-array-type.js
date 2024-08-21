import { css, html, LitElement } from 'lit';
import '../../src/components/cc-button/cc-button.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import '../../src/components/cc-toggle/cc-toggle.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';

export class FormDemoWithArrayType extends LitElement {
  render() {
    return html`
      <form ${formSubmit()}>
        <fieldset>
          <legend>Names</legend>
          <cc-input-text label="Name 1" name="names" inline></cc-input-text>
          <cc-input-text label="Name 2" name="names" inline></cc-input-text>
        </fieldset>

        <cc-input-text label="Tags" name="tags" .tags=${[]}></cc-input-text>

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

window.customElements.define('form-demo-with-array-type', FormDemoWithArrayType);
