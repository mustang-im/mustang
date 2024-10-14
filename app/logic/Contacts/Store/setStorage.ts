import type { Addressbook } from "../Addressbook";
import { SQLStorage } from "../SQL/SQLStorage";

export function setStorage(acc: Addressbook) {
  if (!acc.storage) {
    acc.storage = new SQLStorage();
  }
}