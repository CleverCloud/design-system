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

    /* const validators = {
      name (value) {
        if (value == null || value.length === 0) {
          return 'empty';
        }
        return null;
      },
      email (value) {
        return validateEmailAddress(value);
      },
    }; */

    onEvent('cc-ft-uncontrolled:submit', () => {
      updateComponent('formState', (formState) => {
        formState.state = 'submitting';
      });

      api.submitForm()
        .then(() => {
          component.resetFormState();
        })
        .catch((error) => {
          // todo: error
          if (error.message === 'email-used') {
            updateComponent('formState', (formState) => {
              formState.state = 'idle';
              formState.email.error = 'already-used';
            });
            // component.focusFormItem('email');
          }
        });
    });
  },
});

// -- API calls
function getApi () {
  return {
    submitForm () {
      // return wait(500);
      return fail(500);
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