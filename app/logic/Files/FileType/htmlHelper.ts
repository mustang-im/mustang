
export function parseXML(text: string): Document {
  let doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) {
    throw new Error("Malformed XML");
  }
  return doc;
}

export function getAttrLocal(el: Element, localName: string): string | null {
  for (let i = 0; i < el.attributes.length; i++) {
    if (el.attributes[i].localName == localName) return el.attributes[i].value;
  }
  return null;
}

export function escapeHTML(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttr(s: string): string {
  return escapeHTML(s).replace(/"/g, "&quot;");
}
