import { defineSmartComponent } from '../../lib/define-smart-component.js';
import '../cc-smart-container/cc-smart-container.js';
import './cc-ft-uncontrolled.js';

defineSmartComponent({
  selector: 'cc-ft-uncontrolled',
  params: {
    fake: { type: String },
  },
  onContextUpdate ({ component, context, onEvent, updateComponent, signal }) {
    const api = getApi();
    const formController = component.formController;

    onEvent('cc-ft-uncontrolled:formSubmit', ({ data }) => {
      formController.setState('submitting');

      api.submitForm(data)
        .then(() => {
          formController.reset();
        })
        .catch((error) => {
          if (error.message === 'email-used') {
            formController.setState('idle');
            formController.setFieldError('email', 'used');
          }
        });
    });
  },
});

// -- API calls
function getApi () {
  return {
    submitForm ({ name, email }) {
      if (email.startsWith('used')) {
        return fail(500);
      }
      return wait(500);
    },
  };
}

function wait (ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function fail (ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('email-used'));
    }, ms);
  });
}
