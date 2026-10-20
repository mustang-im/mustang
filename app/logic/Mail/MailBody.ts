/** The HTML body of an email, for handling its signatures */
export class MailBody {
  protected readonly doc: Document;

  constructor(html: string | null) {
    this.doc = new DOMParser().parseFromString(html ?? "", "text/html");
  }

  get html(): string {
    return this.doc.head.childElementCount
      ? this.doc.documentElement.outerHTML
      : this.doc.body.innerHTML;
  }

  /** The signature of the From identity, while composing.
   * Only on the top level, so not the signatures of forwarded mails. */
  get ownSignature(): Element | null {
    return Array.from(this.doc.body.children).find(e => e.hasAttribute("data-own-signature")) ?? null;
  }

  /**
   * Replaces our signature. If there is none yet, puts it between the user's text
   * and the quote or forwarded mail, or at the end.
   * @returns false, if nothing changed
   */
  putOwnSignature(signatureHTML: string | null): boolean {
    let footerE = this.doc.createElement("footer");
    footerE.className = "signature";
    footerE.setAttribute("data-own-signature", "");
    footerE.innerHTML = signatureHTML ?? "";
    let existing = this.ownSignature;
    if (!footerE.textContent.trim() && !footerE.querySelector("img")) {
      existing?.remove();
      return !!existing;
    }
    if (existing) {
      existing.replaceWith(footerE);
      return true;
    }
    let quoteStartE = Array.from(this.doc.body.children).find(e => e.matches("blockquote, hr, .quote-header"));
    // The editor drops the class of the quote header
    let previousE = quoteStartE?.previousElementSibling;
    if (quoteStartE?.tagName == "BLOCKQUOTE" && previousE?.tagName == "P" && previousE.textContent.trim()) {
      quoteStartE = previousE;
    }
    if (quoteStartE?.previousElementSibling) {
      quoteStartE.before(footerE);
    } else {
      this.doc.body.append(footerE);
    }
    return true;
  }

  removeSignatures() {
    // Keep in sync with content.css
    for (let signatureE of this.doc.querySelectorAll("footer.signature, .moz-signature, .gmail_signature")) {
      signatureE.remove();
    }
  }

  /** Removes the marker of our signature, and adds `appendHTML` to the signature */
  prepareForSending(appendHTML: string | null) {
    let signatureE = this.ownSignature;
    for (let markedE of this.doc.querySelectorAll("[data-own-signature]")) {
      markedE.removeAttribute("data-own-signature");
    }
    if (appendHTML) {
      if (!signatureE) {
        signatureE = this.doc.createElement("footer");
        signatureE.className = "signature";
        this.doc.body.append(signatureE);
      }
      signatureE.insertAdjacentHTML("beforeend", appendHTML);
    }
  }
}
