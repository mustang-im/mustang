import { mergeAttributes, Node } from "@tiptap/core";

/* `<footer>` Node */
export const Footer = Node.create({
  name: 'footer',
  group: 'block',
  content: 'block*',
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },
  parseHTML() {
    return [
      { tag: 'footer',}
    ]
  },
  renderHTML({HTMLAttributes}) {
    return ['footer', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
});