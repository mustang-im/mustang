import { Link } from "@tiptap/extension-link";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    linkShortcut: {
      /**
       * Insert link
       */
      insertLink: () => ReturnType,
    }
  }
}

export const LinkShortcut = Link.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-k': ({ editor }) => {
        return editor.chain().focus().insertLink().run();
      },
    }
  },
  addCommands() {
    return {
      insertLink: () => ({ tr, dispatch, chain }) => {
        let { $from, $to } = tr.selection;
        let selectedText = tr.doc.textBetween($from.pos, $to.pos);
        if (!dispatch || !$from) {
          return false;
        }
        return chain().insertContent(`[${selectedText}](url)`)
        .setTextSelection({ from: $to.pos + 3, to: $to.pos + 6 }).run();
      }
    }
  },
});