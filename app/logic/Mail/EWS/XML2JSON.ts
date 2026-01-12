import type { Json } from "../../util/util";

export function XML2JSON(aNode: Element): Json {
  if (!aNode.children.length && !aNode.attributes.length) {
    return aNode.textContent;
  }
  let result: Json = {};
  for (let { name, value } of aNode.attributes) {
    result[name] = value;
  }
  if (aNode.childNodes.length && !aNode.children.length) {
    result.Value = aNode.textContent;
  }
  for (let child of aNode.children) {
    if (result[child.localName]) {
      if (!Array.isArray(result[child.localName])) {
        result[child.localName] = [result[child.localName]];
      }
      (result[child.localName] as Json[]).push(XML2JSON(child));
    } else {
      result[child.localName] = XML2JSON(child);
    }
  }
  return result;
}

export function JSON2XML(aJSON: Json, aParent: Element, aNS: string, aTag: string): void {
  if (aJSON == null) {
    return;
  }
  if (Array.isArray(aJSON)) {
    for (let value of aJSON) {
      JSON2XML(value, aParent, aNS, aTag);
    }
    return;
  }
  let element = aParent.ownerDocument.createElementNS(aNS, aTag);
  aParent.appendChild(element);
  if (typeof aJSON != "object") {
    element.textContent = String(aJSON);
    return;
  }
  for (let key in aJSON) {
    if (key == "_TextContent_") {
      element.textContent = String(aJSON[key]);
    } else if (key.includes("$")) {
      let ns = aParent.ownerDocument.documentElement.getAttributeNS("http://www.w3.org/2000/xmlns/", key.slice(0, key.indexOf("$")));
      let tagName = key.replace("$", ":");
      JSON2XML(aJSON[key], element, ns, tagName);
    } else {
      element.setAttribute(key, String(aJSON[key]));
    }
  }
}
