import { Account } from "../Abstract/Account";
import type { Folder } from "./Folder";
import type { MailMessage } from "./Message";
import type { Person } from "../Abstract/Person";
import type { ArrayColl, MapColl } from 'svelte-collections';

export class MailAccount extends Account {
  rootFolders: ArrayColl<Folder>;
  messages: MapColl<Person, MailMessage>;
}
