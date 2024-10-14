import type { Addressbook } from "../Addressbook";
import { SQLAddressbook } from "../SQL/SQLAddressbook";

export function setStorage(acc: Addressbook) {
  if (!acc.storage) {
    acc.storage = new SQLAddressbook();
  }
}