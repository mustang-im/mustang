/** The HTML body of an email, for handling its signatures */
export class MailBody {
  /** Keep in sync with content.css */
  static readonly kSignatureSelector = "footer.signature, .moz-signature, .gmail_signature";
  /** Only while composing, to tell our signature apart from those of forwarded mails */
  static readonly kOwnSignatureAttribute = "data-own-signature";
  protected readonly doc: Document;

  constructor(html: string | null) {
    this.doc = new DOMParser().parseFromString(html ?? "", "text/html");
  }

  get html(): string {
    return this.doc.head.childElementCount
      ? this.doc.documentElement.outerHTML
      : this.doc.body.innerHTML;
  }

  get ownSignature(): Element | null {
    return this.topLevel.find(e => e.hasAttribute(MailBody.kOwnSignatureAttribute)) ?? null;
  }

  protected get topLevel(): Element[] {
    return Array.from(this.doc.body.children);
  }

  /**
   * Replaces our signature. If there is none yet, adds it between the user's text
   * and the quote or forwarded mail, or at the end.
   * @param forEditing Puts an empty line before a signature at the end, for the user to type in
   * @returns false, if nothing changed
   */
  putOwnSignature(signatureHTML: string | null, forEditing = true): boolean {
    let footerE = this.doc.createElement("footer");
    footerE.className = "signature";
    footerE.setAttribute(MailBody.kOwnSignatureAttribute, "");
    footerE.innerHTML = signatureHTML ?? "";
    this.removeSeparatorLine(footerE);
    let existing = this.ownSignature;
    if (!footerE.textContent.trim() && !footerE.querySelector("img, hr")) {
      existing?.remove();
      return !!existing;
    }
    if (existing?.isEqualNode(footerE)) {
      return false;
    }
    if (existing) {
      existing.replaceWith(footerE);
    } else {
      this.insertSignature(footerE, forEditing);
    }
    return true;
  }

  protected insertSignature(footerE: Element, forEditing: boolean) {
    let quoteStartE = this.topLevel.find(e => e.matches("blockquote, hr, .quote-header, .forward-header"));
    // The editor drops the class of the quote header
    if (quoteStartE?.tagName == "BLOCKQUOTE") {
      let previous = quoteStartE.previousElementSibling;
      if (previous?.tagName == "P" && previous.textContent.trim()) {
        quoteStartE = previous;
      }
    }
    if (quoteStartE?.previousElementSibling) {
      quoteStartE.before(footerE);
      return;
    }
    let last = this.doc.body.lastElementChild;
    let endsWithEmptyLine = last?.tagName == "P" && !last.textContent.trim() && !last.querySelector("img");
    if (forEditing && !endsWithEmptyLine) {
      this.doc.body.append(this.doc.createElement("p"));
    }
    this.doc.body.append(footerE);
  }

  /** The plaintext version already starts the signature with `-- ` */
  protected removeSeparatorLine(signatureE: Element) {
    let firstNode = (parent: Node) => Array.from(parent.childNodes)
      .find(node => node.nodeType != Node.TEXT_NODE || node.textContent.trim());
    let first = firstNode(signatureE);
    if (first?.nodeName == "P" || first?.nodeName == "DIV") {
      if (first.textContent.trim() == "--") {
        first.remove();
        return;
      }
      first = firstNode(first);
    }
    if (first?.nodeType == Node.TEXT_NODE && first.textContent.trim() == "--" &&
        first.nextSibling?.nodeName == "BR") {
      first.nextSibling.remove();
      first.remove();
    }
  }

  removeSignatures() {
    for (let signatureE of this.doc.querySelectorAll(MailBody.kSignatureSelector)) {
      signatureE.remove();
    }
  }

  /**
   * Removes the marker of our signature, and adds `appendHTML` to our signature,
   * or as a signature of its own.
   */
  prepareForSending(appendHTML: string | null) {
    if (appendHTML && !this.signatureEndsWith(appendHTML)) {
      let signatureE = this.ownSignature;
      if (!signatureE) {
        signatureE = this.doc.createElement("footer");
        signatureE.className = "signature";
        this.doc.body.append(signatureE);
      }
      signatureE.insertAdjacentHTML("beforeend", appendHTML);
    }
    for (let markedE of this.doc.querySelectorAll(`[${MailBody.kOwnSignatureAttribute}]`)) {
      markedE.removeAttribute(MailBody.kOwnSignatureAttribute);
    }
  }

  /** E.g. when sending again after an error */
  protected signatureEndsWith(html: string): boolean {
    let normalize = (text: string | null) => (text ?? "").replace(/\s+/g, " ").trim();
    let appendE = this.doc.createElement("div");
    appendE.innerHTML = html;
    let text = normalize(appendE.textContent);
    return this.topLevel.some(e => e.matches(MailBody.kSignatureSelector) &&
      normalize(e.lastElementChild?.textContent) == text);
  }
}
