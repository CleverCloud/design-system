import '../cc-button/cc-button.js';
import '../cc-expand/cc-expand.js';
import '../cc-loader/cc-loader.js';
import '../cc-toggle/cc-toggle.js';
import '../cc-notice/cc-notice.js';
import '../cc-env-var-editor-expert/cc-env-var-editor-expert.js';
import '../cc-env-var-editor-json/cc-env-var-editor-json.js';
import '../cc-env-var-editor-simple/cc-env-var-editor-simple.js';
import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';

/**
 * @typedef {import('./cc-env-var-form.types.js').ContextType} ContextType
 * @typedef {import('../common.types.js').ParserOptions} ParserOptions
 * @typedef {import('../common.types.js').Variable} Variable
 */

/**
 * A high level environment variable form (wrapping simple editor and expert editor into one interface).
 *
 * ## Details
 *
 * * You can set a custom `heading` and description with the default <slot>.
 * * You can also set a context to get the appropriate heading and description (with translations).
 *
 * @cssdisplay block
 *
 * @event {CustomEvent} cc-env-var-form:restart-app - Fires whenever the restart app button is clicked.
 * @event {CustomEvent<Variable[]>} cc-env-var-form:submit - Fires the new list of variables whenever the submit button is clicked.
 *
 * @slot - Sets custom HTML description.
 */
export class CcEnvVarForm extends LitElement {

  static get properties () {
    return {
      addonName: { type: String, attribute: 'addon-name' },
      appName: { type: String, attribute: 'app-name' },
      context: { type: String, reflect: true },
      error: { type: Boolean, reflect: true },
      heading: { type: String, reflect: true },
      parserOptions: { type: Object, attribute: 'parser-options' },
      readonly: { type: Boolean, reflect: true },
      restartApp: { type: Boolean, attribute: 'restart-app' },
      saving: { type: Boolean, reflect: true },
      variables: { type: Array },
      _currentVariables: { type: Array, state: true },
      _description: { type: String, state: true },
      _expertVariables: { type: Array, state: true },
      _jsonVariables: { type: Array, state: true },
      _mode: { type: String, state: true },
      _isPristine: { type: Boolean, state: true },
    };
  }

  constructor () {
    super();

    /** @type {string} Defines add-on name used in some heading/description (depending on context). */
    this.addonName = '?';

    /** @type {string} Defines application name used in some heading/description (depending on context). */
    this.appName = '?';

    /** @type {ContextType} Defines where the form will be used so it can display the appropriate heading and description. */
    this.context = null;

    /** @type {boolean} Whether to displays a loading error message. */
    this.error = false;

    /** @type {string|null} Sets a text to be used as a header title. */
    this.heading = null;

    /** @type {ParserOptions} Sets the options for the variables parser. */
    this.parserOptions = { mode: null };

    /** @type {boolean} Sets `readonly` attribute input and hides buttons. */
    this.readonly = false;

    /** @type {boolean} Displays the restart app button. */
    this.restartApp = false;

    /** @type {boolean} Enables saving state (form is disabled and loader is displayed). */
    this.saving = false;

    // this.variables is let to null by default (this triggers skeleton screen)
    /** @type {Variable[]|null} Sets the list of variables. */
    this.variables = null;

    /** @type {Variable[]|null} */
    this._currentVariables = null;

    /** @type {string} */
    this._description = '';

    /** @type {Variable[]|null} */
    this._expertVariables = null;

    /** @type {string} */
    this._mode = 'SIMPLE';

    /** @type {boolean} */
    this._isPristine = true;
  }

  _getModes () {
    return [
      { label: i18n('cc-env-var-form.mode.simple'), value: 'SIMPLE' },
      { label: i18n('cc-env-var-form.mode.expert'), value: 'EXPERT' },
      { label: 'JSON', value: 'JSON' },
    ];
  }

