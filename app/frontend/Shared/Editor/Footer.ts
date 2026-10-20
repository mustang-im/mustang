import { mergeAttributes, Node } from "@tiptap/core";
import { MailBody } from "../../../logic/Mail/MailBody";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footer: {
      /** @param html The whole body, with the changed signature. null = nothing changed */
      setContentWithSignature: (html: string | null) => ReturnType,
      focusBeforeSignature: () => ReturnType,
    }
  }
}

export interface FooterOptions {
  HTMLAttributes: Record<string, any>,
}

/** `<footer>` Node */
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
      signature: {
        default: false,
        parseHTML: el => el.classList.contains("signature"),
        renderHTML: attrs => attrs.signature ? { class: "signature" } : {},
      },
      ownSignature: {
        default: false,
        parseHTML: el => el.hasAttribute(MailBody.kOwnSignatureAttribute),
        renderHTML: attrs => attrs.ownSignature ? { [MailBody.kOwnSignatureAttribute]: "" } : {},
      },
    }
  },

  addCommands() {
    return {
      setContentWithSignature: (html: string | null) => ({ chain, tr }) => {
        if (html == null) {
          return false;
        }
        // Undo should not bring back the signature of the previous From identity
        tr.setMeta("addToHistory", false);
        let { from } = tr.selection;
        return chain().setContent(html).setTextSelection(from).run();
      },
      focusBeforeSignature: () => ({ chain, state }) => {
        let signaturePos: number | null = null;
        state.doc.forEach((node, offset) => {
          if (signaturePos == null && node.type.name == this.name && node.attrs.ownSignature) {
            signaturePos = offset;
          }
        });
        if (!signaturePos) {
          return false;
        }
        return chain().focus().setTextSelection(signaturePos - 1).run();
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