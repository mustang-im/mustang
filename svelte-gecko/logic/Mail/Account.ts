import { Account } from "../Abstract/Account";
import type { Folder } from "./Folder";
import type { EMail } from "./Message";
import type { Person } from "../Abstract/Person";
import { ArrayColl, MapColl } from 'svelte-collections';

export class MailAccount extends Account {
  emailAddress: string;
  rootFolders = new ArrayColl<Folder>();
  messages = new MapColl<Person, EMail>();
  inbox: Folder;
}
