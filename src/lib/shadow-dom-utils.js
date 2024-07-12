/**
 * Finds the active element (the element currently focused). It handles the case where the focused element is
 * inside a custom element.
 *
 * @param {Document | ShadowRoot} root
 * @return {null | Element}
 */
export function findActiveElement(root = document) {
  const activeElement = root.activeElement;

  if (activeElement == null) {
    return null;
  }

  if (activeElement.shadowRoot != null) {
    return findActiveElement(activeElement.shadowRoot);
  } else {
    return activeElement;
  }
}

/**
 * Check whether the given parent node is an ancestor of the given child node. It traverses custom elements shadow DOM.
 *
 * @param {Node} parent
 * @param {Node} child
 * @return {boolean}
 */
export function isParentOf(parent, child) {
  if (parent == null || child == null) {
    return false;
  }

  let currentElement = child;

  while (currentElement != null) {
    currentElement = currentElement instanceof ShadowRoot ? currentElement.host : currentElement.parentNode;

    if (currentElement === parent) {
      return true;
    }
  }

  return false;
}

/**
 * Same as document.elementsFromPoint() but with the capability to traverse shadow DOM.
 *
 * @param {number} x
 * @param {number} y
 * @param {DocumentOrShadowRoot} [root=document]
 * @return {Array<Element>}
 */
export function elementsFromPoint(x, y, root = document) {
  let elements = root.elementsFromPoint(x, y);
  if (elements.length === 0) {
    return [];
  }

  let shadow = elements[0].shadowRoot;
  while (shadow != null) {
    const items = shadow.elementsFromPoint(x, y);
    if (items.length === 0) {
      shadow = null;
    } else if (elements.includes(items[0])) {
      shadow = null;
    } else {
      elements = [...items, elements];
      shadow = items[0].shadowRoot;
    }
  }
  return elements;
}
