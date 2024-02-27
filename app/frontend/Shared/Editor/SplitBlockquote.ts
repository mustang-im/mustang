import Blockquote from '@tiptap/extension-blockquote';

/** On Enter key, the blockquote is split into 2 blockquotes, at the place where the cursor was.
 * New text appears in the middle of the 2 blockquotes. It is not part of any blockquote. */
export const SplitBlockquote = Blockquote.extend({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        return this.editor.commands.splitBlockquote();
      },
    }
  },
  addCommands() {
    return {
      splitBlockquote: () => ({ tr, chain, state }) => {
        let {$cursor} = state.selection;
        if ($cursor.node(1).type.name !== 'blockquote') {
          return;
        }
        if ($cursor.before(1) + $cursor.depth === $cursor.pos) {
          return chain().insertContentAt($cursor.before(1), '<p></p>').run();
        }
        if ($cursor.after(1) - $cursor.depth === $cursor.pos) {
          return chain().insertContentAt($cursor.after(1), '<p></p>').run();
        }
        tr.split($cursor.pos, $cursor.depth);
        return chain().createParagraphNear().selectNodeBackward().run();
      },
    }
  },
});
