/**
 * Email signatures in the mail body.
 *
 * We mark signatures with the standard markers:
 * - HTML: `<footer type="signature">`
 * - Plaintext: A line `-- ` before the signature, RFC 3676 section 4.3.
 *   @see convertHTMLToText() and convertMailTextToHTML()
 *
 * While composing, the signature of the From identity additionally has
 * the attribute `data-own-signature`. That allows to swap it when the user
 * changes the From identity, without touching the signatures of
 * forwarded or quoted mails. `signatureForSending()` removes that attribute.
 */

/** Signature markers which we recognize when displaying and quoting mails.
 * - `footer[type="signature"]`: The standard marker, which we send
 * - `footer.signature`: Sent by older versions of this app
 * - `.moz-signature`: Thunderbird
 * Keep in sync with `content.css` */
export const kSignatureSelector = `footer[type="signature"], footer.signature, .moz-signature`;

/** Marks the signature of the From identity in the composer */
export const kOwnSignatureAttribute = "data-own-signature";

/** User setting: When replying, remove the signatures from the quoted mail. Default on. */
export const kStripSignaturesSetting = "mail.send.quote.stripSignatures";

/** The line before a plaintext signature. With trailing space. */
export const kPlaintextSignatureSeparator = "-- ";

/** How the composer handles the signature of the From identity */
export enum ComposeSignature {
  /** Leave the body alone, e.g. for received mails, drafts and redirects.
   * Only an existing own signature is swapped when the From identity changes. */
  Keep = "keep",
  /** Add the signature of the From identity, as soon as the composer opens
   * the mail, or at the latest when sending. For new mails, replies and forwards. */
  Add = "add",
  /** The signature has been added. It's swapped when the From identity changes. */
  Added = "added",
}

/**
 * Puts `signatureHTML` into `html` as our own signature,
 * replacing any own signature that is already in there.
 *
 * Where to put it, if there was no own signature yet:
 * - Reply above the quote, or forward: Between the user's text and the quote
 * - Reply below the quote, or new mail: At the end
 *
 * @param signatureHTML of the From identity, without markers. null = Just remove the own signature.
 * @param forEditing When the signature goes at the end, put an empty line before it,
 *   for the user to type in.
 * @returns the new body. Exactly `html`, if nothing changed.
 */
export function putOwnSignature(html: string, signatureHTML: string | null, forEditing = true): string {
  let doc = parseHTML(html);
  let hasSignature = hasContent(signatureHTML);
  let existing = ownSignatures(doc);
  if (!existing.length && !hasSignature) {
    return html;
  }

  let footerE: HTMLElement | null = null;
  if (hasSignature) {
    footerE = doc.createElement("footer");
    footerE.setAttribute("type", "signature");
    footerE.setAttribute(kOwnSignatureAttribute, "");
    footerE.innerHTML = signatureHTML;
    removeSeparatorLine(footerE);
  }

  if (existing.length) {
    // Same place as before
    if (footerE) {
      existing[0].replaceWith(footerE);
      existing.shift();
    }
    for (let old of existing) {
      old.remove();
    }
  } else {
    insertSignature(doc, footerE, forEditing);
  }
  return serialize(doc);
}

/** Whether the body contains the own signature of the composer */
export function hasOwnSignature(html: string): boolean {
  return ownSignatures(parseHTML(html)).length > 0;
}

/**
 * Removes all signatures, e.g. from the original mail when quoting it in a reply.
 * @returns the new body. Exactly `html`, if there were no signatures.
 */
export function removeSignatures(html: string): string {
  let doc = parseHTML(html);
  let signatures = doc.querySelectorAll(kSignatureSelector);
  if (!signatures.length) {
    return html;
  }
  for (let signature of signatures) {
    signature.remove();
  }
  return serialize(doc);
}

/** Removes the composer-only marker `data-own-signature`, e.g. from a mail that we forward.
 * @returns the new body. Exactly `html`, if nothing changed. */
export function removeOwnSignatureMarkers(html: string): string {
  let doc = parseHTML(html);
  let marked = doc.querySelectorAll(`[${kOwnSignatureAttribute}]`);
  if (!marked.length) {
    return html;
  }
  for (let e of marked) {
    e.removeAttribute(kOwnSignatureAttribute);
  }
  return serialize(doc);
}

/**
 * Prepares the signature of the body for the recipients:
 * Removes the composer-only marker, and optionally adds a line to the signature.
 *
 * @param appendHTML e.g. "Sent by …". Goes at the end of the own signature,
 *   or into a new signature at the end of the body, if there is no own signature.
 *   Not added again, if the signature already ends with it, e.g. when sending again after an error.
 * @returns the new body. Exactly `html`, if nothing changed.
 */
