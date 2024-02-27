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
      splitBlockquote: () => ({ tr, commands, chain, state }) => {
        let {$from, $to} = state.selection;
        // if not in blockquote
        if ($from.node(1).type.name !== 'blockquote') {
          return;
        }
        commands.deleteSelection();
        // if at start of blockquote
        if ($from.before(1) + $from.depth === $from.pos) {
          return commands.insertContentAt($from.before(1), '<p></p>');
        }
        // if at end of blockquote
        if ($to.after(1) - $to.depth === $to.pos) {
          let deletedRange = $to.pos - $from.pos;
          return commands.insertContentAt($to.after(1) - deletedRange, '<p></p>');
        }
        // if in middle of blockquote
        tr.split($from.pos, $from.depth);
        return chain().createParagraphNear().selectNodeBackward().run();
      },
    }
  },
});
