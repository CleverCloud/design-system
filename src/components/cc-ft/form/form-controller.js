import { dispatchCustomEvent } from '../../../lib/events.js';
import { RequiredValidator } from '../validation/validation.js';

/**
 * @typedef {import('./form.types.js').FieldDefinition} FieldDefinition
 * @typedef {import('./form.types.js').FormState} FormState
 * @typedef {import('./form.types.js').FormValidation} FormValidation
 * @typedef {import('../validation/validation.types.js').Validation} Validation
 */

export class FormController {
  /**
   *
   * @param host
   * @param {string} name
   * @param {Array<FieldDefinition>} fieldDefinitions
   */
  constructor (host, name, fieldDefinitions) {
    this._host = host;
    this._host.addController(this);

    /** @type {string} */
    this._name = name;

    /** @type {Map<string, FieldDefinition>} */
    this._fields = new Map();
    fieldDefinitions.forEach((f) => {
      this._fields.set(f.name, f);
    });

    /** @type {FormState} */
    this._state = 'idle';

    /** @type {Map<any, any>} */
    this._values = new Map();

    /** @type {Map<any, string>} */
    this._errors = new Map();

    /** @type {Map<any, HTMLElement>} */
    this._elements = new Map();

    /** @type {null|HTMLElement} */
    this._formElement = null;

    // reset
    this._fields.forEach((fd) => {
      this._values.set(fd.name, fd.reset);
    });
  }

  /**
   * @param {string} fieldName
   * @return {FieldDefinition}
   */
  getFieldDefinition (fieldName) {
    return this._fields.get(fieldName);
  }

  /**
   *
   * @param {FieldDefinition} fieldDefinition
   * @param {'none'|'reset'|'resetIfEmpty'} setValuePolicy
   * @throws {Error} if field is already defined
   */
  addFieldDefinition (fieldDefinition, setValuePolicy) {
    if (this.getFieldDefinition(fieldDefinition.name) != null) {
      throw new Error(`Field "${fieldDefinition.name}" already defined.`);
    }

    this._fields.set(fieldDefinition.name, fieldDefinition);

    if (setValuePolicy === 'reset') {
      this._values.set(fieldDefinition.name, fieldDefinition.reset);
    }
    else if (setValuePolicy === 'resetIfEmpty' && this.getFieldValue(fieldDefinition.name) == null) {
      this._values.set(fieldDefinition.name, fieldDefinition.reset);
    }
  }

  /**
   *
   * @param {string} fieldName
   * @param {boolean} forgetValue
   * @throws {Error} if field is not defined
   */
  removeFieldDefinition (fieldName, forgetValue) {
    this._assertFieldDefined(fieldName);

    if (this._fields.delete(fieldName)) {
      this._errors.delete(fieldName);
      if (forgetValue) {
        this._values.delete(fieldName);
      }
    }
  }

  reset () {
    this._state = 'idle';
    this._errors.clear();
    this._values.clear();

    this._fields.forEach((fd) => {
      this._values.set(fd.name, fd.reset);
    });

    dispatchCustomEvent(this._host, 'change',
      {
        form: this._name,
        date: this.getValues(),
        changedFields: Array.from(this._fields.keys()),
      },
    );

    this._host.requestUpdate();
  }

  /**
   * @param {FormState} state
   */
  setState (state) {
    this._state = state;

    this._host.requestUpdate();
  }

  /**
   * @return {FormState}
   */
  getState () {
    return this._state;
  }

  /**
   * @return {{[p: string]: any}}
   */
  getValues () {
    return Object.fromEntries(this._values.entries());
  }

  /**
   *
   * @param {string} fieldName
   * @return {any}
   * @throws {Error} if field is not defined
   */
  getFieldValue (fieldName) {
    this._assertFieldDefined(fieldName);

    return this._values.get(fieldName);
  }

  /**
   *
   * @param {string} fieldName
   * @param {any} value
   * @throws {Error} if field is not defined
   */
  setFieldValue (fieldName, value) {
    this._assertFieldDefined(fieldName);

    const currentValue = this.getFieldValue(fieldName);

    if (currentValue !== value) {
      this._values.set(fieldName, value);

      dispatchCustomEvent(this._host, 'change',
        {
          form: this._name,
          date: this.getValues(),
          changedFields: [fieldName],
        },
      );

      this._host.requestUpdate();
    }
  }

  /**
   * @return {{[p: string]: string}}
   */
  getErrors () {
    return Object.fromEntries(this._errors.entries());
  }

  /**
   * @param {string} fieldName
   * @return {string}
   * @throws {Error} if field is not defined
   */
  getFieldError (fieldName) {
    this._assertFieldDefined(fieldName);

    return this._errors.get(fieldName);
  }

