import Blockquote from '@tiptap/extension-blockquote';

export const SplitBlockquote = Blockquote.extend({
  name: 'split-blockquote',
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
        let {$cursor} = state.selection;
        let parent = this.editor.$pos($cursor.before()).node;
        // if not in blockquote
        if (parent.type.name != 'blockquote') {
          return;
        }
        // if at start of blockquote
        if ($cursor.parentOffset == 0) {
          return chain().createParagraphNear().selectNodeBackward().run();
        }
        // if at end of blockquote
        if ($cursor.parentOffset == $cursor.parent.content.size) {
          return chain().createParagraphNear().splitListItem('blockquote').run();
        }
        // if in middle of blockquote
        return chain().splitListItem('blockquote').selectNodeBackward().liftEmptyBlock().run();
      },
    }
  },
});