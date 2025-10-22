import { Folder } from "../Folder";
import { POP3EMail } from "./POP3EMail";
import type { POP3Account } from "./POP3Account";
import type { EMailCollection } from "../Store/EMailCollection";
import type { ArrayColl } from "svelte-collections";

export class POP3Folder extends Folder {
  declare account: POP3Account;
  declare readonly messages: EMailCollection<POP3EMail>;
  declare readonly subFolders: ArrayColl<POP3Folder>;

  newEMail(): POP3EMail {
    return new POP3EMail(this);
  }
}
