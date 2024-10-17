import { LitElement } from 'lit';
import { dispatchCustomEvent } from '../events.js';
import { isStringEmpty } from '../utils.js';
import { convertErrorMessageToString, getFormDataMap } from './form-utils.js';
import { combineValidators } from './validation.js';

/**
 * @typedef {import('./validation.types.js').ErrorMessage} ErrorMessage
 * @typedef {import('./validation.types.js').ErrorMessageMap} ErrorMessageMap
 * @typedef {import('./validation.types.js').Validator} Validator
 * @typedef {import('./validation.types.js').Validity} Validity
 * @typedef {import('../form/form.types.js').FormControlData} FormControlData
 * @typedef {import('lit').PropertyValues<CcFormControlElement>} FormControlElementPropertyValues
 */

/**
 * This is a base class that can be inherited from to make a custom element a <form> control element.
 * This is done by implementing the [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) API.
 * Inherited class must implement the `_getFormControlElement()` and `_getErrorElement` methods.
 *
 * Returns the name of the property that holds the form control value.
 */
export class CcFormControlElement extends LitElement {
  /**
   * @return {boolean}
   * @protected
   */
  static get formAssociated() {
    return true;
  }

  static get properties() {
    return {
      customErrorMessages: { type: Object, attribute: false },
      customValidator: { type: Object, attribute: false },
      errorMessage: { type: Object, attribute: 'error-message' },
      name: { type: String, reflect: true },
    };
  }

  constructor() {
    super();

    /** @type {ErrorMessageMap} Sets the mapping between error codes and error messages. */
    this.customErrorMessages = null;

    /** @type {Validator} Sets the custom validator. */
    this.customValidator = null;

    /** @type {ErrorMessage} Sets the displayed error message. */
    this.errorMessage = null;

    /** @type {string|null} The name of the form control. */
    this.name = null;

    /** @type {{message: ErrorMessage, validity: Validity}} */
    this._errorState = {
      message: null,
      validity: null,
    };

    this._internals = this.attachInternals();
  }

  /* region protected methods */

  /**
   * Returns the name of the property that holds the form control value.
   *
   * @return {string}
   * @protected
   */
  _getValuePropertyName() {
    return 'value';
  }

  /**
   * Returns the name of the property that holds the form control reset value.
   *
   * @return {string}
   * @protected
   */
  _getResetPropertyName() {
    return 'resetValue';
  }

  /**
   * Returns the inner `HTMLElement` that should get the focus and on which the native tooltip should be attached to when the native error reporting is used.
   * It will be used as the anchor when calling {@link ElementInternals#setValidity}.
   *
   * @return {HTMLElement}
   * @protected
   */
  _getFormControlElement() {
    throw new Error('You must implement _getFormControlElement() abstract method');
  }

  /**
   * Returns the inner `HTMLElement` that contains the error message.
   * This is needed when we need to convert a `Node` errorMessage into a string.
   *
   * @return {HTMLElement}
   * @protected
   */
  _getErrorElement() {
    throw new Error('You must implement _getErrorElement() abstract method');
  }

  /**
   * Returns the error messages mapping that will be used when resolving the right error message according to the error code returned by the validation process.
   *
   * @return {ErrorMessageMap}
   * @protected
   */
  _getErrorMessages() {
    return null;
  }

  /**
   * Returns the validator to use when trying to validate the form control.
   *
   * @return {Validator}
   * @protected
   */
  _getValidator() {
    return null;
  }

  /**
   * Returns the data that should be set on the `<form>` element (using {@link ElementInternals#setFormValue}).
   *
   * @return {FormControlData}
   * @protected
   */
  _getFormControlData() {
    const value = this.$getValue();

    if (value == null || typeof value === 'string' || value instanceof File || value instanceof FormData) {
      return value;
    }

    console.warn("The value to set to form data should be of type `null|File|string|FormData`. You've got ", value);

    return value.toString();
  }

  /**
   * Returns the property names that may trigger a new validation process.
   *
   * @return {Array<string>}
   * @protected
   */
  _getReactiveValidationProperties() {
    return [];
  }

  /* endregion */

  /* region public methods */

  /**
   * Performs validation.
   *
   * @return {Validity}
   */
  validate() {
    /** @type {ErrorMessageMap} */
    const errorMessages = {
      ...this._getErrorMessages(),
      ...(this.customErrorMessages ?? {}),
    };

    const validator = combineValidators([this._getValidator(), this.customValidator]);

    const validity = validator.validate(
      this.$getValue(),
      this._internals.form != null ? getFormDataMap(this._internals.form) : {},
    );

    const errorMessage = validity.valid === true ? null : this.$resolveErrorMessage(validity.code, errorMessages);

    this._errorState = {
      message: errorMessage,
      validity,
    };

    if (validity.valid) {
      this.$setValidValidity();
    } else {
      this.$setInvalidValidity(convertErrorMessageToString(errorMessage));
    }

    return validity;
  }

  /**
   * Checks if the element meets any constraint validation rules applied to it.
   * Validation problems are reported to the user by displaying an inline error message.
   * @return {boolean}
   */
  reportInlineValidity() {
    if (this.errorMessage !== this._errorState.message) {
      this.errorMessage = this._errorState.message;
      dispatchCustomEvent(this, 'error-message-change', this.errorMessage);
    }
    return this._errorState.validity.valid;
  }

