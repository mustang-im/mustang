import { MailZIP } from "./MailZIP";
import { RawFilesAttachment } from "./RawFilesAttachment";
import { SQLStorage } from "../SQL/SQLStorage";
import { SQLSourceEMail } from "../SQL/Source/SQLSourceEMail";
import type { MailAccount } from "../MailAccount";

export function setStorage(acc: MailAccount) {
  if (!acc.storage) {
    acc.storage = new SQLStorage();
  }
  if (acc.contentStorage.isEmpty) {
    // First entry will be used for reading
    acc.contentStorage.add(new SQLSourceEMail());
    acc.contentStorage.add(new MailZIP());
    //acc.contentStorage.add(new MailDir());
    acc.contentStorage.add(new RawFilesAttachment());
  }
}
