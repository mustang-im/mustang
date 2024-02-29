import { Blockquote } from "@tiptap/extension-blockquote";

/* Adds support for `cite` attribute for `blockquote` */
export const BlockquoteCite = Blockquote.extend({
  addAttributes() {
    return {
      cite: {
        default: null,
      }
    }
  },
});