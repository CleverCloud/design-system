import { css, html, LitElement } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import '../../src/components/cc-button/cc-button.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import '../../src/components/cc-notice/cc-notice.js';
import '../../src/components/cc-smart-container/cc-smart-container.js';
import { defineSmartComponent } from '../../src/lib/define-smart-component.js';
import { dispatchCustomEvent } from '../../src/lib/events.js';
import { FormErrorFocusController } from '../../src/lib/form/form-error-focus-controller.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';
import { notifySuccess } from '../../src/lib/notifications.js';
import { updateRootContext } from '../../src/lib/smart-manager.js';

/**
 * @typedef {import('../../src/components/cc-input-text/cc-input-text.js').CcInputText} CcInputText
 * @typedef {import('../../src/lib/form/form.types.js').FormDataMap} FormDataMap
 * @typedef {import('../../src/lib/send-to-api.types.js').ApiConfig} ApiConfig
 * @typedef {import('./form-demo-with-smart-component.types.js').FormDemoWithSmartComponentState} FormDemoWithSmartComponentState
 * @typedef {import('lit/directives/ref.js').Ref<HTMLFormElement>} HTMLFormElementRef
 */

export class FormDemoWithSmartComponent extends LitElement {
  static get properties() {
    return {
      formState: { type: Object, attribute: false },
    };
  }

  constructor() {
    super();

    /** @type {HTMLFormElementRef} */
    this._formRef = createRef();

    new FormErrorFocusController(this, this._formRef, () => this.formState.errors);

    /** @type {FormDemoWithSmartComponentState} */
    this.formState = { type: 'idle' };
  }

  resetForm() {
    this._formRef.value.reset();
  }

  /**
   * @param {{name: string, email: string}} formData
   */
  _onValidSubmit(formData) {
    this.formState = {
      type: 'idle',
      values: {
        name: formData.name,
        email: formData.email,
      },
    };

    dispatchCustomEvent(this, 'submit-form', formData);
  }

  /**
   * @param {'email-used'} code
   * @return {string}
   */
  _getErrorMessage(code) {
    if (code === 'email-used') {
      return 'Email already used';
    }
    return null;
  }

  connectedCallback() {
    super.connectedCallback();
    updateRootContext({});
  }

  render() {
    const isFormSubmitting = this.formState.type === 'submitting';

    return html`
      <form ${ref(this._formRef)} ${formSubmit(this._onValidSubmit.bind(this))}>
        <cc-notice intent="info" message="Values are initialized asynchronously from smart component"></cc-notice>
        <cc-input-text
          label="Name"
          name="name"
          required
          ?disabled=${isFormSubmitting}
          value="${this.formState.values?.name}"
        ></cc-input-text>
        <cc-input-text
          label="Email"
          name="email"
          type="email"
          required
          ?disabled=${isFormSubmitting}
          value="${this.formState.values?.email}"
          .errorMessage=${this._getErrorMessage(this.formState.errors?.email)}
        >
          <p slot="help">Try email address starting with <code>used@</code> to see asynchronous error</p>
        </cc-input-text>

        <cc-button primary type="submit" ?waiting=${isFormSubmitting}>Submit</cc-button>
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
          margin-bottom: 2em;
          gap: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('form-demo-with-smart-component', FormDemoWithSmartComponent);

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

defineSmartComponent({
  selector: 'form-demo-with-smart-component',
  params: {
    fake: { type: String, optional: true },
  },
  /**
   * @param {Object} settings
   * @param {FormDemoWithSmartComponent} settings.component
   * @param {(prop: string, fn: (prop: any) => void) => void} settings.updateComponent
   * @param {(type: string, listener: (detail: any) => void) => void} settings.onEvent
   */
  async onContextUpdate({ component, updateComponent, onEvent }) {
    console.log('update context');
    // setting form value from smart
    component.formState = {
      type: 'idle',
      values: {
        name: 'initial name',
        email: 'initial-email@example.com',
      },
    };

    onEvent(
      'form-demo-with-smart-component:submit-form',
      /**
       * @param {{name: string, email: string}} data
       */
      (data) => {
        updateComponent(
          'formState',
          /** @param {FormDemoWithSmartComponentState} formState */
          (formState) => {
            formState.type = 'submitting';
          },
        );

        submitForm(data)
          .then(() => {
            updateComponent(
              'formState',
              /** @param {FormDemoWithSmartComponentState} formState */
              (formState) => {
                formState.type = 'idle';
              },
            );

            component.resetForm();
            notifySuccess('Done successfully 🎉');
          })
          .catch((error) => {
            updateComponent(
              'formState',
              /** @param {FormDemoWithSmartComponentState} formState */
              (formState) => {
                formState.type = 'idle';

                if (error.message === 'email-used') {
                  formState.errors = {
                    email: 'email-used',
                  };
                }
              },
            );
          });
      },
    );
  },
});

// -- API calls
/**
 * @param {{name: string, email: string}} data
 * @return {Promise<unknown>}
 */
function submitForm(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.email.startsWith('used')) {
        reject(new Error('email-used'));
      } else {
        resolve();
      }
    }, 1500);
  });
}