  /**
   * @param {string} fieldName
   * @param {string} error
   * @throws {Error} if field is not defined
   */
  setFieldError (fieldName, error) {
    this._assertFieldDefined(fieldName);

    this._errors.set(fieldName, error);
    const element = this.getFieldElement(fieldName);
    if (element != null) {
      element.errorMessage = this.getFieldDefinition(fieldName).customErrorMessages?.(error) ?? error;
    }
    this.focus(fieldName);
  }

  /**
   * @param {boolean} report
   * @return {FormValidation}
   */
  validate (report) {
    const validations = this._getFieldDefinitions().map((fieldDefinition) => {
      const fieldName = fieldDefinition.name;
      const element = this.getFieldElement(fieldName);
      const value = this.getFieldValue(fieldDefinition.name);
      const validation = this._validateField(value, fieldDefinition, element, report);
      return {
        fieldName,
        validation,
      };
    });

    const valid = validations.every((e) => e.validation.valid);

    if (valid) {
      this._errors.clear();
      // todo: should we dispatch an event when valid ?

      return { valid: true };
    }

    validations.forEach((formFieldValidation) => {
      if (formFieldValidation.validation.valid) {
        this._errors.delete(formFieldValidation.fieldName);
      }
      else {
        this._errors.set(formFieldValidation.fieldName, formFieldValidation.validation.code);
      }
    });

    const formValidation = {
      valid: false,
      validation: Object.fromEntries(validations.map((v) => [v.fieldName, v.validation])),
    };

    dispatchCustomEvent(this._host, 'formInvalid', {
      form: this._name,
      validation: formValidation,
    });

    return formValidation;
  }

  /**
   * @param {string} fieldName
   * @return {boolean}
   * @throws {Error} if field is not defined
   */
  isFieldValid (fieldName) {
    return this.getFieldError(fieldName) == null;
  }

  /**
   *
   * @param {string} fieldName
   * @return {boolean}
   * @throws {Error} if field is not defined
   */
  isFieldInvalid (fieldName) {
    return !this.isFieldValid(fieldName);
  }

  /**
   * @return {boolean}
   */
  isValid () {
    return this._getFieldDefinitions().every((fieldDefinition) => this.isFieldValid(fieldDefinition.name));
  }

  submit () {
    const validation = this.validate(true);

    // todo: position of request update ? (maybe after dispatch event but before lazyFocus)
    this._host.requestUpdate();

    if (validation.valid) {
      dispatchCustomEvent(this._host, 'formSubmit', {
        form: this._name,
        data: this.getValues(),
      });
    }
    else {
      this._lazyFocus(() => this._formElement?.querySelector('[data-cc-error]')).then();
    }
  }

  /**
   * @param {string} fieldName
   * @throws {Error} if field is not defined
   */
  focus (fieldName) {
    this._assertFieldDefined(fieldName);

    // we need to wait the render to occur so that the element is not disabled anymore.
    this._lazyFocus(() => this.getFieldElement(fieldName)).then();
  }

  /**
   * @param {string} fieldName
   * @param {HTMLElement} element
   */
  registerElement (fieldName, element) {
    // todo: or maybe just warn
    this._assertFieldDefined(fieldName);

    const formElement = element.closest('form');
    if (formElement == null) {
      throw new Error(`Element for field "${fieldName}" must be inside a <form> element.`);
    }
    if (this._formElement != null && this._formElement !== formElement) {
      throw new Error(`Element for field "${fieldName}" must be inside the same <form> element as the other.`);
    }

    this._formElement = formElement;
    this._elements.set(fieldName, element);
  }

  /**
   * @param {string} fieldName
   * @return {HTMLElement}
   */
  getFieldElement (fieldName) {
    return this._elements.get(fieldName) || null;
  }

  hostUpdate () {
    this._elements.clear();
    this._formElement = null;
  }

  /* region Private methods */

  /**
   * @return {Array<FieldDefinition>}
   */
  _getFieldDefinitions () {
    return Array.from(this._fields.values());
  }

  _assertFieldDefined (fieldName) {
    if (this.getFieldDefinition(fieldName) == null) {
      throw new Error(`No definition for field "${fieldName}".`);
    }
  }

  /**
   *
   * @param {any} value
   * @param {FieldDefinition} fieldDefinition
   * @param {HTMLElement|null} element
   * @param {boolean} report
   * @return {Validation}
   */
  _validateField (value, fieldDefinition, element, report) {
    if (element != null && element.validate != null && typeof element.validate === 'function') {
      return element.validate(report);
    }

    return new RequiredValidator(fieldDefinition.required, fieldDefinition.validator).validate(value);
  }

  /**
   * @param {() => HTMLElement} elementToFocusProvider
   * @return {Promise<boolean>}
   */
  async _lazyFocus (elementToFocusProvider) {
    return this._host.updateComplete.then(() => {
      const element = elementToFocusProvider();
      if (element == null) {
        return false;
      }

      element.focus();

      return this._host.shadowRoot.activeElement === element;
    });
  }

  /* endregion */
}
