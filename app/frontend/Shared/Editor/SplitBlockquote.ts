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
      splitBlockquote: () => ({ chain, state }) => {
        let {$from, $to} = state.selection;
        // if not in blockquote
        if ($from.node(1).type.name !== 'blockquote') {
          return false;
        }
        // if at start of blockquote
        if ($from.before(1) + $from.depth === $from.pos) {
          return chain().insertContentAt($from.before(1), '<p></p>').run();
        }
        // if at end of blockquote
        if ($to.after(1) - $to.depth === $to.pos) {
          return chain().insertContentAt($to.after(1), '<p></p>').run();
        }
        // default split in middle of blockquote
        const split = ({tr}) => {
          tr.split($to.pos, $to.depth);
          return true;
        };
        return chain().setNodeSelection($to.pos).command(split)
        .insertContentAt($to.pos + $to.depth, '<p></p>').run();
      },
    }
  },
});
