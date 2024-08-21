import { css, html, LitElement } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import '../../src/components/cc-select/cc-select.js';
import '../../src/components/cc-smart-container/cc-smart-container.js';

const DEMOS = {
  'with-cc-components': 'With clever components',
  'with-native-inputs': 'With native inputs',
  reset: 'With reset values',
  'with-array-type': 'With array types',
  'with-custom-error-message': 'With custom error messages',
  'with-custom-validation': 'With custom validations',
  'with-coupled-inputs': 'With coupled inputs',
  'with-fieldset': 'With fieldset',
  'dynamic-form': 'With dynamic form',
  'with-smart-component': 'With smart component',
};

const DEMO_CHOICES = Object.entries(DEMOS).map(([value, label]) => ({ value, label }));

/**
 * @typedef {import('lit').PropertyValues<FormsSandbox>} FormsSandboxPropertyValues
 */

export class FormsSandbox extends LitElement {
  static get properties() {
    return {
      _demo: { type: String, state: true },
      _event: { type: Object, state: true },
    };
  }

  constructor() {
    super();

    this._demo = null;
    this._event = null;
  }

  /**
   * @param {CustomEvent} e
   */
  _onDemoChange({ detail }) {
    this._loadDemo(detail);
  }

  /**
   * @param {CustomEvent} e
   */
  _onFormValid(e) {
    this._event = {
      type: `🎉 ${e.type}`,
      detail: e.detail,
      json: JSON.stringify(e.detail, null, 2),
    };
    console.log(`${this._event.type}: ${this._event.json}`);
  }

  /**
   * @param {CustomEvent} e
   */
  _onFormInvalid(e) {
    this._event = {
      type: `⚠️ ${e.type}`,
      detail: e.detail,
      json: JSON.stringify(e.detail, null, 2),
    };
    console.log(`${this._event.type}: ${this._event.json}`);
  }

  /**
   * @param {string} demo
   * @return {string}
   */
  _getDemoFilePath(demo) {
    return `./form-demo-${demo}.js`;
  }

  /**
   * @param {string} demo
   */
  _loadDemo(demo) {
    import(this._getDemoFilePath(demo)).then(() => {
      this._demo = demo;
      localStorage.setItem('cc-sandbox-form-demo', demo);
      this._event = null;
    });
  }

  /**
   * @param {FormsSandboxPropertyValues} _changedProperties
   */
  firstUpdated(_changedProperties) {
    this._loadDemo(localStorage.getItem('cc-sandbox-form-demo') || Object.keys(DEMOS)[0]);
  }

  render() {
    return html`
      <div class="ctrl">
        <cc-select
          label="Demo"
          inline
          .options=${DEMO_CHOICES}
          .value=${this._demo}
          @cc-select:input=${this._onDemoChange}
        ></cc-select>
      </div>
      <div class="main">
        <div class="demo">
          <cc-smart-container context='{ "fake": "fake" }'> ${this._renderDemo()} </cc-smart-container>
        </div>
        ${this._event != null
          ? html`
              <div class="spacer"></div>
              <div class="event">
                <div class="event-title">${this._event.type}</div>
                <pre>${this._event.json}</pre>
              </div>
            `
          : ''}
      </div>
    `;
  }

  _renderDemo() {
    if (this._demo == null) {
      return null;
    }
    const tagName = `form-demo-${this._demo}`;

    return staticHtml`<${unsafeStatic(tagName)} @form:valid=${this._onFormValid} @form:invalid=${this._onFormInvalid}></${unsafeStatic(tagName)}>`;
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
        }

        .ctrl {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          padding-bottom: 1em;
          border-bottom: 1px solid #ddd;
          margin-bottom: 1em;
          gap: 0.5em;
        }

        .main {
          display: flex;
          gap: 1em;
          padding: 1em;
        }

        .spacer {
          flex: 1;
        }

        .event {
          align-self: center;
          display: flex;
          flex-direction: column;
          border: 1px solid #ddd;
          width: 25em;
          max-height: 30em;
        }

        .event-title {
          padding: 1em;
          font-family: monospace;
          font-weight: bold;
        }

        pre {
          overflow: auto;
          padding: 1em;
          margin: 0;
          background-color: #efefef;
          white-space: pre-wrap;
        }
      `,
    ];
  }
}

window.customElements.define('forms-sandbox', FormsSandbox);