  /**
   * Returns a `Validity` instance that represents the validity state of this element.
   * @return {Validity}
   */
  get inlineValidity() {
    return this._errorState.validity;
  }

  /**
   * This callback will be called when the `<form>` associated to this element is reset.
   */
  formResetCallback() {
    this.$resetValue();
    // we really need to reset the error message because, even if the form control becomes invalid after reset,
    // the form reset must also reset the error message (the inline error message should not be displayed anymore).
    this.validate();
    if (this._errorState.message != null) {
      this.errorMessage = null;
      dispatchCustomEvent(this, 'error-message-change', null);
    }
  }

  /**
   * @return {HTMLFormElement|null}
   */
  get form() {
    return this._internals.form;
  }

  /* endregion */

  /* region mimic the native validation API */

  /**
   * Returns whether the component is a candidate for constraint validation or not.
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/willValidate}
   *
   * @return {boolean}
   */
  get willValidate() {
    return this._internals.willValidate;
  }

  /**
   * Checks if the element meets any constraint validation rules applied to it.
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/checkValidity}
   *
   * @return {boolean}
   */
  checkValidity() {
    return this._internals.checkValidity();
  }

  /**
   * Checks if the element meets any constraint validation rules applied to it.
   * Validation problems are reported to the user by the browser. Error messages are displayed within tooltips by most browsers.
   * Only use this method if you want to rely on the native error message handling (tooltips instead of inline error messages).
   * If you want to display inline error message, use {@link #reportInlineValidity}
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/reportValidity}
   *
   * @return {boolean}
   */
  reportValidity() {
    return this._internals.reportValidity();
  }

  /**
   * Returns a `ValidityState` instance that represents the validity states of an element.
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/validity}
   *
   * @return {ValidityState}
   */
  get validity() {
    return this._internals.validity;
  }

  /**
   * Returns the error message that would be displayed after calling `reportInlineValidity()` or `reportValidity()`, or an empty string if no error message.
   * In case the inline messages is a `Node` instance, it returns a string representation of this node which is the {@link Node#textContent}.
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/validationMessage}
   *
   * @return {string}
   */
  get validationMessage() {
    return this._internals.validationMessage;
  }

  /**
   * Sets a custom error, so that the element would fail to validate.
   * The given message is the message to be shown to the user when reporting the problem to the user.
   * If the argument is the empty string, clears the custom error.
   * {@link https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#dom-cva-setcustomvalidity-dev}
   *
   * @param {string|null} message
   */
  setCustomValidity(message) {
    if (isStringEmpty(message)) {
      this.$setValidValidity();
    } else {
      this.$setInvalidValidity(message);
    }
  }

  /* endregion */

  /**
   * @param {FormControlElementPropertyValues} changedProperties
   */
  updated(changedProperties) {
    let shouldValidate = false;
    const errorMessageChanged = changedProperties.has('errorMessage');
    const isErrorMessageEmpty =
      this.errorMessage == null || (typeof this.errorMessage === 'string' && this.errorMessage.length === 0);

    // Sync form values with our state
    // @ts-ignore
    if (changedProperties.has(this._getValuePropertyName())) {
      this._internals.setFormValue(this._getFormControlData());
      shouldValidate = true;
    }

    // if one of the properties that should trigger a new validation have changed
    const haveReactiveValidationPropertiesChanged = this._getReactiveValidationProperties().some((prop) => {
      // @ts-ignore
      return changedProperties.has(prop);
    });
    if (haveReactiveValidationPropertiesChanged) {
      shouldValidate = true;
    }

    // if errorMessage is set to null / empty, we want the field to be revalidated based on its validators
    // we want it to be revalidated only if it's not already valid
    // if it's already valid, it means the value has changed and has already been revalidated
    if (errorMessageChanged && isErrorMessageEmpty) {
      shouldValidate = true;
    }

    if (changedProperties.has('customValidator') || changedProperties.has('customErrorMessages')) {
      shouldValidate = true;
    }

    // if errorMessage has changed and errorMessage is set (not null & not empty), we want the component validity to reflect that,
    // and we don't want to execute the classic validation
    if (errorMessageChanged && !isErrorMessageEmpty) {
      let message;
      if (typeof this.errorMessage === 'string') {
        message = this.errorMessage;
      } else {
        message = this._getErrorElement().innerText.replace('\n', ' ');
      }

      this.$setInvalidValidity(message);
      shouldValidate = false;
    }

    if (shouldValidate) {
      this.validate();
    }
  }

  /* region private methods */

  /**
   * @return {any}
   * @private
   */
  $getValue() {
    // @ts-ignore
    return this[this._getValuePropertyName()];
  }

  $resetValue() {
    // @ts-ignore
    const resetValue = this[this._getResetPropertyName()];
    if (resetValue != null) {
      // @ts-ignore
      this[this._getValuePropertyName()] = resetValue;
    }
  }

  /**
   * @param {string} code
   * @param {ErrorMessageMap} errorMessages
   * @return {ErrorMessage}
   */
  $resolveErrorMessage(code, errorMessages) {
    const errorMessage = errorMessages?.[code];
    const resolvedMessage = typeof errorMessage === 'function' ? errorMessage() : errorMessage;
    return resolvedMessage ?? code;
  }

  $setValidValidity() {
    this._internals.setValidity({});
  }

  /**
   * @param {string} message
   */
  $setInvalidValidity(message) {
    this._internals.setValidity({ customError: true }, message, this._getFormControlElement());
  }

  /* endregion */
}
