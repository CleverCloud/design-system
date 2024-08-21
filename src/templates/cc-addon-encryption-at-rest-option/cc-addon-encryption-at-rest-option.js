import { html } from 'lit';
import { iconRemixShieldKeyholeFill as iconEncryptionAtRest } from '../../assets/cc-remix.icons.js';
import '../../components/cc-icon/cc-icon.js';
import { i18n } from '../../translations/translation.js';

export const ccAddonEncryptionAtRestOption = ({ enabled }) => {
  const description = html`
    <div class="option-details">${i18n('cc-addon-encryption-at-rest-option.description')}</div>
  `;

  return {
    title: i18n('cc-addon-encryption-at-rest-option.title'),
    icon: iconEncryptionAtRest,
    description,
    enabled,
    name: 'encryption',
  };
};
