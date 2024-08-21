import { addTranslations, setLanguage } from '../src/lib/i18n/i18n.js';
import { updateRootContext } from '../src/lib/smart-manager.js';
import { lang, translations } from '../src/translations/translations.en.js';
import '../src/components/cc-toaster/cc-toaster.js';

addTranslations(lang, translations);
setLanguage(lang);

updateRootContext({});

window.addEventListener('cc:notify', (event) => {
  document.querySelector('cc-toaster').show(event.detail);
});

const { definition, ...componentProperties } = Object.fromEntries(new URL(document.location).searchParams.entries());
const componentName = definition.split('.').shift();

import(`../src/components/${componentName}/${definition}.js`);

const $container = document.querySelector('cc-smart-container');

const $component = document.createElement(componentName);
Object.assign($component, componentProperties);
$container.appendChild($component);

const $contextButtons = document.querySelector('.context-buttons');
$contextButtons.addEventListener('click', (e) => {
  const button = e.target;
  if (!button.matches('button')) {
    return;
  }
  $container.context = JSON.parse(button.dataset.context);
});
