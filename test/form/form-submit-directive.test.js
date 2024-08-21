import { defineCE, elementUpdated, expect } from '@open-wc/testing';
import * as hanbi from 'hanbi';
import { LitElement, html } from 'lit';
import '../../src/components/cc-button/cc-button.js';
import '../../src/components/cc-input-date/cc-input-date.js';
import '../../src/components/cc-input-number/cc-input-number.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import '../../src/components/cc-select/cc-select.js';
import { formSubmit } from '../../src/lib/form/form-submit-directive.js';
import { addTranslations, setLanguage } from '../../src/lib/i18n/i18n.js';
import { translations } from '../../src/translations/translations.en.js';
import { getElement } from '../helpers/element-helper.js';

async function spyElement(formContent) {
  const validCallbackSpy = hanbi.spy();
  const invalidCallbackSpy = hanbi.spy();

  const form = defineCE(
    class extends LitElement {
      render() {
        return html`<form ${formSubmit(validCallbackSpy.handler, invalidCallbackSpy.handler)}>${formContent}</form>`;
      }
    },
  );

  const element = await getElement(`<${form}></${form}>`);

  const validEventSpy = hanbi.spy();
  const invalidEventSpy = hanbi.spy();
  element.addEventListener('form:valid', (e) => {
    validEventSpy.handler(e.detail);
  });
  element.addEventListener('form:invalid', (e) => {
    invalidEventSpy.handler(e.detail);
  });

  return {
    element,
    submit: async () => {
      await elementUpdated(element);
      element.shadowRoot.querySelector('form').requestSubmit();
    },
    get formElement() {
      return element.shadowRoot.querySelector('form');
    },
    get activeElement() {
      return element.shadowRoot.activeElement;
    },
    callbacks: {
      valid: validCallbackSpy,
      invalid: invalidCallbackSpy,
    },
    events: {
      valid: validEventSpy,
      invalid: invalidEventSpy,
    },
  };
}

before(() => {
  addTranslations('en', translations);
  setLanguage('en');
});

