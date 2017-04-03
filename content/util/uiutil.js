
/**
 * Shortcut for document.getElementById()
 */
function E(id) {
  return document.getElementById(id);
}

/**
 * createElement()
 * @param parentNode {DOMElement} where to add the new element. May be null.
 * @param tagname {String} <tagname>
 * @param classname {String} class="classname"
 * @param attributes {Array of String}
 */
function cE(parentNode, tagname, classname, attributes) {
  var el = document.createElement(tagname);
  if (classname) {
    el.classList.add(classname);
  }
  for (var name in attributes) {
    el.setAttribute(name, attributes[name]);
  }
  if (parentNode) {
    parentNode.appendChild(el);
  }
  return el;
}

/**
 * createTextNode()
 */
function cTN(text) {
  return document.createTextNode(text);
}

/**
 * Like parentElement.insertBefore(newElement, insertBefore), just insert
 * after some other element.
 *
 * @param parentElement {node} Insert |newElement| as child of |parentElement|.
 * @param newElement {node} new node that you want to insert
 * @param insertAfterInfo {String or DOMElement}  Element or ID of the node
 *     that should be before (left to) |newElement|.
 *     This must be a child of |parentElement|.
 *     If it does not exist, the |newElement| is added to the end.
 * @returns {node} the node that was inserted
 */
function insertAfter(parentElement, newElement, insertAfterInfo) {
  var afterEl = null;
  if (insertAfterInfo) {
    if (typeof(insertAfterInfo) == "string") {
      afterEl = parentElement.ownerDocument.getElementById(insertAfterInfo);
    } else if (insertAfterInfo.ownerDocument) {
      afterEl = insertAfterInfo;
    } else {
      throw new NotReached("insertAfterInfo has the wrong type");
    }
    if (afterEl.parentNode != parentElement) {
      throw new NotReached("insertAfterInfo has the wrong parent element");
    }
  }
  if (afterEl && afterEl.nextSibling) {
    parentElement.insertBefore(newElement, afterEl.nextSibling);
  } else {
    parentElement.appendChild(newElement);
  }
  return newElement;
}

/**
 * Turns a DOM |NodeList| into a JS array that you can |.forEach| on
 * - convenience
 * - makes a copy, which is needed when you remove the elements
 */
function nodeListToArray(nodeList)
{
  var result = [];
  for (var i = 0, l = nodeList.length; i < l; i++) {
    result.push(nodeList.item(i));
  }
  return result;
}

function cleanElement(el)
{
  while (el.hasChildNodes()) {
    el.removeChild(el.firstChild);
  }
}

function removeElement(el)
{
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}


/**
 * Helper function that handles detecting the return key in a
 * web page and calls the appropriate function
 */
function hookupReturnKey(element, onReturnKeypressCallback) {
  element.addEventListener("keyup", function(event) {
    if (event.keyCode == 13) {
      onReturnKeypressCallback(event);
    }
  }, false);
}


function assert(test, errorMsg) {
  if (!test) {
    throw new Error(errorMsg);
  }
}
