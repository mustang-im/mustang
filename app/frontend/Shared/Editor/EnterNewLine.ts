import { Extension, type Extensions, type Range } from "@tiptap/core";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Heading } from "@tiptap/extension-heading";

export interface EnterNewlineOptions {
  toggleHeading: boolean,
  toggleBulletList: boolean,
  toggleOrderedList: boolean,
}

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
export const EnterNewline = Extension.create<EnterNewlineOptions>({
  addOptions() {
    return {
      toggleHeading: true,
      toggleBulletList: true,
      toggleOrderedList: true,
    }
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => editor.commands.enterLineBreak(),
    }
  },
  addExtensions() {
    let extensions: Extensions = [];

    if (this.options.toggleHeading) {
      extensions.push(ToggleHeading);
    }
    if (this.options.toggleBulletList) {
      extensions.push(ToggleBulletList);
    }
    if (this.options.toggleOrderedList) {
      extensions.push(ToggleOrderedList);
    }
    return extensions;
  },
  addCommands() {
    return {
      enterLineBreak: () => ({ tr, chain }) => {
        let { $from } = tr.selection;
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
      splitNewLine: () => ({ tr, commands }) => {
        let { $from, $to } = tr.selection;
        if (!$from) {
          return false;
        }
        /*
          Deletes the first <br> before and after the selection.
          Splits it at the deleted <br>.
          Isolates the selected lines from the rest of the text.
        */
        if ($from.pos !== $from.start() || $to.pos !== $to.end()) {

          // Delete and split first <br> before selection
          let breakBefore = -1;
          tr.doc.nodesBetween($from.start(), $from.pos, (node, pos) => {
            if (node.type.name === 'hardBreak') breakBefore = pos
          })
          if (breakBefore > -1) {
            tr.delete(breakBefore, breakBefore + 1);
            tr.split(tr.mapping.map(breakBefore));
          }

          // Delete and split first <br> after selection
          let breakAfter = -1;
          tr.doc.nodesBetween($to.pos, $to.end(), (node, pos) => {
            if (breakAfter > -1) return false
            if (node.type.name === 'hardBreak') breakAfter = pos
          })
          if (breakAfter > -1) {
            tr.delete(breakAfter, breakAfter + 1);
            tr.split(tr.mapping.map(breakAfter));
          }
        }

        // Deletes and splits at all <br> within the selection
        let shift = 0;
        tr.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
          let shiftPos = pos + shift;
          if (node.type.name === 'hardBreak') {
            tr.delete(shiftPos, shiftPos + node.nodeSize).split(shiftPos);
            shift++;
          }
        });

        // Unselects the last `<br>` to avoid toggling the next line
        if ($to.nodeAfter && $to.nodeAfter.type.name === 'hardBreak') {
          commands.setTextSelection({ from: $from.pos + 1, to: $to.pos + shift + 1 });
        }
        return true;
      },
    }
  },
});

const ToggleHeading = Heading.extend({
  addCommands() {
    return {
      toggleHeading: (attributes) => ({ chain }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false
        }

        return chain().splitNewLine().toggleNode(this.name, 'paragraph', attributes).run();
      },
    }
  },
});

const ToggleBulletList = BulletList.extend({
  addCommands() {
    return {
      toggleBulletList: () => ({ chain }) => {
        /* Uncomment if using textStyle
          if (this.options.keepAttributes) {
            return chain().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ListItem.name, this.editor.getAttributes(TextStyle.name)).run()
          }
        */
        return chain().splitNewLine().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).run();
      },
    }
  },
});

const ToggleOrderedList = OrderedList.extend({
  addCommands() {
    return {
      toggleOrderedList: () => ({ chain }) => {
        /* Uncomment if using textStyle
          if (this.options.keepAttributes) {
            return chain().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ListItem.name, this.editor.getAttributes(TextStyle.name)).run()
          }
        */
        return chain().splitNewLine().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).run();
      },
    }
  },
});