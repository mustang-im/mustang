import { Extension, wrappingInputRule } from '@tiptap/core';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';

export const ListConvention = Extension.create({
  name: 'listConvention',
  
  addExtensions() {
    const extensions = [];

    if (this.options.bulletList != false) {
      extensions.push(BulletListConvention);
    }

    // if (this.options.orderedList != false) {
    //   extensions.push(OrderedListConvention);
    // }

    return extensions;
  },
});

const TextStyleName = 'textStyle';
/**
 * Matches a bullet list to a dash or asterisk.
 */
const inputRegex = /(^\s*|\n)([-+*])\s/;

const BulletListConvention = BulletList.extend({
  addInputRules() {
    let inputRule = wrappingInputRule({
      find: inputRegex,
      type: this.type,
    })

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: inputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: () => { return this.editor.getAttributes(TextStyleName) },
        editor: this.editor,
      })
    }
    return [
      inputRule,
    ]
  },
});

const OrderedListConvention = OrderedList.extend({
  addInputRules() {
    let inputRule = wrappingInputRule({
      find: inputRegex,
      type: this.type,
    })

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: inputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: () => { return this.editor.getAttributes(TextStyleName) },
        editor: this.editor,
      })
    }
    return [
      inputRule,
    ]
  },
});