describe('FormSubmitDirective', () => {
  describe('with native inputs', () => {
    const formContent = html`
      <input name="input1" type="text" required />
      <input name="input2" type="text" />
      <input name="input3" type="text" required />
      <input name="input4" type="text" />
      <input name="input5" type="text" required />
      <button type="submit">button</button>
    `;

    it('should call onInvalid callback and fire form:invalid event when form is invalid', async () => {
      const spy = await spyElement(formContent);

      await spy.submit();

      const expectedValidity = [
        {
          name: 'input1',
          validity: {
            valid: false,
            code: 'Please fill out this field.',
          },
        },
        {
          name: 'input2',
          validity: {
            valid: true,
          },
        },
        {
          name: 'input3',
          validity: {
            valid: false,
            code: 'Please fill out this field.',
          },
        },
        {
          name: 'input4',
          validity: {
            valid: true,
          },
        },
        {
          name: 'input5',
          validity: {
            valid: false,
            code: 'Please fill out this field.',
          },
        },
      ];

      expect(spy.callbacks.valid.callCount).to.equal(0);
      expect(spy.callbacks.invalid.callCount).to.equal(1);
      expect(spy.callbacks.invalid.getCall(0).args[0]).to.eql(expectedValidity);
      expect(spy.events.valid.callCount).to.equal(0);
      expect(spy.events.invalid.callCount).to.equal(1);
      expect(spy.events.invalid.getCall(0).args[0]).to.eql(expectedValidity);
    });

    it('should focus invalid input (first)', async () => {
      const spy = await spyElement(formContent);
      spy.formElement.querySelector('input[name=input3]').value = `value`;
      spy.formElement.querySelector('input[name=input5]').value = `value`;

      await spy.submit();

      expect(spy.activeElement).not.to.equal(null);
      expect(spy.activeElement).to.equal(spy.formElement.querySelector('input[name=input1]'));
    });

    it('should focus invalid input (middle)', async () => {
      const spy = await spyElement(formContent);
      spy.formElement.querySelector('input[name=input1]').value = `value`;
      spy.formElement.querySelector('input[name=input5]').value = `value`;

      await spy.submit();

      expect(spy.activeElement).not.to.equal(null);
      expect(spy.activeElement).to.equal(spy.formElement.querySelector('input[name=input3]'));
    });

    it('should focus invalid input (last)', async () => {
      const spy = await spyElement(formContent);
      spy.formElement.querySelector('input[name=input1]').value = `value`;
      spy.formElement.querySelector('input[name=input3]').value = `value`;

      await spy.submit();

      expect(spy.activeElement).not.to.equal(null);
      expect(spy.activeElement).to.equal(spy.formElement.querySelector('input[name=input5]'));
    });

    it('should call onValid callback and fire form:valid event when form is valid', async () => {
      const spy = await spyElement(formContent);
      spy.formElement.querySelector('input[name=input1]').value = `value for input1`;
      spy.formElement.querySelector('input[name=input3]').value = `value for input3`;
      spy.formElement.querySelector('input[name=input4]').value = `value for input4`;
      spy.formElement.querySelector('input[name=input5]').value = `value for input5`;

      await spy.submit();

      const expectedFormData = {
        input1: 'value for input1',
        input2: '',
        input3: 'value for input3',
        input4: 'value for input4',
        input5: 'value for input5',
      };
      expect(spy.callbacks.invalid.callCount).to.equal(0);
      expect(spy.callbacks.valid.callCount).to.equal(1);
      expect(spy.callbacks.valid.getCall(0).args[0]).to.eql(expectedFormData);
      expect(spy.events.invalid.callCount).to.equal(0);
      expect(spy.events.valid.callCount).to.equal(1);
      expect(spy.events.valid.getCall(0).args[0]).to.eql(expectedFormData);
    });
  });
  describe('with cc form controls', () => {
    const formContent = html`
      <cc-input-text name="input-text" required></cc-input-text>
      <cc-input-number name="input-number" required></cc-input-number>
      <cc-input-date name="input-date" required></cc-input-date>
      <cc-select
        name="input-select"
        required
        .options=${[
          { label: 'option1', value: 'option1' },
          { label: 'option2', value: 'option2' },
        ]}
      ></cc-select>
      <cc-button type="submit">button</cc-button>
    `;

    it('should call onInvalid callback and fire form:invalid event when form is invalid', async () => {
      const spy = await spyElement(formContent);

      await spy.submit();

      const expectedValidity = [
        {
          name: 'input-text',
          validity: {
            valid: false,
            code: 'empty',
          },
        },
        {
          name: 'input-number',
          validity: {
            valid: false,
            code: 'empty',
          },
        },
        {
          name: 'input-date',
          validity: {
            valid: false,
            code: 'empty',
          },
        },
        {
          name: 'input-select',
          validity: {
            valid: false,
            code: 'empty',
          },
        },
      ];
      expect(spy.callbacks.valid.callCount).to.equal(0);
      expect(spy.callbacks.invalid.callCount).to.equal(1);
      expect(spy.callbacks.invalid.getCall(0).args[0]).to.eql(expectedValidity);
      expect(spy.events.valid.callCount).to.equal(0);
      expect(spy.events.invalid.callCount).to.equal(1);
      expect(spy.events.invalid.getCall(0).args[0]).to.eql(expectedValidity);
    });

    it('should focus invalid input (first)', async () => {
      const spy = await spyElement(formContent);
      spy.formElement.querySelector('[name=input-number]').value = 42;
      spy.formElement.querySelector('[name=input-date]').value = `2024-03-22T15:20:00.000Z`;
      spy.formElement.querySelector('[name=input-select]').value = `option1`;

      await spy.submit();

      expect(spy.activeElement).not.to.equal(null);
      expect(spy.activeElement).to.equal(spy.formElement.querySelector('[name=input-text]'));
    });

    it('should focus invalid input (middle)', async () => {
      const spy = await spyElement(formContent);
      spy.formElement.querySelector('[name=input-text]').value = `value`;
      spy.formElement.querySelector('[name=input-date]').value = `2024-03-22T15:20:00.000Z`;
      spy.formElement.querySelector('[name=input-select]').value = `option1`;

      await spy.submit();

      expect(spy.activeElement).not.to.equal(null);
      expect(spy.activeElement).to.equal(spy.formElement.querySelector('[name=input-number]'));
    });

    it('should focus invalid input (last)', async () => {
      const spy = await spyElement(formContent);
      spy.formElement.querySelector('[name=input-text]').value = `value`;
      spy.formElement.querySelector('[name=input-number]').value = 42;
      spy.formElement.querySelector('[name=input-date]').value = `2024-03-22T15:20:00.000Z`;

      await spy.submit();

      expect(spy.activeElement).not.to.equal(null);
      expect(spy.activeElement).to.equal(spy.formElement.querySelector('[name=input-select]'));
    });

    it('should call onValid callback and fire form:valid event when form is valid', async () => {
      const spy = await spyElement(formContent);
      spy.formElement.querySelector('[name=input-text]').value = `value`;
      spy.formElement.querySelector('[name=input-number]').value = 42;
      spy.formElement.querySelector('[name=input-select]').value = `option1`;
      spy.formElement.querySelector('[name=input-date]').value = `2024-03-22T15:20:00.000Z`;

      await spy.submit();

      const expectedFormData = {
        'input-text': 'value',
        'input-number': '42',
        'input-date': '2024-03-22T15:20:00.000Z',
        'input-select': 'option1',
      };
      expect(spy.callbacks.invalid.callCount).to.equal(0);
      expect(spy.callbacks.valid.callCount).to.equal(1);
      expect(spy.callbacks.valid.getCall(0).args[0]).to.eql(expectedFormData);
      expect(spy.events.invalid.callCount).to.equal(0);
      expect(spy.events.valid.callCount).to.equal(1);
      expect(spy.events.valid.getCall(0).args[0]).to.eql(expectedFormData);
    });
  });
});
