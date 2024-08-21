import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';
import '../cc-button/cc-button.js';
import '../cc-env-var-editor-expert/cc-env-var-editor-expert.js';
import '../cc-env-var-editor-json/cc-env-var-editor-json.js';
import '../cc-env-var-editor-simple/cc-env-var-editor-simple.js';
import '../cc-expand/cc-expand.js';
import '../cc-loader/cc-loader.js';
import '../cc-notice/cc-notice.js';
import '../cc-toggle/cc-toggle.js';

/**
 * @typedef {import('./cc-env-var-form.types.js').EnvVarFormContextType} EnvVarFormContextType
 * @typedef {import('./cc-env-var-form.types.js').EnvVarFormState} EnvVarFormState
 * @typedef {import('../common.types.js').EnvVar} EnvVar
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
 * @fires {CustomEvent} cc-env-var-form:restart-app - Fires whenever the restart app button is clicked.
 * @fires {CustomEvent<EnvVar[]>} cc-env-var-form:submit - Fires the new list of variables whenever the submit button is clicked.
 *
 * @slot - Sets custom HTML description.
 */
export class CcEnvVarForm extends LitElement {
  static get properties() {
    return {
      addonName: { type: String, attribute: 'addon-name' },
      appName: { type: String, attribute: 'app-name' },
      context: { type: String, reflect: true },
      heading: { type: String, reflect: true },
      readonly: { type: Boolean, reflect: true },
      restartApp: { type: Boolean, attribute: 'restart-app' },
      state: { type: Object },
      _editorsState: { type: Object, state: true },
      _mode: { type: String, state: true },
      _isPristine: { type: Boolean, state: true },
    };
  }

  constructor() {
    super();

    /** @type {string} Defines add-on name used in some heading/description (depending on context). */
    this.addonName = '?';

    /** @type {string} Defines application name used in some heading/description (depending on context). */
    this.appName = '?';

    /** @type {EnvVarFormContextType} Defines where the form will be used, so it can display the appropriate heading and description. */
    this.context = null;

    /** @type {string|null} Sets a text to be used as a header title. */
    this.heading = null;

    /** @type {boolean} Sets `readonly` attribute input and hides buttons. */
    this.readonly = false;

    /** @type {boolean} Displays the restart app button. */
    this.restartApp = false;

    /** @type {EnvVarFormState} Sets variables form state. */
    this.state = { type: 'loading' };

    this._editorsState = { type: 'loading' };

    /** @type {EnvVar[]|null} */
    this._currentVariables = null;

    /** @type {'SIMPLE'|'EXPERT'|'JSON'} */
    this._mode = 'SIMPLE';

    /** @type {boolean} */
    this._isPristine = true;
  }

  _getModes() {
    return [
      { label: i18n('cc-env-var-form.mode.simple'), value: 'SIMPLE' },
      { label: i18n('cc-env-var-form.mode.expert'), value: 'EXPERT' },
      { label: 'JSON', value: 'JSON' },
    ];
  }

  _getHeading() {
    if (this.heading != null) {
      return this.heading;
    }

    if (this.context === 'env-var') {
      return i18n('cc-env-var-form.heading.env-var');
    }
    if (this.context === 'env-var-simple') {
      return i18n('cc-env-var-form.heading.env-var');
    }
    if (this.context === 'env-var-addon') {
      return i18n('cc-env-var-form.heading.env-var');
    }
    if (this.context === 'exposed-config') {
      return i18n('cc-env-var-form.heading.exposed-config');
    }
    if (this.context === 'config-provider') {
      return i18n('cc-env-var-form.heading.config-provider');
    }
  }

  _getDescription() {
    if (this.context === 'env-var') {
      return i18n('cc-env-var-form.description.env-var', { appName: this.appName });
    }
    if (this.context === 'exposed-config') {
      return i18n('cc-env-var-form.description.exposed-config', { appName: this.appName });
    }
    if (this.context === 'config-provider') {
      return i18n('cc-env-var-form.description.config-provider', { addonName: this.addonName });
    }
  }

