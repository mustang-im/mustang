import { readZipEntry } from "./ZIP";
import { parseXML, escapeHTML, getAttrLocal, escapeAttr } from "./htmlHelper";

/** Convert OpenDocument Text .odt to basic HTML.
 * Extracts text and minimal block/inline formatting (h1..h6, p, ul/li, table, b/i/u, a, br).
 * Ignores page layout, fonts, colors, images.
 * Minimal, no dependencies, browser-only. */
export async function odtToHTML(blob: Blob): Promise<string> {
  let buffer = await blob.arrayBuffer();
  let xml = await readZipEntry(buffer, "content.xml");
  return odtBodyToHTML(parseXML(xml));
}

function odtBodyToHTML(doc: Document): string {
  let textEl = doc.getElementsByTagNameNS("*", "text")[0];
  return textEl ? odtChildrenToHTML(textEl) : "";
}

function odtChildrenToHTML(parent: Element): string {
  let html = "";
  for (let el of Array.from(parent.children)) {
    switch (el.localName) {
      case "h": {
        let n = Math.min(6, Math.max(1, parseInt(getAttrLocal(el, "outline-level") ?? "2")));
        html += `<h${n}>${odtInlineToHTML(el)}</h${n}>`;
        break;
      }
      case "p": {
        html += `<p>${odtInlineToHTML(el) || " "}</p>`;
        break;
      }
      case "list": {
        html += odtListToHTML(el);
        break;
      }
      case "table": {
        html += odtTableToHTML(el);
        break;
      }
    }
  }
  return html;
}

function odtListToHTML(list: Element): string {
  let html = "<ul>";
  for (let item of Array.from(list.children)) {
    if (item.localName != "list-item") {
      continue;
    }
    // Strip <p> wraps so text sits directly inside <li>; preserve nested lists.
    let body = odtChildrenToHTML(item).replace(/<p>/g, "").replace(/<\/p>/g, "<br>");
    body = body.replace(/<br>$/, "");
    html += `<li>${body || " "}</li>`;
  }
  return html + "</ul>";
}

function odtTableToHTML(table: Element): string {
  let html = "<table>";
  for (let row of Array.from(table.getElementsByTagNameNS("*", "table-row"))) {
    html += "<tr>";
    for (let cell of Array.from(row.getElementsByTagNameNS("*", "table-cell"))) {
      html += `<td>${odtChildrenToHTML(cell)}</td>`;
    }
    html += "</tr>";
  }
  return html + "</table>";
}

function odtInlineToHTML(parent: Element): string {
  let out = "";
  for (let node of Array.from(parent.childNodes)) {
    if (node.nodeType == 3) {
      out += escapeHTML(node.textContent ?? "");
      continue;
    }
    if (node.nodeType != 1) {
      continue;
    }
    let el = node as Element;
    switch (el.localName) {
      case "span": {
        out += odtInlineToHTML(el);
        break;
      }
      case "a": {
        let href = getAttrLocal(el, "href") ?? "";
        out += `<a href="${escapeAttr(href)}">${odtInlineToHTML(el)}</a>`;
        break;
      }
      case "line-break": {
        out += "<br>";
        break;
      }
      case "tab": {
        out += "\t";
        break;
      }
      case "s": {
        let c = parseInt(getAttrLocal(el, "c") ?? "1");
        out += " ".repeat(c);
        break;
      }
    }
  }
  return out;
}
