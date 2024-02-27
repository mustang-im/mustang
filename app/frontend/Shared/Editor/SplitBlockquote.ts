import Blockquote from '@tiptap/extension-blockquote';

/** On Enter key, the blockquote is split into 2 blockquotes, at the place where the cursor was.
 * New text appears in the middle of the 2 blockquotes. It is not part of any blockquote. */
export const SplitBlockquote = Blockquote.extend({
  // removed `name: 'split-blockquote'` because it causes `tr.split()` to name the
  // NodeType to `split-blockquote` instead of `blockquote`
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
        // if not in blockquote
        if ($cursor.node(1).type.name !== 'blockquote') {
          return;
        }
        // if at start of blockquote
        if ($cursor.before(1) + $cursor.depth === $cursor.pos) {
          return chain().insertContentAt($cursor.before(1), '<p></p>').run();
        }
        // if at end of blockquote
        if ($cursor.after(1) - $cursor.depth === $cursor.pos) {
          return chain().insertContentAt($cursor.after(1), '<p></p>').run();
        }
        // if in middle of blockquote
        tr.split($cursor.pos, $cursor.depth);
        return chain().createParagraphNear().selectNodeBackward().run();
      },
    }
  },
});
