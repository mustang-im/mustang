import { Account } from "../Abstract/Account";
import type { Folder } from "./Folder";
import type { EMail } from "./EMail";
import type { Person } from "../Abstract/Person";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from 'svelte-collections';

export class MailAccount extends Account {
  @notifyChangedProperty
  emailAddress: string;
  readonly rootFolders = new ArrayColl<Folder>();
  /** List of all messages in all folders,
   * filtered based on the person.
   * TODO move up, across all accounts? */
  readonly messages = new MapColl<Person, EMail>();
  @notifyChangedProperty
  inbox: Folder;
}
