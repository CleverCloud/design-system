import { css, html, LitElement } from 'lit';
import { iconRemixInformationFill as iconInfo } from '../../assets/cc-remix.icons.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { ccLink, linkStyles } from '../../templates/cc-link/cc-link.js';
import { i18n } from '../../translations/translation.js';
import '../cc-block/cc-block.js';
import '../cc-button/cc-button.js';
import '../cc-env-var-editor-expert/cc-env-var-editor-expert.js';
import '../cc-env-var-editor-json/cc-env-var-editor-json.js';
import '../cc-env-var-editor-simple/cc-env-var-editor-simple.js';
import '../cc-expand/cc-expand.js';
import '../cc-notice/cc-notice.js';
import '../cc-toggle/cc-toggle.js';

const ENV_VAR_DOCUMENTATION = 'https://developers.clever-cloud.com/doc/reference/reference-environment-variables/';

/**
 * @typedef {import('./cc-env-var-form.types.js').EnvVarFormContextType} EnvVarFormContextType
 * @typedef {import('./cc-env-var-form.types.js').EnvVarFormState} EnvVarFormState
 * @typedef {import('./cc-env-var-form.types.js').EnvVarFormMode} EnvVarFormMode
 * @typedef {import('../common.types.js').EnvVarEditorState} EnvVarEditorState
 * @typedef {import('../common.types.js').EnvVar} EnvVar
 * @typedef {import('lit').PropertyValues<CcEnvVarForm>} CcEnvVarFormPropertyValues
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

    /** @type {EnvVarEditorState} */
    this._editorsState = { type: 'loading' };

    /** @type {EnvVar[]|null} */
    this._currentVariables = null;

    /** @type {EnvVarFormMode} */
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

  /** @returns {string|void} */
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

  /** @returns {Node|void} */
  _getDescription() {
    switch (this.context) {
      case 'env-var':
        return i18n('cc-env-var-form.description.env-var', { appName: this.appName });
      case 'exposed-config':
        return i18n('cc-env-var-form.description.exposed-config', { appName: this.appName });
      case 'config-provider':
        return i18n('cc-env-var-form.description.config-provider', { addonName: this.addonName });
    }
  }

  /** @param {CustomEvent<EnvVar[]>} event */
  _onChange({ detail: changedVariables }) {
    if (this.state.type === 'loading' || this.state.type === 'error') {
      return;
    }

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

  /** @param {CustomEvent<EnvVarFormMode>} event */
  _onToggleMode({ detail: mode }) {
    if (this.state.type === 'error' || this.state.type === 'loading') {
      return;
    }

    this._mode = mode;
    this._editorsState = {
      type: 'loaded',
      validationMode: this.state.validationMode,
      variables: this._currentVariables,
    };
  }

  /**
   * @param {Array<EnvVar>} variables
   */
  _resetForm(variables) {
    if (this.state.type === 'loading' || this.state.type === 'error') {
      return;
    }

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

  /** @param {boolean} isFormDisabled */
  _onRequestSubmit(isFormDisabled) {
    /** @param {Event} e */
    return (e) => {
      e.stopPropagation();
      if (!isFormDisabled) {
        this._onUpdateForm();
      }
    };
  }

  /** @param {CcEnvVarFormPropertyValues} changedProperties */
  willUpdate(changedProperties) {
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

    if (changedProperties.has('state') && this.state.type === 'loaded') {
      this._resetForm(this.state.variables);
    }
  }

  render() {
    const heading = this._getHeading();
    const defaultDescription = this._getDescription();

    if (this.state.type === 'error') {
      return html`
        <cc-block>
          <div slot="header-title" class="header">
            ${heading != null ? html` <div class="heading">${heading}</div> ` : ''}
          </div>
          <div slot="content-header">
            <slot class="description">${defaultDescription}</slot>
          </div>
          <div slot="content-body">
            <div class="error-container">
              <cc-notice intent="warning" message="${i18n('cc-env-var-form.error.loading')}"></cc-notice>
            </div>
          </div>
        </cc-block>
      `;
    }

    const isLoading = this.state.type === 'loading';
    const isSaving = this.state.type === 'saving';
    const isEditorDisabled = isSaving || isLoading;
    const isFormDisabled = this._currentVariables == null || this._isPristine || isEditorDisabled;

    return html`
      <cc-block>
        ${this.heading != null ? html` <div slot="header-title" class="heading">${this.heading}</div> ` : ''}

        <div slot="${this.heading != null ? 'header-right' : 'header'}" class="toggle">
          <cc-toggle
            class="mode-switcher"
            value=${this._mode}
            .choices=${this._getModes()}
            ?disabled=${isEditorDisabled}
            @cc-toggle:input=${this._onToggleMode}
          ></cc-toggle>
        </div>

        <div slot="content-header">
          <slot class="description">${this._description}</slot>
        </div>

        <div slot="content-body">
          <cc-env-var-editor-simple
            ?hidden=${this._mode !== 'SIMPLE'}
            .state=${this._editorsState}
            ?disabled=${isEditorDisabled}
            ?readonly=${this.readonly}
            @cc-env-var-editor-simple:change=${this._onChange}
            @cc-input-text:requestimplicitsubmit=${this._onRequestSubmit(isFormDisabled)}
          ></cc-env-var-editor-simple>

          <cc-env-var-editor-expert
            ?hidden=${this._mode !== 'EXPERT'}
            .state=${this._editorsState}
            ?disabled=${isEditorDisabled}
            ?readonly=${this.readonly}
            @cc-env-var-editor-expert:change=${this._onChange}
            @cc-input-text:requestimplicitsubmit=${this._onRequestSubmit(isFormDisabled)}
          ></cc-env-var-editor-expert>

          <cc-env-var-editor-json
            ?hidden=${this._mode !== 'JSON'}
            .state=${this._editorsState}
            ?disabled=${isEditorDisabled}
            ?readonly=${this.readonly}
            @cc-env-var-editor-json:change=${this._onChange}
            @cc-input-text:requestimplicitsubmit=${this._onRequestSubmit(isFormDisabled)}
          ></cc-env-var-editor-json>
        </div>

        ${!this.readonly
          ? html`
              <div slot="content-footer" class="button-bar">
                <cc-button ?disabled="${isSaving}" @cc-button:click=${() => this._resetForm(this._initVariables)}
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

                <cc-button
                  success
                  ?disabled=${isFormDisabled && !isSaving}
                  ?waiting="${isSaving}"
                  @cc-button:click=${this._onUpdateForm}
                  >${i18n('cc-env-var-form.update')}</cc-button
                >
              </div>
            `
          : ''}

        <div slot="footer-right">
          ${ccLink(
            `${ENV_VAR_DOCUMENTATION}`,
            html`<cc-icon .icon="${iconInfo}"></cc-icon>${i18n('cc-env-var-form.documentation.text')}`,
          )}
        </div>
      </cc-block>
    `;
  }

  static get styles() {
    return [
      linkStyles,
      // language=CSS
      css`
        :host {
          display: block;
        }

        .toggle {
          display: flex;
        }

        .toggle[slot='header'] {
          justify-content: center;
        }

        .description {
          color: var(--cc-color-text-weak);
          display: block;
          font-style: italic;
          line-height: 1.5;
        }

        .button-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
        }

        .spacer {
          flex: 1 1 0;
        }

        .error-container {
          padding-bottom: 0.5em;
        }

        [slot='footer-right'] .cc-link {
          align-items: center;
          display: flex;
          gap: 0.5em;
        }
      `,
    ];
  }
}

window.customElements.define('cc-env-var-form', CcEnvVarForm);
