import { css, html, LitElement } from 'lit';
import '../../src/components/cc-button/cc-button.js';
import '../../src/components/cc-input-date/cc-input-date.js';
import '../../src/components/cc-input-number/cc-input-number.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import '../../src/components/cc-select/cc-select.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';

const COLOR_OPTIONS = [
  {
    label: 'red',
    value: 'red',
  },
  {
    label: 'yellow',
    value: 'yellow',
  },
  {
    label: 'green',
    value: 'green',
  },
];

export class FormDemoReset extends LitElement {
  render() {
    return html`
      <form name="my-form" ${formSubmit()}>
        <cc-input-text label="Name" name="name"></cc-input-text>
        <cc-input-text label="Surname" name="surname" value="Pierre" reset-value="Pierre"></cc-input-text>
        <cc-input-number label="Size" name="size" value="170" reset-value="170"></cc-input-number>
        <cc-input-date
          label="Age"
          name="age"
          value="1978-04-05T14:05:00.000Z"
          reset-value="1978-04-05T14:05:00.000Z"
        ></cc-input-date>
        <cc-select label="Color" name="color" .options=${COLOR_OPTIONS} value="red" reset-value="red"></cc-select>

        <div class="buttons-bar">
          <cc-button type="reset">Reset</cc-button>
          <cc-button primary type="submit">Submit</cc-button>
        </div>
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

        .buttons-bar {
          display: flex;
          align-items: end;
          gap: 1em;
        }
      `,
    ];
  }
}

window.customElements.define('form-demo-reset', FormDemoReset);
