// #if [WEBMAIL]
import { DummyMailStorage } from "../Store/DummyMailStorage";
// #else
import { MailZIP } from "./MailZIP";
import { RawFilesAttachment } from "./RawFilesAttachment";
import { SQLMailStorage } from "../SQL/SQLMailStorage";
import { SQLSearchEMail } from "../SQL/SQLSearchEMail";
import { SQLSourceEMail } from "../SQL/Source/SQLSourceEMail";
// #endif
import { SearchEMail } from "./SearchEMail";
import type { MailAccount } from "../MailAccount";
import { isWebMail } from "../../build";

export function setStorage(acc: MailAccount) {
  if (!acc.storage) {
    // #if [WEBMAIL]
    acc.storage = new DummyMailStorage();
    // #else
    acc.storage = new SQLMailStorage();
    // #endif
  }
  setContentStorage(acc);
}

export function setContentStorage(acc: MailAccount) {
  // #if [WEBMAIL]
  // #else
  if (acc.contentStorage.isEmpty) {
    // First entry will be used for reading
    acc.contentStorage.add(new SQLSourceEMail());
    acc.contentStorage.add(new MailZIP());
    //acc.contentStorage.add(new MailDir());
    acc.contentStorage.add(new RawFilesAttachment());
  }
  // #endif
}

export function newSearchEMail(): SearchEMail {
  // #if [WEBMAIL]
  if (isWebMail) {
    return new SearchEMail(); // TODO server-side search
  }
  // #else
  return new SQLSearchEMail();
  // #endif
}