  _onChange ({ detail: changedVariables }) {

    const deletedVariables = this._initVariables
      .filter((initVar) => {
        const changedVar = changedVariables.find((v) => v.name === initVar.name);
        return (changedVar == null || changedVar.isDeleted) && !initVar.isNew;
      })
      .map((v) => ({ ...v, isDeleted: true }));

    const newVariables = changedVariables
      .filter((changedVar) => {
        const initVar = this._initVariables.find((v) => v.name === changedVar.name);
        return initVar == null;
      })
      .map((v) => ({ ...v, isNew: true }));

    const otherVariables = changedVariables
      .filter((changedVar) => {
        const isDeleted = deletedVariables.find((v) => v.name === changedVar.name);
        const isNew = newVariables.find((v) => v.name === changedVar.name);
        return !isDeleted && !isNew;
      })
      .map((changedVar) => {
        const initVar = this._initVariables.find((v) => v.name === changedVar.name);
        const isEdited = initVar.value !== changedVar.value;
        return ({ ...changedVar, isEdited });
      });

    const allVariables = [...deletedVariables, ...newVariables, ...otherVariables];

    this._isPristine = !allVariables
      .some(({ isDeleted, isNew, isEdited }) => isDeleted || isNew || isEdited);

    this._currentVariables = allVariables.sort((a, b) => a.name.localeCompare(b.name));
  }

  _onToggleMode ({ detail: mode }) {
    if (mode === 'EXPERT') {
      this._expertVariables = this._currentVariables;
    }
    else if (mode === 'JSON') {
      // clone to force an update/reset of the json form
      this._jsonVariables = this._currentVariables != null ? [...this._currentVariables] : null;
    }
    this._mode = mode;
  }

  _resetForm (variables) {
    this._initVariables = variables;
    this._isPristine = true;
    if (variables == null) {
      this._currentVariables = null;
      this._expertVariables = null;
      this._jsonVariables = null;
    }
    else {
      // WARN: Array.prototype.sort edits in place
      const sortedVariables = [...variables].sort((a, b) => a.name.localeCompare(b.name));
      this._currentVariables = sortedVariables;
      this._expertVariables = sortedVariables;
      this._jsonVariables = sortedVariables;
    }
  }

  _onUpdateForm () {
    const cleanVariables = this._currentVariables
      .filter(({ isDeleted }) => !isDeleted)
      .map(({ name, value }) => ({ name, value }));
    dispatchCustomEvent(this, 'submit', cleanVariables);
  }

  _onRequestSubmit (e, isFormDisabled) {
    e.stopPropagation();
    if (!isFormDisabled) {
      this._onUpdateForm();
    }
  }

  willUpdate (changedProperties) {

    if (changedProperties.has('context') || changedProperties.has('addonName') || changedProperties.has('appName')) {
      if (this.context === 'env-var') {
        this.heading = i18n('cc-env-var-form.heading.env-var');
        this._description = i18n('cc-env-var-form.description.env-var', { appName: this.appName });
      }
      if (this.context === 'env-var-simple') {
        this.heading = i18n('cc-env-var-form.heading.env-var');
      }
      if (this.context === 'env-var-addon') {
        this.heading = i18n('cc-env-var-form.heading.env-var');
        this.readonly = true;
      }
      if (this.context === 'exposed-config') {
        this.heading = i18n('cc-env-var-form.heading.exposed-config');
        this._description = i18n('cc-env-var-form.description.exposed-config', { appName: this.appName });
      }
      if (this.context === 'config-provider') {
        this.heading = i18n('cc-env-var-form.heading.config-provider');
        this._description = i18n('cc-env-var-form.description.config-provider', { addonName: this.addonName });
      }
    }

    if (changedProperties.has('variables')) {
      this._resetForm(this.variables);
    }
  }

