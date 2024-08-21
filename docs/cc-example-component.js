// DOCS: Don't add a 'use strict', no need for them in modern JS modules.
// DOCS: Put all imports here.
// DOCS: Always keep the ".js" at the end when you reference a file directly [error in ESLint].
// DOCS: We enforce import order [fixed by ESLint].
import { css, html, LitElement } from 'lit';

// DOCS: Import the icon(s), using an alias being recommended (better meaning, cleaner future update, shorter variable name, etc.).
import { iconCleverRam as iconRam } from '../src/assets/cc-clever.icons.js';
import { iconRemixCloudFill as iconLogo } from '../src/assets/cc-remix.icons.js';

// DOCS: You may setup/init some stuffs here but this should be rare and most of the setup should happen in the component.
const MY_AWESOME_CONST = 'foobar';

// DOCS: You may setup/init constant data used when component is in skeleton state.
const SKELETON_FOOBAR = [{ foo: '???????' }, { foo: '????' }, { foo: '???????' }];

/**
 * @typedef {import('./cc-example-component.types.js').ExampleInterface} ExampleInterface
 */

/**
 * A component doing X and Y (one liner description of your component).
 *
 * ## Details
 *
 * * Details about bla.
 * * Details about bla bla.
 * * Details about bla bla bla.
 *
 * ## Technical details
 *
 * * Technical details about foo.
 * * Technical details about bar.
 * * Technical details about baz.
 *
 * @cssdisplay block
 *
 * @prop {String} one - Description for one.
 * @prop {Boolean} two - Description for two.
 * @prop {ExampleInterface[]} three - Description for three.
 *
 * @fires {CustomEvent<ExampleInterface>} example-component:event-name - Fires XXX whenever YYY.
 *
 * @slot - The content of the button (text or HTML). If you want an image, please look at the `image` attribute.
 *
 * @cssprop {Color} --cc-loader-color - The color of the animated circle (defaults: `#2653af`).
 */
export class CcExampleComponent extends LitElement {
  // DOCS: 1. LitElement's properties descriptor

  static get properties() {
    return {
      // Simple public properties/attributes
      one: { type: String },
      two: { type: Boolean },
      three: { type: Array },
      // If the property is multiple words and thus camelCase, you can force the default linked attribute to be kebab-case like this:
      fooBarBaz: { type: String, attribute: 'foo-bar-baz' },
      // Setting `reflect: true` will automatically update the attribute value when the property is changed.
      // This way, if you use a CSS attribute selector like this `:host([enabled])`, you can have your styles react to property changes.
      enabled: { type: Boolean, reflect: true },
      // Private properties are prefixed with `_`
      // If it's described here, a change will trigger render().
      // Use state: true for private properties.
      _privateFoobar: { type: Boolean, state: true },
    };
  }

  // DOCS: 2. Constructor

  constructor() {
    super();
    // Init every property with @type and default values for a clean component and for auto generated documentation.

    /** @type {string} Description for one. */
    this.one = '';

    /** @type {boolean} Description for two. */
    this.two = false;

    /** @type {ExampleInterface|null} Description for three. */
    this.three = null;

    /** @type {string|null} Description for fooBarBaz. */
    this.fooBarBaz = null;

    /** @type {boolean} Description for enabled. */
    this.enabled = false;

    /** @type {boolean} */
    this._privateFoobar = false;
  }

  // DOCS: 3. Public methods

  // It's rare, but your component may need to expose methods.
  // Native DOM elements have methods to focus, submit form...
  // Use JSDoc to document your method.
  /**
   * Documentation of this awesome method.
   * @param {String} foo - Docs for foo.
   * @param {Boolean} bar - Docs for bar.
   */
  publicMethod(foo, bar) {
    // Do something
  }

  // DOCS: 4. Private methods

  // It's common to use private methods not to have too much code in `render()`.
  // We often use this for i18n multiple cases.
  _privateMethod() {
    // Do something
  }

  // DOCS: 5. Event handlers

  // If you listen to an event in your `render()` function,
  // use a private method to handle the event and prefix it with `_on`.
  _onSomething() {
    // Do something
  }

  // DOCS: 6. Custom element lifecycle callbacks

  // It's rare, but you may need to directly into the custom element lifecycle callbacks.
  // This is useful if you set intervals or listeners.
  connectedCallback() {
    super.connectedCallback();
    // Do something
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Do something
  }

  // DOCS: 7. LitElement lifecycle callbacks

  // If you need to hook some code when a property changes (before the render)
  // It's often needed when you have a private property that depends on a public property
  willUpdate(changeProperties) {}

  // If you need to setup some code before the first render, use this.
  // It's often needed if your component contains DOM managed by a 3rd party (chart, map...).
  firstUpdated() {
    // Do something
  }

  // If you need to hook some code when a property changes (after the render)
  // Use this one instead of update when you have a "firstUpdated"
  updated(changeProperties) {
    // Do something
  }

  // DOCS: 8. LitElement's render method

  // All UI components will need this function to describe the "HTML template".
  render() {
    // Prepare booleans and format stuffs here

    return html`
      <div>
        This is <code>cc-example-component</code>
        ${this._renderSubpart()}

        <!-- icon usage -->
        <cc-icon .icon="${iconLogo}" size="xl"></cc-icon>
        <cc-icon .icon="${iconRam}" style="--cc-icon-color: #d74d4e;"></cc-icon>
      </div>
    `;
  }

  // DOCS: 9. "sub render" private methods used by the main render()

  // If you need to isolate a part of the template, put it in a "sub render" private method.
  // This is often used in repetitions.
  // It must be prefixed with `_render`.
  _renderSubpart() {
    // Prepare booleans and format stuffs here

    return html` <div>Sub part of the template</div> `;
  }

  // DOCS: 10. LitElement's styles descriptor

  static get styles() {
    // This array may contain style imports from shared files.
    // Then you can defined your own component's styles.
    return [
      // language=CSS
      css`
        :host {
          /* You may use another display type but you need to define one. */
          display: block;
        }

        /* You may use "regions" to help code editors fold main sections of your styles. It's often needed with responsive and COMMON/BIG/SMALL regions. */

        /*region COMMON*/
        .foobar {
          color: red;
        }

        /*endregion*/

        /*region BIG*/
        .foobar.big {
          color: blue;
        }

        /*endregion*/

        /*region SMALL*/
        .foobar.small {
          color: green;
        }

        /*endregion*/
      `,
    ];
  }
}

// DOCS: 11. Define the custom element

window.customElements.define('cc-example-component', CcExampleComponent);
