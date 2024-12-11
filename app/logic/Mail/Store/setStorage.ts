// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { MailZIP } from "./MailZIP";
import { RawFilesAttachment } from "./RawFilesAttachment";
import { SQLMailStorage } from "../SQL/SQLMailStorage";
import { SQLSearchEMail } from "../SQL/SQLSearchEMail";
import { SQLSourceEMail } from "../SQL/Source/SQLSourceEMail";
import type { SearchEMail } from "./SearchEMail";
import type { MailAccount } from "../MailAccount";

export function setStorage(acc: MailAccount) {
  if (!acc.storage) {
    acc.storage = new SQLMailStorage();
  }
  setContentStorage(acc);
}

export function setContentStorage(acc: MailAccount) {
  if (acc.contentStorage.isEmpty) {
    // First entry will be used for reading
    acc.contentStorage.add(new SQLSourceEMail());
    acc.contentStorage.add(new MailZIP());
    //acc.contentStorage.add(new MailDir());
    acc.contentStorage.add(new RawFilesAttachment());
  }
}

export function newSearchEMail(): SearchEMail {
  return new SQLSearchEMail();
}
