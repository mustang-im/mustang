import type { FileSharingAccount } from "../FileSharingAccount";
import { SearchFile } from "./SearchFile";
// #if [!WEBMAIL]
// #else
import { DummyFileStorage } from "./DummyFileStorage";
// #endif

export function setStorage(acc: FileSharingAccount) {
  if (!acc.storage) {
    // #if [!WEBMAIL]
    acc.storage = new DummyFileStorage(); // TODO
    //acc.storage = new SQLFileStorage();
    // #else
    acc.storage = new DummyFileStorage();
    // #endif
  }
}

export function newSearchFile(): SearchFile {
  // #if [!WEBMAIL]
  return new SearchFile(); // TODO
  //return new SQLSearchFile();
  // #else
  return new SearchFile(); // TODO server-side search
  // #endif
}
