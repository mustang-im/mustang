import { Extension } from "@tiptap/core";

/* 1. On `Enter` keypress, inserts newline `<br>` instead of creating
 * new paragraph.
 * 2. On two consecutive `Enter` keypresses, it deletes the previous 
 * `<br>` and creates a new paragraph.
 */
export const EnterNewline = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: ({editor}) =>  editor.commands.enterLineBreak(),
    }
  },
  addCommands() {
    return {
      enterLineBreak: () => ({ state, chain }) => {
        let {$from} = state.selection;
        // if node wrap is not `paragraph` e.g. wrapping is `list`
        if (!$from || $from.node(1).type.name !== 'paragraph') {
          return false;
        }
        // if previous node is not `<br>`
        if (!$from.nodeBefore || $from.nodeBefore.type.name !== 'hardBreak') {
          return chain().setHardBreak().scrollIntoView().run();
        }
        // default if previous node is `<br>`
        let newlineRange = { 
          from: $from.pos - $from.nodeBefore.nodeSize,
          to: $from.pos
        };
        return chain().deleteRange(newlineRange).createParagraphNear().scrollIntoView().run();
      },
    }
  },
});
