/* global globalThis */
const AUTHORIZED_TAGS = ['STRONG', 'EM', 'CODE', 'A', 'BR', 'P', 'SPAN'];

/**
 * Checks whether the given attribute on the given tag is authorized in translation.
 *
 * @param {string} attributeName - The attribute name
 * @param {string} tagName - The tag name
 * @return {boolean}
 */
function isAuthorizedAttribute(attributeName, tagName) {
  return (
    attributeName === 'title' ||
    attributeName === 'aria-label' ||
    (attributeName === 'href' && tagName === 'A') ||
    attributeName === 'lang'
  );
}

/**
 * @type {(dirtyHtml: string) => string} - Function to escape HTML (Always reuse the same text node)
 */
const escapeHtml = (() => {
  // When used in Node.js, document is not accessible, just return early
  if (globalThis.document == null) {
    return () => '';
  }

  // Idea came from lit-html.
  // Text node needs to be in a <span> (it would fail in <style> or <script>).
  const span = document.createElement('span');
  const textNode = document.createTextNode('');
  span.appendChild(textNode);

  return (dirtyHtml) => {
    textNode.data = dirtyHtml;
    return span.innerHTML;
  };
})();

/**
 * If the sibling node is a text node, get text content and remove if from the DOM.
 *
 * @param {Node|null} siblingNode
 * @return {string}
 */
function absorbTextSibling(siblingNode) {
  if (siblingNode instanceof Text) {
    siblingNode.parentNode.removeChild(siblingNode);
    return siblingNode.data;
  }
  return '';
}

/**
 * @param {TemplateStringsArray} statics
 * @param {Array<string|number>} params
 * @return {Node}
 */
export function sanitize(statics, ...params) {
  let html = '';
  for (let i = 0; i < statics.length; i++) {
    html += statics[i];
    const param = params[i];

    if (param != null) {
      if (typeof param === 'string') {
        html += escapeHtml(param);
      } else {
        html += param;
      }
    }
  }

  const template = document.createElement('template');
  template.innerHTML = html;

  Array.from(template.content.querySelectorAll('*')).forEach((node) => {
    // If tag is not authorized, transform it to a text node and merge it with previous and/or next siblings if they are text nodes
    if (!AUTHORIZED_TAGS.includes(node.tagName)) {
      const previousText = absorbTextSibling(node.previousSibling);
      const nextText = absorbTextSibling(node.nextSibling);

      const newTextNode = document.createTextNode(previousText + node.textContent + nextText);
      node.parentNode.replaceChild(newTextNode, node);

      console.warn(`Node <${node.tagName.toLowerCase()}> is not allowed in translations!`);
    } else {
      Array.from(node.attributes)
        .filter((attr) => !isAuthorizedAttribute(attr.name, node.tagName))
        .forEach((attr) => {
          console.warn(`Attribute ${attr.name} is not allowed on <${node.tagName.toLowerCase()}> in translations!`);
          return node.removeAttribute(attr.name);
        });

      // If link has href and external origin => force rel and target
      if (isLinkNodeWithHref(node)) {
        node.classList.add('sanitized-link');
        // Chrome > 120 returns an empty string for an anchor element with an absolute url like `href=/foo` when it's in a template DOM element
        // In such case, we need to test if it's an empty string to make sure absolute or relative urls are not considered external
        if (node.origin?.length > 0 && node.origin !== window.location.origin) {
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
        }
      }
    }
  });

  return template.content.cloneNode(true);
}

/**
 * Checks whether the given element is an `<a>` element with `href` attribute
 *
 * @param {Element} element
 * @return {element is Element & {origin: string}}
 */
function isLinkNodeWithHref(element) {
  return element.tagName === 'A' && element.getAttribute('href') != null;
}
