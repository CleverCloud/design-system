/* eslint-env node, mocha */

import { elementUpdated, expect, fixture } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit';
import { testAccessibility } from '../../../test/helpers/accessibility.js';
import { getElement, moveInputCaretToPosition, replaceText, typeText } from '../../../test/helpers/element-helper.js';
import { getStories } from '../../../test/helpers/get-stories.js';
import { addTranslations, setLanguage } from '../../lib/i18n/i18n.js';
import { translations } from '../../translations/translations.en.js';
import './cc-input-date.js';
import * as storiesModule from './cc-input-date.stories.js';

function getInternalInput(element) {
  return element.shadowRoot.querySelector('#input');
}

before(() => {
  addTranslations('en', translations);
  setLanguage('en');
});

describe('Component cc-input-date', () => {
  describe('valueAsDate method', () => {
    it('should return null when initial value is null', async () => {
      const element = await getElement(`<cc-input-date></cc-input-date>`);
      expect(element.valueAsDate).to.eql(null);
    });

    it('should return null when initial value is empty', async () => {
      const element = await getElement(`<cc-input-date value=""></cc-input-date>`);
      expect(element.valueAsDate).to.eql(null);
    });

    it('should return null when initial value is an invalid string', async () => {
      const element = await getElement(`<cc-input-date value="invalid date"></cc-input-date>`);
      expect(element.valueAsDate).to.eql(null);
    });

    it('should return null when initial value is an invalid date', async () => {
      const invalidDate = new Date('invalid date');
      const element = await getElement(html`<cc-input-date .value=${invalidDate}></cc-input-date>`);
      expect(element.valueAsDate).to.eql(null);
    });

    it('should return null after user types a invalid value', async () => {
      const element = await getElement(`<cc-input-date></cc-input-date>`);
      await typeText(element, 'invalid value');
      expect(element.valueAsDate).to.eql(null);
    });

    it('should return the right date after user types a valid value with ISO format', async () => {
      const element = await getElement(`<cc-input-date></cc-input-date>`);
      await typeText(element, '2023-07-31T20:11:12.259Z');
      expect(element.valueAsDate?.toISOString()).to.eql('2023-07-31T20:11:12.259Z');
    });

    it('should return the right date after user types a valid value with simple format', async () => {
      const element = await getElement(`<cc-input-date></cc-input-date>`);
      await typeText(element, '2023-07-31 20:11:12');
      expect(element.valueAsDate?.toISOString()).to.eql('2023-07-31T20:11:12.000Z');
    });

    it('should return null after user modifies the valid value to an invalid value', async () => {
      const element = await getElement(`<cc-input-date value="2023-07-31T20:11:12.259Z"></cc-input-date>`);
      await typeText(element, 'will-become-invalid-date');
      expect(element.valueAsDate).to.eql(null);
    });

    describe('with local timezone', () => {
      it('should return the right date after user types a valid value with ISO format', async () => {
        const element = await getElement(`<cc-input-date timezone="local"></cc-input-date>`);
        await typeText(element, '2023-07-31T20:11:12.259Z');
        expect(element.valueAsDate?.toISOString()).to.eql('2023-07-31T20:11:12.259Z');
      });

      it('should return the right date after user types a valid value with simple format', async () => {
        const element = await getElement(`<cc-input-date timezone="local"></cc-input-date>`);
        await typeText(element, '2023-07-31 20:11:12');
        expect(element.valueAsDate?.toISOString()).to.eql('2023-07-31T18:11:12.000Z');
      });
    });
  });

  describe('validate() method', () => {
    function assertValid(element) {
      expect(element.validate()).to.eql({ valid: true });
    }

    function assertInvalid(element, code) {
      expect(element.validate()).to.eql({ valid: false, code });
    }

    it('should be valid with default props', async () => {
      const element = await getElement(`<cc-input-date></cc-input-date>`);
      assertValid(element);
    });

    it('should be valid when not required and value is empty', async () => {
      const element = await getElement(`<cc-input-date value=""></cc-input-date>`);
      assertValid(element);
    });

    it('should be invalid with empty code when required and value is empty', async () => {
      const element = await getElement(`<cc-input-date required value=""></cc-input-date>`);
      assertInvalid(element, 'empty');
    });

    it('should become invalid with empty code when required property becomes true and value is empty', async () => {
      const element = await getElement(`<cc-input-date value=""></cc-input-date>`);
      assertValid(element);
      element.required = true;
      await elementUpdated(element);
      assertInvalid(element, 'empty');
    });

    it('should become invalid with empty code when required is true and value becomes empty', async () => {
      const element = await getElement(`<cc-input-date required value="2023-07-31T20:11:12.259Z"></cc-input-date>`);
      assertValid(element);
      element.value = '';
      await elementUpdated(element);
      assertInvalid(element, 'empty');
    });

    it('should become valid when required property becomes false and value is empty', async () => {
      const element = await getElement(`<cc-input-date required value=""></cc-input-date>`);
      assertInvalid(element, 'empty');
      element.required = false;
      await elementUpdated(element);
      assertValid(element);
    });

    it('should become valid when required is true and value becomes non empty', async () => {
      const element = await getElement(`<cc-input-date required value=""></cc-input-date>`);
      assertInvalid(element, 'empty');
      element.value = '2023-07-31T20:11:12.259Z';
      await elementUpdated(element);
      assertValid(element);
    });

    it('should be invalid with badInput code when initial value is an invalid date', async () => {
      const element = await getElement(`<cc-input-date value="invalid date"></cc-input-date>`);
      assertInvalid(element, 'badInput');
    });

    it('should be valid when value is a valid date', async () => {
      const element = await getElement(`<cc-input-date value="2023-07-31T20:11:12.259Z"></cc-input-date>`);
      assertValid(element);
    });

    it('should become valid when user types a valid date with ISO format', async () => {
      const element = await getElement(`<cc-input-date></cc-input-date>`);
      await typeText(element, '2023-07-31T20:11:12.259Z');
      assertValid(element);
    });

    it('should become valid when user types a valid date with simple format', async () => {
      const element = await getElement(`<cc-input-date></cc-input-date>`);
      await typeText(element, '2023-07-31 20:11:12');
      assertValid(element);
    });

    it('should become invalid with badInput code when user types a invalid date', async () => {
      const element = await getElement(`<cc-input-date></cc-input-date>`);
      await typeText(element, 'invalid date');
      assertInvalid(element, 'badInput');
    });

    it('should be invalid with rangeUnderflow code when value is lower that min', async () => {
      const element = await getElement(
        `<cc-input-date min="2023-07-31T21:00:00.000Z" value="2023-07-31T20:11:12.259Z"></cc-input-date>`,
      );
      assertInvalid(element, 'rangeUnderflow');
    });

    it('should become invalid with rangeUnderflow code when min changes', async () => {
      const element = await getElement(
        `<cc-input-date min="2023-07-31T20:00:00.000Z" value="2023-07-31T20:11:12.259Z"></cc-input-date>`,
      );
      element.min = '2023-07-31T21:00:00.000Z';
      await elementUpdated(element);
      assertInvalid(element, 'rangeUnderflow');
    });

    it('should become invalid with rangeUnderflow code when user types a too low value', async () => {
      const element = await getElement(
        `<cc-input-date min="2023-07-31T21:00:00.000Z" value="2023-07-31T21:11:12.259Z"></cc-input-date>`,
      );
      await replaceText(element, '2023-07-31 20:11:12');
      assertInvalid(element, 'rangeUnderflow');
    });

    it('should be invalid with rangeOverflow code when value is higher that max', async () => {
      const element = await getElement(
        `<cc-input-date max="2023-07-31T20:00:00.000Z" value="2023-07-31T20:11:12.259Z"></cc-input-date>`,
      );
      assertInvalid(element, 'rangeOverflow');
    });

    it('should become invalid with rangeOverflow code when max changes', async () => {
      const element = await getElement(
        `<cc-input-date max="2023-07-31T21:00:00.000Z" value="2023-07-31T20:11:12.259Z"></cc-input-date>`,
      );
      element.max = '2023-07-31T20:00:00.000Z';
      await elementUpdated(element);
      assertInvalid(element, 'rangeOverflow');
    });

    it('should become invalid with rangeOverflow code when user types a too high value', async () => {
      const element = await getElement(
        `<cc-input-date max="2023-07-31T21:00:00.000Z" value="2023-07-31T20:11:12.259Z"></cc-input-date>`,
      );
      await replaceText(element, '2023-07-31 21:11:12');
      assertInvalid(element, 'rangeOverflow');
    });

    it('should become valid when user types a date in min-max bounds', async () => {
      const element = await getElement(
        `<cc-input-date min="2023-07-31T20:00:00.000Z" max="2023-07-31T21:00:00.000Z" value="2023-07-31T19:11:12.259Z"></cc-input-date>`,
      );
      await replaceText(element, '2023-07-31 20:11:12');
      assertValid(element);
    });
  });

  describe('error class', () => {
    it('should be placed on internal input when errorMessage is set', async () => {
      const element = await fixture('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');

      element.errorMessage = 'Error';
      await elementUpdated(element);

      const input = getInternalInput(element);
      expect(input).to.have.class('error');
    });

    it('should be removed from internal input when error message is removed', async () => {
      const element = await fixture('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
      element.errorMessage = 'Error';
      await elementUpdated(element);

      element.errorMessage = '';
      await elementUpdated(element);

      const input = getInternalInput(element);
      expect(input).to.not.have.class('error');
    });

    it('should be not set on internal input when no error message defined', async () => {
      const element = await fixture('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
      await elementUpdated(element);

      const input = getInternalInput(element);
      expect(input).to.not.have.class('error');
    });
  });

  describe('get value() method', () => {
    it('should return the invalid value when setting invalid value property', async () => {
      const element = await getElement('<cc-input-date value="invalid"></cc-input-date>');
      expect(element.value).to.equal('invalid');
    });

    it('should return the invalid value when changing value property to an invalid value', async () => {
      const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
      element.value = 'invalid value';
      await elementUpdated(element);
      expect(element.value).to.equal('invalid value');
    });

    it('should return the right value when setting value from simple format string', async () => {
      const element = await getElement('<cc-input-date value="2023-07-31 19:11:12"></cc-input-date>');
      expect(element.value).to.equal('2023-07-31T19:11:12.000Z');
    });

    it('should return the right value when setting value from simple format string and with local timezone', async () => {
      const element = await getElement('<cc-input-date value="2023-07-31 19:11:12" timezone="local"></cc-input-date>');
      expect(element.value).to.equal('2023-07-31T17:11:12.000Z');
    });

    it('should return the right value when setting value from iso string', async () => {
      const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
      expect(element.value).to.equal('2023-07-31T19:11:12.259Z');
    });

    it('should return the right value when setting value from date', async () => {
      const date = new Date('2023-07-31T19:11:12.259Z');
      const element = await getElement(html`<cc-input-date .value=${date}></cc-input-date>`);
      expect(element.value).to.equal('2023-07-31T19:11:12.259Z');
    });

    it('should return the right value when modifying value with simple format string', async () => {
      const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
      element.value = '2023-07-31 20:11:12';
      await elementUpdated(element);
      expect(element.value).to.equal('2023-07-31T20:11:12.000Z');
    });

    it('should return the right value when modifying value with simple format string and with local timezone', async () => {
      const element = await getElement(
        '<cc-input-date value="2023-07-31T19:11:12.259Z" timezone="local"></cc-input-date>',
      );
      element.value = '2023-07-31 20:11:12';
      await elementUpdated(element);
      expect(element.value).to.equal('2023-07-31T18:11:12.000Z');
    });

    it('should return the right value when modifying value with iso string', async () => {
      const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
      element.value = '2023-07-31T20:11:12.259Z';
      await elementUpdated(element);
      expect(element.value).to.equal('2023-07-31T20:11:12.259Z');
    });

    it('should return the right value when setting value from date', async () => {
      const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
      element.value = new Date('2023-07-31T20:11:12.259Z');
      await elementUpdated(element);
      expect(element.value).to.equal('2023-07-31T20:11:12.259Z');
    });
  });

  describe('internal input value', () => {
    describe('with UTC timezone', () => {
      it('should have the right value after init', async () => {
        const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
        const input = getInternalInput(element);
        expect(input.value).to.equal('2023-07-31 19:11:12');
      });

      it('should have the right value after modifying value', async () => {
        const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
        element.value = '2023-07-31T20:11:12.259Z';
        await elementUpdated(element);
        const input = getInternalInput(element);
        expect(input.value).to.equal('2023-07-31 20:11:12');
      });

      it('should have the formatted value after user typed an ISO date', async () => {
        const element = await getElement('<cc-input-date value=""></cc-input-date>');
        const input = getInternalInput(element);

        await typeText(element, '2023-07-31T20:11:12.259Z');
        expect(input.value).to.equal('2023-07-31 20:11:12');
      });
    });

    describe('with local timezone', () => {
      it('should have the right value after init', async () => {
        const element = await getElement(
          '<cc-input-date value="2023-07-31T19:11:12.259Z" timezone="local"></cc-input-date>',
        );
        const input = getInternalInput(element);
        expect(input.value).to.equal('2023-07-31 21:11:12');
      });

      it('should have the right value after modifying value', async () => {
        const element = await getElement(
          '<cc-input-date value="2023-07-31T19:11:12.259Z" timezone="local"></cc-input-date>',
        );
        element.value = '2023-07-31T20:11:12.259Z';
        await elementUpdated(element);
        const input = getInternalInput(element);
        expect(input.value).to.equal('2023-07-31 22:11:12');
      });

      it('should have the formatted value after user typed an ISO date', async () => {
        const element = await getElement('<cc-input-date value="" timezone="local"></cc-input-date>');
        const input = getInternalInput(element);

        await typeText(element, '2023-07-31T20:11:12.259Z');
        expect(input.value).to.equal('2023-07-31 22:11:12');
        await elementUpdated(element);
        expect(input.value).to.equal('2023-07-31 22:11:12');
      });
    });

    it('should have the invalid value when initializing with invalid value', async () => {
      const element = await getElement('<cc-input-date value="invalid value" timezone="local"></cc-input-date>');
      const input = getInternalInput(element);
      expect(input.value).to.equal('invalid value');
    });

    it('should have empty value after setting an invalid value', async () => {
      const element = await getElement(
        '<cc-input-date value="2023-07-31T19:11:12.259Z" timezone="local"></cc-input-date>',
      );
      element.value = 'invalid value';
      await elementUpdated(element);
      const input = getInternalInput(element);
      expect(input.value).to.equal('invalid value');
    });

    it('should have the value that has been just typed by user', async () => {
      const element = await getElement('<cc-input-date value=""></cc-input-date>');
      const input = getInternalInput(element);

      await typeText(element, 'invalid');
      expect(input.value).to.equal('invalid');
      await elementUpdated(element);
      expect(input.value).to.equal('invalid');

      await typeText(element, ' value');
      expect(input.value).to.equal('invalid value');
      await elementUpdated(element);
      expect(input.value).to.equal('invalid value');
    });

    it('should have the right value after changing the timezone from local to UTC', async () => {
      const element = await getElement(
        '<cc-input-date value="2023-07-31T19:11:12.259Z" timezone="local"></cc-input-date>',
      );

      element.timezone = 'UTC';
      await elementUpdated(element);
      const input = getInternalInput(element);
      expect(input.value).to.equal('2023-07-31 19:11:12');
    });

    it('should have the right value after changing the timezone from UTC to local', async () => {
      const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.259Z"></cc-input-date>');
      element.timezone = 'local';
      await elementUpdated(element);
      const input = getInternalInput(element);
      expect(input.value).to.equal('2023-07-31 21:11:12');
    });

    it('should have the formatted value when setting the same value with iso string', async () => {
      // this test case tests:
      // Arrange:
      //   input has value "2023-07-31T19:11:12.000Z"
      //   internal native input has formatted value "2023-07-31 19:11:12"
      // Action:
      //   user focus in the native input
      //   user selects all (CTRL+A)
      //   user paste "2023-07-31T19:11:12.000Z" (CTRL+V) which is the same value with the ISO representation
      // ? Note that this is not feasible with the web test runner API, but we have a kind of workaround that simulate that.
      // Assert:
      //   we expect the value to be formatted and the internal input to have the formatted value.
      // ? Note that this is achieved by the live directive.

      const element = await getElement('<cc-input-date value="2023-07-31T19:11:12.000Z"></cc-input-date>');
      const input = getInternalInput(element);

      // this doesn't trigger input event on internal input
      element.value = '2023-07-31T19:11:12.000';
      // this triggers input event on internal input.
      await typeText(input, 'Z');

      expect(input.value).to.equal('2023-07-31 19:11:12');
    });
  });

  describe('when user presses key', () => {
    async function checkAfterShift(initialDate, position, key, expectedDate) {
      const element = await getElement(html` <cc-input-date .value="${initialDate}"></cc-input-date>`);
      await moveInputCaretToPosition(element, position);
      await sendKeys({ press: key });
      await elementUpdated(element);
      expect(element.value).to.equal(expectedDate);
    }

    describe('ArrowUp', () => {
      for (const position of [0, 1, 2, 3, 4]) {
        it(`should shift up date year when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowUp', '2024-07-31T19:11:12.259Z');
        });
      }
      for (const position of [5, 6, 7]) {
        it(`should shift up date month when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowUp', '2023-08-31T19:11:12.259Z');
        });
      }
      for (const position of [8, 9, 10]) {
        it(`should shift up date day when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowUp', '2023-08-01T19:11:12.259Z');
        });
      }
      for (const position of [11, 12, 13]) {
        it(`should shift up date hour when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowUp', '2023-07-31T20:11:12.259Z');
        });
      }
      for (const position of [14, 15, 16]) {
        it(`should shift up date minute when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowUp', '2023-07-31T19:12:12.259Z');
        });
      }
      for (const position of [17, 18, 19]) {
        it(`should shift up date second when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowUp', '2023-07-31T19:11:13.259Z');
        });
      }
    });

    describe('ArrowDown', () => {
      for (const position of [0, 1, 2, 3, 4]) {
        it(`should shift down date year when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowDown', '2022-07-31T19:11:12.259Z');
        });
      }
      for (const position of [5, 6, 7]) {
        it(`should shift down date month when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowDown', '2023-06-30T19:11:12.259Z');
        });
      }
      for (const position of [8, 9, 10]) {
        it(`should shift down date day when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowDown', '2023-07-30T19:11:12.259Z');
        });
      }
      for (const position of [11, 12, 13]) {
        it(`should shift down date hour when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowDown', '2023-07-31T18:11:12.259Z');
        });
      }
      for (const position of [14, 15, 16]) {
        it(`should shift down date minute when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowDown', '2023-07-31T19:10:12.259Z');
        });
      }
      for (const position of [17, 18, 19]) {
        it(`should shift down date second when cursor position is ${position}`, async () => {
          await checkAfterShift('2023-07-31T19:11:12.259Z', position, 'ArrowDown', '2023-07-31T19:11:11.259Z');
        });
      }
    });
  });

  describe(`accessibility`, () => {
    testAccessibility(getStories(storiesModule));
  });
});