  _onChange({ detail: changedVariables }) {
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
        return { ...changedVar, isEdited };
      });

    const allVariables = [...deletedVariables, ...newVariables, ...otherVariables];

    this._isPristine = !allVariables.some(({ isDeleted, isNew, isEdited }) => isDeleted || isNew || isEdited);

    this._currentVariables = allVariables.sort((a, b) => a.name.localeCompare(b.name));

    // In simple mode we always want to keep the variables sorted
    if (this._mode === 'SIMPLE') {
      this._editorsState = {
        type: 'loaded',
        validationMode: this.state.validationMode,
        variables: this._currentVariables,
      };
    }
  }

  _onToggleMode({ detail: mode }) {
    this._mode = mode;
    this._editorsState = {
      type: 'loaded',
      validationMode: this.state.validationMode,
      variables: this._currentVariables,
    };
  }

  /**
   * @type {Array<EnvVar>} variables
   */
  _resetForm(variables) {
    this._initVariables = variables;
    this._isPristine = true;
    if (variables == null) {
      this._currentVariables = null;
      this._editorsState = { type: 'loaded', validationMode: this.state.validationMode, variables: [] };
    } else {
      const sortedVariables = [...variables].sort((a, b) => a.name.localeCompare(b.name));
      this._currentVariables = sortedVariables;
      this._editorsState = { type: 'loaded', validationMode: this.state.validationMode, variables: sortedVariables };
    }
  }

  _onUpdateForm() {
    const cleanVariables = this._currentVariables
      .filter(({ isDeleted }) => !isDeleted)
      .map(({ name, value }) => ({ name, value }));
    dispatchCustomEvent(this, 'submit', cleanVariables);
  }

  _onRequestSubmit(e, isFormDisabled) {
    e.stopPropagation();
    if (!isFormDisabled) {
      this._onUpdateForm();
    }
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('context') && this.context === 'env-var-addon') {
      this.readonly = true;
    }

    if (changedProperties.has('state') && this.state.type === 'loaded') {
      this._resetForm(this.state.variables);
    }
  }

  render() {
    const heading = this._getHeading();
    const defaultDescription = this._getDescription();

    if (this.state.type === 'error') {
      return html`
        <div class="header">${heading != null ? html` <div class="heading">${heading}</div> ` : ''}</div>
        <slot class="description">${defaultDescription}</slot>
        <div class="overlay-container">
          <div class="error-container">
            <cc-notice intent="warning" message="${i18n('cc-env-var-form.error.loading')}"></cc-notice>
          </div>
        </div>
      `;
    }

    const isLoading = this.state.type === 'loading';
    const isSaving = this.state.type === 'saving';
    const isEditorDisabled = isSaving || isLoading;
    const isFormDisabled = this._currentVariables == null || this._isPristine || isEditorDisabled;
    const hasOverlay = isSaving;

    return html`
      <div class="header">
        ${heading != null ? html` <div class="heading">${heading}</div> ` : ''}

        <cc-toggle
          class="mode-switcher ${classMap({ 'has-overlay': hasOverlay })}"
          value=${this._mode}
          .choices=${this._getModes()}
          ?disabled=${isEditorDisabled}
          @cc-toggle:input=${this._onToggleMode}
        ></cc-toggle>
      </div>

      <slot class="description">${defaultDescription}</slot>

      <div class="overlay-container">
        <cc-expand class=${classMap({ 'has-overlay': hasOverlay })}>
          <cc-env-var-editor-simple
            ?hidden=${this._mode !== 'SIMPLE'}
            .state=${this._editorsState}
            ?disabled=${isEditorDisabled}
            ?readonly=${this.readonly}
            @cc-env-var-editor-simple:change=${this._onChange}
            @cc-input-text:requestimplicitsubmit=${(e) => this._onRequestSubmit(e, isFormDisabled)}
          ></cc-env-var-editor-simple>

          <cc-env-var-editor-expert
            ?hidden=${this._mode !== 'EXPERT'}
            .state=${this._editorsState}
            ?disabled=${isEditorDisabled}
            ?readonly=${this.readonly}
            @cc-env-var-editor-expert:change=${this._onChange}
            @cc-input-text:requestimplicitsubmit=${(e) => this._onRequestSubmit(e, isFormDisabled)}
          ></cc-env-var-editor-expert>

          <cc-env-var-editor-json
            ?hidden=${this._mode !== 'JSON'}
            .state=${this._editorsState}
            ?disabled=${isEditorDisabled}
            ?readonly=${this.readonly}
            @cc-env-var-editor-json:change=${this._onChange}
            @cc-input-text:requestimplicitsubmit=${(e) => this._onRequestSubmit(e, isFormDisabled)}
          ></cc-env-var-editor-json>
        </cc-expand>

        ${isSaving ? html` <cc-loader class="saving-loader"></cc-loader> ` : ''}
      </div>

      ${!this.readonly
        ? html`
            <div class="button-bar">
              <cc-button @cc-button:click=${() => this._resetForm(this._initVariables)}
                >${i18n('cc-env-var-form.reset')}</cc-button
              >

              <div class="spacer"></div>

              ${this.restartApp
                ? html`
                    <cc-button @cc-button:click=${() => dispatchCustomEvent(this, 'restart-app')}
                      >${i18n('cc-env-var-form.restart-app')}</cc-button
                    >
                  `
                : ''}

              <cc-button success ?disabled=${isFormDisabled} @cc-button:click=${this._onUpdateForm}
                >${i18n('cc-env-var-form.update')}</cc-button
              >
            </div>
          `
        : ''}
    `;
  }

  static get styles() {
    return [
      linkStyles,
      // language=CSS
      css`
        :host {
          background-color: var(--cc-color-bg-default, #fff);
          border: 1px solid var(--cc-color-border-neutral, #aaa);
          border-radius: var(--cc-border-radius-default, 0.25em);
          display: block;
          padding: 0.5em 1em;
        }

        .header {
          align-items: flex-start;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          justify-content: center;
          margin-block: 0.5em;
        }

        .heading {
          color: var(--cc-color-text-primary-strongest);
          flex: 1 1 0;
          font-size: 1.2em;
          font-weight: bold;
        }

        .description {
          color: var(--cc-color-text-weak);
          display: block;
          font-style: italic;
          line-height: 1.5;
          margin-bottom: 0.5em;
        }

        .has-overlay {
          --cc-skeleton-state: paused;

          filter: blur(0.3em);
        }

        .overlay-container {
          position: relative;
        }

        cc-expand {
          /* We need to spread so the focus rings can be visible even with cc-expand default overflow:hidden */
          /* It also allows cc-env-var-create to span through the whole width of the cc-block in simple mode */
          margin-inline: -1em;
          padding: 0.5em 1em;
        }

        .saving-loader {
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }

        .button-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
          margin-bottom: 0.5em;
          margin-top: 1em;
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
