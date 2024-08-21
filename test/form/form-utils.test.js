import { expect } from '@open-wc/testing';
import '../../src/components/cc-input-date/cc-input-date.js';
import '../../src/components/cc-input-number/cc-input-number.js';
import '../../src/components/cc-input-text/cc-input-text.js';
import '../../src/components/cc-select/cc-select.js';
import {
  convertErrorMessageToString,
  focusFirstFormControlWithError,
  getFormDataMap,
  isCcFormControlElement,
  isFormControlElementLike,
} from '../../src/lib/form/form-utils.js';
import { addTranslations, setLanguage } from '../../src/lib/i18n/i18n.js';
import { translations } from '../../src/translations/translations.en.js';
import { getElement } from '../helpers/element-helper.js';

before(() => {
  addTranslations('en', translations);
  setLanguage('en');
});

describe('getFormDataMap', () => {
  it('should be empty on empty form', async () => {
    const element = await getElement('<form></form>');

    const formData = getFormDataMap(element);

    expect(formData).to.eql({});
  });

  it('should have the data of all native inputs', async () => {
    const element = await getElement(`<form>
      <input type="text" name="text" value="text value">
      <input name="checkbox" type="checkbox" value="checkbox value" checked>
      <input name="number" type="number" value="42" checked>
      <select name="select">
        <option value="select-option-1" selected></option>
        <option value="select-options-2"></option>
      </select>
      <textarea name="textarea">textarea value</textarea>
      <fieldset>
        <input name="radio" type="radio" value="radio-option-1">
        <input name="radio" type="radio" value="radio-option-2" checked>
        <input name="radio" type="radio" value="radio-option-3">
      </fieldset>
    </form>`);

    const formData = getFormDataMap(element);

    expect(formData).to.eql({
      text: 'text value',
      checkbox: 'checkbox value',
      number: '42',
      select: 'select-option-1',
      textarea: 'textarea value',
      radio: 'radio-option-2',
    });
  });

  it('should have the data of all cc inputs', async () => {
    const element = await getElement(`<form>
      <cc-input-text name="text" value="text value"></cc-input-text>
      <cc-input-number name="number" value="42"></cc-input-number>
      <cc-input-date name="date" value="2024-03-22T14:56:00Z"></cc-input-date>
      <cc-select name="select" value="option1" ></cc-select>
    </form>`);

    const formData = getFormDataMap(element);

    expect(formData).to.eql({
      text: 'text value',
      number: '42',
      date: '2024-03-22T14:56:00Z',
      select: 'option1',
    });
  });

  it('should aggregate data on fields with same name', async () => {
    const element = await getElement(`<form>
      <fieldset>
        <input name="checkbox" type="checkbox" value="checkbox-1" checked>
        <input name="checkbox" type="checkbox" value="checkbox-2">
        <input name="checkbox" type="checkbox" value="checkbox-3" checked>
      </fieldset>
      <fieldset>
        <input name="text" type="text" value="text-1">
        <input name="text" type="text" value="text-2">
        <input name="text" type="text" value="text-3">
      </fieldset>
    </form>`);

    const formData = getFormDataMap(element);

    expect(formData).to.eql({
      checkbox: ['checkbox-1', 'checkbox-3'],
      text: ['text-1', 'text-2', 'text-3'],
    });
  });
});

describe('isCcFormControlElement', () => {
  describe('should return true on', () => {
    ['cc-input-text', 'cc-input-number', 'cc-input-date', 'cc-select'].forEach((e) => {
      it(`<${e}>`, async () => {
        const element = await getElement(`<${e}></${e}>`);

        const isCcInput = isCcFormControlElement(element);

        expect(isCcInput).to.eql(true);
      });
    });
  });
  describe('should return false on', () => {
    ['input', 'textarea', 'select', 'unknownElement'].forEach((e) => {
      it(`<${e}>`, async () => {
        const element = await getElement(`<${e}></${e}>`);

        const isCcInput = isCcFormControlElement(element);

        expect(isCcInput).to.eql(false);
      });
    });
  });
});

describe('isNativeInputElement', () => {
  describe('should return true on', () => {
    ['textarea', 'select'].forEach((e) => {
      it(`<${e}>`, async () => {
        const element = await getElement(`<${e}></${e}>`);

        const isNativeInput = isFormControlElementLike(element);

        expect(isNativeInput).to.eql(true);
      });
    });
  });
  describe('should return false on', () => {
    ['unknownElement'].forEach((e) => {
      it(`<${e}>`, async () => {
        const element = await getElement(`<${e}></${e}>`);

        const isNativeInput = isFormControlElementLike(element);

        expect(isNativeInput).to.eql(false);
      });
    });
    ['button', 'reset', 'submit'].forEach((type) => {
      it(`<input type="${type}">`, async () => {
        const element = await getElement(`<input type="${type}">`);

        const isNativeInput = isFormControlElementLike(element);

        expect(isNativeInput).to.eql(false);
      });
    });
  });
});

describe('convertErrorMessageToString', () => {
  it('should convert null to empty string', () => {
    const errorMessage = null;

    const result = convertErrorMessageToString(errorMessage);

    expect(result).to.eql('');
  });

  it('should convert undefined to empty string', () => {
    const errorMessage = undefined;

    const result = convertErrorMessageToString(errorMessage);

    expect(result).to.eql('');
  });

  it('should convert string to same string', () => {
    const errorMessage = 'error message';

    const result = convertErrorMessageToString(errorMessage);

    expect(result).to.eql('error message');
  });

  it('should convert Node to string', async () => {
    const errorMessage = await getElement('<p>This is<br>an <b>error</b> <i>message</i></p>');

    const result = convertErrorMessageToString(errorMessage);

    expect(result).to.eql('This is an error message');
  });
});

describe('focusFirstFormControlWithError', () => {
  it('should focus first form control', async () => {
    const element = await getElement('<form><input type="text" required></form>');
    const invalidInput = element.querySelector('input');

    await focusFirstFormControlWithError(element);

    expect(document.activeElement).not.to.equal(null);
    expect(document.activeElement).to.equal(invalidInput);
  });

  it('should focus second form control', async () => {
    const element = await getElement(
      '<form><input type="text" value="value" required><input type="text" required></form>',
    );
    const invalidInput = element.querySelectorAll('input')[1];

    await focusFirstFormControlWithError(element);

    expect(document.activeElement).not.to.equal(null);
    expect(document.activeElement).to.equal(invalidInput);
  });
});
