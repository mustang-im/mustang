import { Folder, SpecialFolder } from "../Folder";
import { EWSEMail } from "./EWSEMail";
import type { EWSAccount } from "./EWSAccount";

export class EWSFolder extends Folder {
  account: EWSAccount;

  newEMail(): EWSEMail {
    return new EWSEMail(this);
  }

  fromXML(xmljs: any) {
    this.id = xmljs.FolderId.Id;
    this.name = xmljs.DisplayName;
    this.countTotal = Number(xmljs.TotalCount);
    this.countUnread = Number(xmljs.UnreadCount);
    switch (xmljs.DistinguishedFolderId) {
    case "inbox":
      this.specialFolder = SpecialFolder.Inbox;
      break;
    case "drafts":
      this.specialFolder = SpecialFolder.Drafts;
      break;
    case "sentitems":
      this.specialFolder = SpecialFolder.Sent;
      break;
    case "junkemail":
      this.specialFolder = SpecialFolder.Spam;
      break;
    case "deleteditems":
      this.specialFolder = SpecialFolder.Trash;
      break;
    //case "outbox":
    }
  }
}
