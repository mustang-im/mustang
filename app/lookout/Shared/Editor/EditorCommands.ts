import type { ChainedCommands, Editor } from "@tiptap/core";

export enum EditorTool {
  Link = "link",
  DateTime = "date-time",
  Symbol = "symbol",
  WordCount = "word-count",
  Find = "find",
  Replace = "replace",
}

export interface EditorCommands {
  editor: Editor | null;
  onAttachFile: () => Promise<void>;
  onInsertPicture: (() => Promise<void>) | null;
  openTool: (tool: EditorTool) => void;
}

export class EditorChain {
  static run(editor: Editor, command: (chain: ChainedCommands) => ChainedCommands) {
    command(editor.chain().focus()).run();
  }
}
