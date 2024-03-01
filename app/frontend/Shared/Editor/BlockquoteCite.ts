import { Blockquote } from "@tiptap/extension-blockquote";

export interface BlockquoteCiteOptions {
  cite: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockquoteCite: {
      /**
       * Set the blockquote `cite` attribute
       */
      setBlockquoteCite: (cite: string) => ReturnType,
      /**
       * Unset the blockquote `cite` attribute
       */
      unsetBlockquoteCite: () => ReturnType,
    }
  }
}

/* Adds support for `cite` attribute for `blockquote` */
export const BlockquoteCite = Blockquote.extend<BlockquoteCiteOptions>({
  addAttributes() {
    return {
      cite: {
        default: null,
      }
    }
  },
  addOptions() {
    return {
      cite: null,
    }
  },
  addCommands() {
    return {
      setBlockquoteCite: (cite: string) => ({ state, commands }) => {
        let {$from} = state.selection;
        if (!$from || $from.node(-1).type.name !== this.name) {
          return false;
        }
        return commands.updateAttributes(this.name, { cite: cite });
      },
      unsetBlockquoteCite: () => ({ state, commands }) => {
        console.log(this.options.cite)
        let {$from} = state.selection;
        if (!$from || $from.node(-1).type.name !== this.name) {
          return false;
        }
        return commands.resetAttributes(this.name, 'cite');
      },
    }
  },
});