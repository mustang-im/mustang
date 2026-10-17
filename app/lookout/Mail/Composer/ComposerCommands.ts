import type { Editor } from "@tiptap/core";
import type { EMail } from "../../../logic/Mail/EMail";
import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
import type { SMLData } from "../../../logic/Mail/SML/SMLData";
import type { EditorTool } from "../../Shared/Editor/EditorTool";

export interface ComposerCommands {
  mail: EMail;
  editor: Editor | null;
  identity: MailIdentity;
  canShowFrom: boolean;
  bccLocked: boolean;
  onAddressBook: () => void;
  onAttachFile: () => Promise<void>;
  onInsertPicture: (() => Promise<void>) | null;
  openTool: (tool: EditorTool) => void;
  onSignatures: () => void;
  onCheckNames: () => Promise<void>;
  sml: SMLData | null;
  onInsertSML: (sml: SMLData) => void;
}
