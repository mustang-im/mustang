import type { EMail } from "../../../logic/Mail/EMail";
import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
import type { EditorCommands } from "../../Shared/Editor/EditorCommands";

export interface ComposerCommands extends EditorCommands {
  mail: EMail;
  identity: MailIdentity;
  canShowFrom: boolean;
  bccLocked: boolean;
  onAddressBook: () => void;
  onSignatures: () => void;
  onCheckNames: () => Promise<void>;
}
