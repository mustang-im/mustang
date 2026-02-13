// #if [!WEBMAIL]
import { MailZIP } from "./MailZIP";
import { RawFilesAttachment } from "./RawFilesAttachment";
import { SQLMailStorage } from "../SQL/SQLMailStorage";
import { SQLSearchEMail } from "../SQL/SQLSearchEMail";
import { SQLSourceEMail } from "../SQL/Source/SQLSourceEMail";
// #else
import { DummyMailStorage } from "../Store/DummyMailStorage";
// #endif
import type { EMail } from "../EMail";
import { SearchEMail } from "./SearchEMail";
import type { MailAccount } from "../MailAccount";

export function setStorage(acc: MailAccount) {
  if (!acc.storage) {
    // #if [!WEBMAIL]
    acc.storage = new SQLMailStorage();
    // #else
    acc.storage = new DummyMailStorage();
    // #endif
  }
  setContentStorage(acc);
}

export function setContentStorage(acc: MailAccount) {
  // #if [!WEBMAIL]
  if (acc.contentStorage.isEmpty) {
    // First entry will be used for reading
    acc.contentStorage.add(new SQLSourceEMail());
    //acc.contentStorage.add(new MailZIP());
    //acc.contentStorage.add(new MailDir());
    acc.contentStorage.add(new RawFilesAttachment());
  }
  // #endif
}

export function newSearchEMail(): SearchEMail {
  // #if [!WEBMAIL]
  return new SQLSearchEMail();
  // #else
  return new SearchEMail(); // TODO server-side search
  // #endif
}

export async function findMessageByID(msgid: string): Promise<EMail | undefined> {
  let search = newSearchEMail();
  search.messageID = msgid;
  let results = await search.startSearch();
  if (results.isEmpty) {
    return undefined;
  }
  return results.first;
}