  render () {

    const isEditorDisabled = (this.saving || this.error);
    const isFormDisabled = (this._currentVariables == null || this._isPristine || isEditorDisabled);
    const hasOverlay = this.saving || this.error;

    return html`
      <div class="header">

        ${this.heading != null ? html`
          <div class="heading">${this.heading}</div>
        ` : ''}

        ${!this.error ? html`
          <cc-toggle
            class="mode-switcher ${classMap({ 'has-overlay': hasOverlay })}"
            value=${this._mode}
            .choices=${this._getModes()}
            ?disabled=${isEditorDisabled}
            @cc-toggle:input=${this._onToggleMode}
          ></cc-toggle>
        ` : ''}
      </div>

      <slot class="description">${this._description}</slot>

      <div class="overlay-container">

        ${!this.error ? html`
          <cc-expand class=${classMap({ 'has-overlay': hasOverlay })}>
            <cc-env-var-editor-simple
              mode=${this.parserOptions.mode ?? ''}
              ?hidden=${this._mode !== 'SIMPLE'}
              .variables=${this._currentVariables}
              ?disabled=${isEditorDisabled}
              ?readonly=${this.readonly}
              @cc-env-var-editor-simple:change=${this._onChange}
              @cc-input-text:requestimplicitsubmit=${(e) => this._onRequestSubmit(e, isFormDisabled)}
            ></cc-env-var-editor-simple>

            <cc-env-var-editor-expert
              ?hidden=${this._mode !== 'EXPERT'}
              .parserOptions=${this.parserOptions}
              .variables=${this._expertVariables}
              ?disabled=${isEditorDisabled}
              ?readonly=${this.readonly}
              @cc-env-var-editor-expert:change=${this._onChange}
              @cc-input-text:requestimplicitsubmit=${(e) => this._onRequestSubmit(e, isFormDisabled)}
            ></cc-env-var-editor-expert>

            <cc-env-var-editor-json
              ?hidden=${this._mode !== 'JSON'}
              .parserOptions=${this.parserOptions}
              .variables=${this._jsonVariables}
              ?disabled=${isEditorDisabled}
              ?readonly=${this.readonly}
              @cc-env-var-editor-json:change=${this._onChange}
              @cc-input-text:requestimplicitsubmit=${(e) => this._onRequestSubmit(e, isFormDisabled)}
            ></cc-env-var-editor-json>
          </cc-expand>
        ` : ''}

        ${this.error ? html`
          <div class="error-container">
            <cc-notice intent="warning" message="${i18n('cc-env-var-form.error.loading')}"></cc-notice>
          </div>
        ` : ''}

        ${this.saving ? html`
          <cc-loader class="saving-loader"></cc-loader>
        ` : ''}
      </div>

      ${!this.readonly && !this.error ? html`
        <div class="button-bar">

          <cc-button @cc-button:click=${() => this._resetForm(this._initVariables)}>${i18n('cc-env-var-form.reset')}</cc-button>

          <div class="spacer"></div>

          ${this.restartApp ? html`
            <cc-button @cc-button:click=${() => dispatchCustomEvent(this, 'restart-app')}>${i18n('cc-env-var-form.restart-app')}</cc-button>
          ` : ''}

          <cc-button success ?disabled=${isFormDisabled} @cc-button:click=${this._onUpdateForm}>${i18n('cc-env-var-form.update')}</cc-button>
        </div>
      ` : ''}
    `;
  }

  static get styles () {
    return [
      linkStyles,
      // language=CSS
      css`
        :host {
          display: block;
          padding: 0.5em 1em;
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          background-color: var(--cc-color-bg-default, #fff);
          border-radius: var(--cc-border-radius-default, 0.25em);
        }

        .header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: center;
          gap: 0.5em;
          margin-block: 0.5em;
        }

        .heading {
          flex: 1 1 0;
          color: var(--cc-color-text-primary-strongest);
          font-size: 1.2em;
          font-weight: bold;
        }

        .description {
          display: block;
          margin-bottom: 0.5em;
          color: var(--cc-color-text-weak);
          font-style: italic;
          line-height: 1.5;
        }

        .has-overlay {
          --cc-skeleton-state: paused;

          filter: blur(0.3em);
        }

        .overlay-container {
          position: relative;
        }

        cc-expand {
          padding: 0.5em 1em;
          /* We need to spread so the focus rings can be visible even with cc-expand default overflow:hidden */
          /* It also allows cc-env-var-create to span through the whole width of the cc-block in simple mode */
          margin-inline: -1em;
        }

        .saving-loader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .button-bar {
          display: flex;
          flex-wrap: wrap;
          margin-top: 1em;
          margin-bottom: 0.5em;
          gap: 1em;
        }

        .spacer {
          flex: 1 1 0;
        }
        
        .error-container {
          padding-bottom: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-env-var-form', CcEnvVarForm);
