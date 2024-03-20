import { Extension , type Range } from "@tiptap/core";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    enterNewLine: {
      /**
       * One enter inserts `<br>`, two enters creates `<p>`
       */
      enterLineBreak: () => ReturnType,
      /**
       * Split where there is a `<br>`
       */
      splitNewLine: () => ReturnType,
    }
  }
}

/** 1. On `Enter` keypress, inserts newline `<br>` instead of creating
  * new paragraph.
  * 2. On two consecutive `Enter` keypresses, it deletes the previous 
  * `<br>` and creates a new paragraph. */
export const EnterNewline = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.enterLineBreak(),
    }
  },
  addExtensions() {
    return [
      ToggleBulletList,
      ToggleOrderedList
    ]
  },
  addCommands() {
    return {
      enterLineBreak: () => ({ tr, chain }) => {
        let {$from} = tr.selection;
        // if node wrap is not `paragraph` e.g. wrapping is `list`
        if (!$from || $from.node(1).type.name !== 'paragraph') {
          return false;
        }
        // if previous node is not `<br>`
        if (!$from.nodeBefore || $from.nodeBefore.type.name !== 'hardBreak') {
          return chain().setHardBreak().scrollIntoView().run();
        }
        // default if previous node is `<br>`
        let newlineRange: Range = { 
          from: $from.pos - $from.nodeBefore.nodeSize,
          to: $from.pos
        };
        return chain().deleteRange(newlineRange).createParagraphNear().scrollIntoView().run();
      },
      splitNewLine: () => ({tr}) => {
        let {$from, $to} = tr.selection;
        let shift = 0;
        if (!$from) {
          return false;
        }
        tr.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
          let shiftPos = pos + shift;
          if (node.type.name === 'hardBreak') {
            tr.delete(shiftPos, shiftPos + node.nodeSize).split(shiftPos);
            shift++;
          }
        })
        return true;
      },
    }
  },
});

const ToggleBulletList = BulletList.extend({
  addCommands() {
    return {
      toggleBulletList: () => ({ chain }) => {
        return chain().splitNewLine().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).run();
      },
    }
  },
});

const ToggleOrderedList = OrderedList.extend({
  addCommands() {
    return {
      toggleOrderedList: () => ({ chain }) => {
        return chain().splitNewLine().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).run();
      },
    }
  },
});