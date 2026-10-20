import { mergeAttributes, Node } from "@tiptap/core";
import { kOwnSignatureAttribute } from "../../../logic/Mail/Signature";

export interface FooterOptions {
  HTMLAttributes: Record<string, any>,
}

/** `<footer>` Node
 *
 * Keeps `type="signature"`, the standard marker for email signatures,
 * and the composer marker for the signature of the From identity.
 * @see logic/Mail/Signature.ts */
export const Footer = Node.create<FooterOptions>({
  name: 'footer',

  group: 'block',

  content: 'block+',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      type: {
        default: null,
        // `footer.signature` was sent by older versions of this app
        parseHTML: el => el.getAttribute("type") ??
          (el.classList.contains("signature") ? "signature" : null),
        renderHTML: attrs => attrs.type ? { type: attrs.type } : {},
      },
      ownSignature: {
        default: false,
        parseHTML: el => el.hasAttribute(kOwnSignatureAttribute),
        renderHTML: attrs => attrs.ownSignature ? { [kOwnSignatureAttribute]: "" } : {},
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'footer', }
    ]
  },


  renderHTML({HTMLAttributes}) {
    return ['footer', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
});
