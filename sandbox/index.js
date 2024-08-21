import '../src/components/cc-notice/cc-notice.js';
import '../src/components/cc-toaster/cc-toaster.js';
import '../src/components/cc-toggle/cc-toggle.js';
import { addTranslations, setLanguage } from '../src/lib/i18n/i18n.js';
import { updateRootContext } from '../src/lib/smart-manager.js';
import { lang as langEn, translations as translationsEn } from '../src/translations/translations.en.js';
import { lang as langFr, translations as translationsFr } from '../src/translations/translations.fr.js';

addTranslations(langEn, translationsEn);
addTranslations(langFr, translationsFr);

const DEFAULT_LANG = langEn;
let currentLang = localStorage.getItem('cc-component-lang');
if (currentLang == null) {
  currentLang = DEFAULT_LANG;
  localStorage.setItem('cc-component-lang', currentLang);
}
setLanguage(currentLang);

const $langContainer = document.querySelector('.languages');

const languageToggle = document.createElement('cc-toggle');
languageToggle.choices = [
  {
    label: `English`,
    value: langEn,
  },
  {
    label: `Français`,
    value: langFr,
  },
];
languageToggle.legend = 'Language';
languageToggle.value = currentLang;
languageToggle.addEventListener('cc-toggle:input', ({ detail }) => {
  localStorage.setItem('cc-component-lang', detail);
  setLanguage(detail);
  window.location.reload();
});
$langContainer.appendChild(languageToggle);

updateRootContext({});

window.addEventListener('cc:notify', (event) => {
  document.querySelector('cc-toaster').show(event.detail);
});

const sandboxes = ['cc-ansi-palette', 'cc-logs', 'cc-product-card', 'cc-logs-application-view', 'forms'];

const $listContainer = document.querySelector('.sandboxes-list');
const $sandboxContainer = document.querySelector('.sandbox-container');

// list of sandboxes
const htmlList = sandboxes.map((s) => `<li><a href="?component=${s}" data-sandbox="${s}">${s}</a></li>`).join('');
$listContainer.innerHTML = `<ul>${htmlList}</ul>`;

// get component name from URL
let { component } = Object.fromEntries(new URL(document.location).searchParams.entries());

if (component == null) {
  component = sandboxes[0];
}

if (!sandboxes.includes(component)) {
  $sandboxContainer.innerHTML = '<cc-notice intent="danger" message="No sandbox found !"></cc-notice>';
} else {
  document.querySelector(`.sandboxes-list [data-sandbox="${component}"]`)?.classList.add('selected');

  import(`./${component}/${component}-sandbox.js`);

  const $component = document.createElement(`${component}-sandbox`);
  $sandboxContainer.appendChild($component);
}
