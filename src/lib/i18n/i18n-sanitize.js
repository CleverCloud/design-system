/* global globalThis */
const AUTHORIZED_TAGS = ['STRONG', 'EM', 'CODE', 'A', 'BR', 'P', 'SPAN'];

function isAuthorizedAttribute(attributeName, tagName) {
  return (
    attributeName === 'title' ||
    attributeName === 'aria-label' ||
    (attributeName === 'href' && tagName === 'A') ||
    attributeName === 'lang'
  );
}

// Reuse one text node to escape HTML
const escapeHtml = (() => {
  // When used in node and document is not accessible, just return early
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

// If sibling is text, get text content and remove if from the DOM
function absorbTextSibling(sibling) {
  if (sibling?.nodeType === document.TEXT_NODE) {
    sibling.parentNode.removeChild(sibling);
    return sibling.data;
  }
  return '';
}

export function sanitize(statics, ...params) {
  let html = '';
  for (let i = 0; i < statics.length; i++) {
    html += statics[i];
    if (params[i] != null) {
      html += escapeHtml(params[i]);
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
      if (node.tagName === 'A' && node.getAttribute('href') != null) {
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