export function signatureForSending(html: string, appendHTML: string | null = null): string {
  let doc = parseHTML(html);
  let changed = false;
  if (appendHTML) {
    let appendE = doc.createElement("div");
    appendE.innerHTML = appendHTML;
    let appendText = normalizeText(appendE.textContent);
    let alreadyThere = topLevelSignatures(doc).some(signatureE =>
      normalizeText(signatureE.lastElementChild?.textContent) == appendText);
    if (!alreadyThere) {
      // Not into other signatures, e.g. of a forwarded mail
      let signatureE = ownSignatures(doc)[0];
      if (!signatureE) {
        signatureE = doc.createElement("footer");
        signatureE.setAttribute("type", "signature");
        doc.body.append(signatureE);
      }
      signatureE.append(...appendE.childNodes);
      changed = true;
    }
  }
  for (let e of doc.querySelectorAll(`[${kOwnSignatureAttribute}]`)) {
    e.removeAttribute(kOwnSignatureAttribute);
    changed = true;
  }
  return changed ? serialize(doc) : html;
}

/** Whether a signature from the identity settings has any visible content */
export function hasContent(signatureHTML: string | null): boolean {
  if (!signatureHTML?.trim()) {
    return false;
  }
  let doc = parseHTML(signatureHTML);
  return !!doc.body.textContent?.trim() || !!doc.body.querySelector("img, hr");
}

/**
 * Splits a plaintext mail body at the signature separator line `-- `.
 * Only if the signature is at the end, i.e. no quote follows it,
 * because then we can't tell where the signature ends.
 * @returns null, if there's no such signature
 */
export function splitPlaintextSignature(text: string): { body: string, signature: string } | null {
  let lines = text.split(/\r?\n/);
  let separatorPos = lines.lastIndexOf(kPlaintextSignatureSeparator);
  if (separatorPos < 0) {
    return null;
  }
  let signatureLines = lines.slice(separatorPos + 1);
  if (signatureLines.some(line => line.startsWith(">"))) {
    return null;
  }
  return {
    body: lines.slice(0, separatorPos).join("\n"),
    signature: signatureLines.join("\n"),
  };
}

/** Users often start their signature with `-- ` themselves.
 * We already mark the signature, so the plaintext would have it twice. */
function removeSeparatorLine(signatureE: HTMLElement) {
  const kText = 3; // Node.TEXT_NODE
  let isSeparator = (node: ChildNode | null) => node?.nodeType == kText && node.textContent.trim() == "--";
  let firstNonEmpty = (parent: ParentNode) => Array.from(parent.childNodes)
    .find(node => node.nodeType != kText || node.textContent.trim()) ?? null;

  let first = firstNonEmpty(signatureE);
  if (first?.nodeType != kText && ["P", "DIV"].includes(first?.nodeName) && first.textContent.trim() == "--") {
    first.remove(); // <p>-- </p><p>Fred</p>
    return;
  }
  let container: ParentNode = signatureE;
  if (["P", "DIV"].includes(first?.nodeName)) {
    container = first as HTMLElement; // <p>-- <br>Fred</p>
    first = firstNonEmpty(container);
  }
  if (isSeparator(first) && first.nextSibling?.nodeName == "BR") {
    first.nextSibling.remove();
    first.remove(); // -- <br>Fred
  }
}

function ownSignatures(doc: Document): HTMLElement[] {
  // Only on the top level. Quotes and forwarded mails may contain other signatures.
  return Array.from(doc.body.children)
    .filter(e => e.hasAttribute(kOwnSignatureAttribute)) as HTMLElement[];
}

function topLevelSignatures(doc: Document): HTMLElement[] {
  return Array.from(doc.body.children)
    .filter(e => e.matches(kSignatureSelector)) as HTMLElement[];
}

/** Elements that start the quote of a reply, or the forwarded mail. Top-level only. */
const kQuoteStartSelector = `blockquote, hr, .quote-header, .forward-header`;

function insertSignature(doc: Document, footerE: HTMLElement, forEditing: boolean) {
  let body = doc.body;
  let quoteStartE = Array.from(body.children).find(e => e.matches(kQuoteStartSelector)) ?? null;
  // The editor drops the `class` of the attribution line `X wrote:`. Keep it with its quote.
  if (quoteStartE?.tagName == "BLOCKQUOTE") {
    let previous = quoteStartE.previousElementSibling;
    if (previous?.tagName == "P" && previous.textContent?.trim()) {
      quoteStartE = previous;
    }
  }
  if (quoteStartE?.previousElementSibling) {
    // The user writes above the quote
    body.insertBefore(footerE, quoteStartE);
  } else {
    // The user writes below the quote, or there is no quote
    if (forEditing) {
      appendEmptyLine(doc);
    }
    body.append(footerE);
  }
}

/** Makes sure that the body ends with an empty paragraph, as space for the user to type */
function appendEmptyLine(doc: Document) {
  let last = doc.body.lastElementChild;
  if (last?.tagName == "P" && !last.textContent?.trim() && !last.querySelector("img")) {
    return;
  }
  doc.body.append(doc.createElement("p"));
}

function normalizeText(text: string | null): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function parseHTML(html: string | null): Document {
  return new DOMParser().parseFromString(html ?? "", "text/html");
}

/** Keeps a whole document as such, e.g. with `<style>` in the `<head>`.
 * Returns a snippet for snippet input, e.g. from the editor. */
function serialize(doc: Document): string {
  return doc.head.childElementCount
    ? doc.documentElement.outerHTML
    : doc.body.innerHTML;
}
