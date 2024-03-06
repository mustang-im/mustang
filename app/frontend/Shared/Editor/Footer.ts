import { mergeAttributes, Node } from "@tiptap/core";

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

  parseHTML() {
    return [
      { tag: 'footer', }
    ]
  },


  renderHTML({HTMLAttributes}) {
    return ['footer', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
});