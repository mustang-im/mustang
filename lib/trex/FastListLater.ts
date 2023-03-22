
function getHeight(el: HTMLDivElement) {
  // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
  return el.offsetHeight;

  let height = el.getBoundingClientRect().height;
  // getBoundingClientRect does not include margin
  let style = window.getComputedStyle(el);
  height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);

  for (let childNode of el.childNodes) {
    height += childNode.nodeType == 1 ? getHeight(childNode) : 0;
  }
  return height;
}

/**
 * The items that should be shown in the list.
 *
 * This is a dynamic list. As you add or remove items
 * to/from this collection, the UI will be updated.
 *
 * This is the same collection that was set in showCollection().
 * If you didn't call showCollection(), this is a default collection.
 */
export function getItems(): Collection<T> {
  return items;
}

/**
 * Adds a row to the list
 * @param obj values for one row
 */
export function addItem(obj: T) {
  items.add(obj);
}

/**
 * Adds a number of rows to the list. Each array element is one row.
 * @param array values for  rows
 */
export function addEntriesFromArray(array: T[]) {
  items.addAll(array);
}
