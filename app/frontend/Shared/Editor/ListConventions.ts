import { Extension, NodePos, wrappingInputRule } from '@tiptap/core';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletListConvention: {
      /**
       * Toggle a bullet list
       */
      toggleBulletListExt: () => ReturnType,
    }
  }
}

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

const ListItemName = 'listItem'
const TextStyleName = 'textStyle';
/**
 * Matches a bullet list to a dash or asterisk.
 */
const inputRegex = /(^\s*|\n)([-+*])\s/;

const BulletListConvention = BulletList.extend({
  addCommands() {
    return {
      toggleBulletListExt: () => ({ tr, editor, commands, chain }) => {
        let { $from } = tr.selection;
        console.log(tr.selection);
        let nodePos = new NodePos($from, editor);
        console.log(nodePos);
        let newLinePos = nodePos.parent.querySelectorAll('hardBreak');
        console.log(newLinePos);
        for (let pos of newLinePos) {
          chain().deleteRange({ from: pos.from, to: pos.to }).splitBlock().run();
        }
        if (this.options.keepAttributes) {
          return chain().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ListItemName, this.editor.getAttributes(TextStyleName)).run();
        }
        return commands.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks);
      },
    }
  },

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