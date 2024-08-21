import customElementsManifest from '../../../dist/custom-elements.json';
import { setLanguage } from '../../lib/i18n/i18n.js';
import { sequence } from './sequence.js';

export function makeStory(...configs) {
  const {
    name,
    docs,
    css,
    component,
    dom,
    items: rawItems = [{}],
    simulations = [],
    argTypes,
    displayMode,
    beta,
    onUpdateComplete,
  } = Object.assign({}, ...configs);

  // In some rare conditions, we need to instanciate the items on story rendering (and each time it renders)
  const items = typeof rawItems === 'function' ? rawItems() : rawItems;

  const betaContainer = (container) => {
    if (beta) {
      import('../../components/cc-beta/cc-beta.js');
      const ccBeta = document.createElement('cc-beta');
      ccBeta.appendChild(container);
      return ccBeta;
    }
    return container;
  };

  const storyFn = (storyArgs, { globals }) => {
    setLanguage(globals.locale);

    // We create a shadow tree so we can add some custom isolated CSS for each stories
    const container = document.createElement('div');
    // We use this for i18n HMR
    container.classList.add('story-shadow-container');
    container.setAttribute('display-mode', displayMode);
    const shadow = container.attachShadow({ mode: 'open' });

    // If we have some custom CSS we add it in the shadow tree
    if (css != null) {
      const styles = document.createElement('style');
      styles.innerHTML = css;
      shadow.appendChild(styles);
    }

    // In some rare conditions, it's easier to provide the DOM directly instead of the items based on the component
    if (dom != null) {
      const wrapper = document.createElement('div');
      shadow.appendChild(wrapper);
      dom(wrapper);
      return betaContainer(container);
    }

    // Setup the components and inject args
    const components = items.map((props, i) => {
      let element = document.createElement(component);
      if (i === 0) {
        element = assignPropsToElement(element, { ...props, ...storyArgs });
      } else {
        element = assignPropsToElement(element, { ...props });
      }
      return element;
    });
    components.forEach((c, index) => {
      shadow.appendChild(c);
      if (onUpdateComplete != null) {
        c.updateComplete.then(() => {
          onUpdateComplete(c, index);
        });
      }
    });

    // Run the sequence if we have simulations
    sequence(async (wait) => {
      for (const { delay, callback } of simulations) {
        await wait(delay);
        callback(components);
      }
    });

    // Listen for events and trigger actions
    customElementsManifest.modules
      .flatMap((mod) => mod.declarations)
      .find((declaration) => declaration.tagName === component)
      ?.events?.forEach((e) => {
        const eventName = e.name;

        // actions callbacks are provided on the storyArgs object but their names differ from our events
        // our events => "cc-component:event-name"
        // the equivalent callback name => "onCcComponentEventName"
        const actionCallback = Object.entries(storyArgs).find(([eventNameCamelCase]) => {
          return normalize(eventNameCamelCase) === 'on' + normalize(eventName);
        })?.[1];

        if (actionCallback != null) {
          container.addEventListener(eventName, (e) => actionCallback(JSON.stringify(e.detail)));
        }
      });

    return betaContainer(container);
  };

  // We use the values of the first item for the args
  storyFn.args = { ...items[0] };

  storyFn.parameters = {
    docs: {
      description: {
        story: (docs ?? '').trim(),
      },
      source: {
        code: getSourceCode(component, items, dom),
      },
    },
  };

  storyFn.argTypes = argTypes;
  storyFn.docs = docs;
  storyFn.css = css;
  storyFn.component = component;
  storyFn.items = items;

  if (name != null) {
    storyFn.storyName = name;
  }

  return storyFn;
}

function normalize(text) {
  return text.toLowerCase().replace(/[-:]/g, '');
}

function getSourceCode(component, items, dom) {
  if (dom != null) {
    const container = document.createElement('div');
    dom(container);
    return container.innerHTML.replace(/<!---->/g, '').trim();
  }

  return items
    .map(({ innerHTML = '', ...props }) => {
      const attributes = Object.entries(props)
        .map(([name, value]) => {
          // We should rely on the official attribute name but for now it's good enough
          const attrName = name.replace(/[A-Z]/g, (a) => '-' + a.toLowerCase());
          if (value === true) {
            return `${attrName}`;
          }
          if (typeof value === 'string' || typeof value === 'number') {
            return `${attrName}=${JSON.stringify(String(value))}`;
          }
          if (typeof value === 'object') {
            return `${attrName}='${JSON.stringify(value)}'`;
          }
          return null;
        })
        .filter((a) => a != null);

      return `<${component}${formatAttributes(attributes)}>${innerHTML}</${component}>`;
    })
    .join('\n');
}

function formatAttributes(attributes) {
  if (attributes.length === 0) {
    return '';
  }

  const isTooLong = attributes.join(' ').length > 80;
  if (isTooLong) {
    return '\n' + attributes.map((a) => `  ${a}`).join('\n') + '\n';
  } else {
    return ' ' + attributes.join(' ');
  }
}

export function storyWait(delay, callback) {
  return { delay, callback };
}

function assignPropsToElement(element, props = {}) {
  Object.entries(props).forEach(([name, value]) => {
    if (name === 'style' || name === 'class') {
      element.setAttribute(name, value);
    }
    if (name === 'children') {
      value()
        .map((child) => {
          if (typeof child === 'string') {
            const template = document.createElement('template');
            template.innerHTML = child;
            return template.content.cloneNode(true);
          }
          return child;
        })
        .forEach((child) => {
          element.appendChild(child);
        });
    } else {
      element[name] = value;
    }
  });
  return element;
}

export function createStoryItem(storyFn, props = {}, itemIndex = 0) {
  const element = document.createElement(storyFn.component);
  assignPropsToElement(element, storyFn.items[itemIndex]);
  assignPropsToElement(element, props);
  return element;
}
