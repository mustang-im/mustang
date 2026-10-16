import type { EMail } from "../../../logic/Mail/EMail";
import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
import type { ChainedCommands, Editor } from "@tiptap/core";

export interface ComposerCommands {
  mail: EMail;
  editor: Editor | null;
  identity: MailIdentity;
  canShowFrom: boolean;
  bccLocked: boolean;
  onAddressBook: () => void;
  onAttachFile: () => Promise<void>;
  onInsertPicture: () => Promise<void>;
  onInsertLink: () => void;
  onSignatures: () => void;
  onCheckNames: () => Promise<void>;
  onDateTime: () => void;
  onMoreSymbols: () => void;
  onWordCount: () => void;
  onFind: (replace: boolean) => void;
}

export class EditorChain {
  static run(editor: Editor, command: (chain: ChainedCommands) => ChainedCommands) {
    command(editor.chain().focus()).run();
  }
}
