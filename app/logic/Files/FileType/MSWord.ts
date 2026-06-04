import { readZipEntry } from "./ZIP";
import { parseXML, escapeHTML, getAttrLocal } from "./htmlHelper";

/** Convert Microsoft Word OOXML .docx to basic HTML.
 * Extracts text and minimal block/inline formatting (h1..h6, p, ul/li, table, b/i/u, a, br).
 * Ignores page layout, fonts, colors, images.
 * Minimal, no dependencies, browser-only. */
export async function docxToHTML(blob: Blob): Promise<string> {
  let buffer = await blob.arrayBuffer();
  let xml = await readZipEntry(buffer, "word/document.xml");
  return docxBodyToHTML(parseXML(xml));
}

function docxBodyToHTML(doc: Document): string {
  let body = doc.getElementsByTagNameNS("*", "body")[0];
  if (!body) {
    return "";
  }
  let html = "";
  let inList = false;
  for (let child of Array.from(body.children)) {
    if (child.localName == "p") {
      let isLi = !!child.getElementsByTagNameNS("*", "numPr")[0];
      if (isLi && !inList) {
        html += "<ul>";
        inList = true;
      }
      if (!isLi && inList) {
        html += "</ul>";
        inList = false;
      }
      html += docxParaToHTML(child, isLi);
    } else if (child.localName == "tbl") {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += docxTableToHTML(child);
    }
  }
  if (inList) {
    html += "</ul>";
  }
  return html;
}

function docxParaToHTML(p: Element, isLi: boolean): string {
  let pStyle = p.getElementsByTagNameNS("*", "pStyle")[0];
  let style = pStyle ? getAttrLocal(pStyle, "val") ?? "" : "";
  let tag = isLi ? "li" : headingTag(style) ?? "p";
  let inner = docxRunsToHTML(p);
  if (!inner.trim()) {
    inner = " ";
  }
  return `<${tag}>${inner}</${tag}>`;
}

function headingTag(style: string): string | null {
  // Word saves heading styles as "Heading1", "Heading 1", "heading 2", ...
  let m = /^heading\s*([1-6])$/i.exec(style);
  return m ? "h" + m[1] : null;
}

function docxRunsToHTML(parent: Element): string {
  let out = "";
  for (let node of Array.from(parent.childNodes)) {
    if (node.nodeType != 1) {
      continue;
    }
    let el = node as Element;
    if (el.localName == "r") {
      out += docxRunToHTML(el);
    } else if (el.localName == "hyperlink") {
      out += `<a>${docxRunsToHTML(el)}</a>`;
    } else if (el.localName == "ins" || el.localName == "smartTag") {
      out += docxRunsToHTML(el);
    }
  }
  return out;
}

function docxRunToHTML(r: Element): string {
  let text = "";
  for (let node of Array.from(r.childNodes)) {
    if (node.nodeType != 1) {
      continue;
    }
    let el = node as Element;
    if (el.localName == "t") {
      text += escapeHTML(el.textContent ?? "");
    } else if (el.localName == "tab") {
      text += "\t";
    } else if (el.localName == "br") {
      text += "<br>";
    }
  }
  let rPr = r.getElementsByTagNameNS("*", "rPr")[0];
  let b = !!rPr?.getElementsByTagNameNS("*", "b")[0];
  let i = !!rPr?.getElementsByTagNameNS("*", "i")[0];
  let u = !!rPr?.getElementsByTagNameNS("*", "u")[0];
  if (b) {
    text = `<b>${text}</b>`;
  }
  if (i) {
    text = `<i>${text}</i>`;
  }
  if (u) {
    text = `<u>${text}</u>`;
  }
  return text;
}

function docxTableToHTML(tbl: Element): string {
  let html = "<table>";
  for (let tr of Array.from(tbl.getElementsByTagNameNS("*", "tr"))) {
    html += "<tr>";
    for (let tc of Array.from(tr.getElementsByTagNameNS("*", "tc"))) {
      let cellHTML = "";
      for (let p of Array.from(tc.getElementsByTagNameNS("*", "p"))) {
        cellHTML += docxRunsToHTML(p) + "<br>";
      }
      html += `<td>${cellHTML}</td>`;
    }
    html += "</tr>";
  }
  return html + "</table>";
}
