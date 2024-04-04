import type { MailAccount } from './Mail/MailAccount';
import type { ChatAccount } from './Chat/ChatAccount';
import type { Account } from './Abstract/Account';
import { Person } from './Abstract/Person';
import type { Contact } from './Abstract/Contact';
import type { Addressbook } from './Contacts/Addressbook';
import type { Calendar } from './Calendar/Calendar';
import type { VideoConfMeeting } from './Meet/VideoConfMeeting';
import type { Directory } from './Files/File';
import type { Workspace } from './Abstract/Workspace';
import Apps from './Apps/Apps';
import { ArrayColl, Collection, mergeColl, mergeColls } from 'svelte-collections';

class AppGlobal {
  readonly emailAccounts = new ArrayColl<MailAccount>();
  readonly chatAccounts = new ArrayColl<ChatAccount>();
  readonly addressbooks = new ArrayColl<Addressbook>();
  readonly calendars = new ArrayColl<Calendar>();
  readonly meetings = new ArrayColl<VideoConfMeeting>();
  readonly files = new ArrayColl<Directory>();
  readonly workspaces = new ArrayColl<Workspace>();
  readonly apps = new Apps();

  readonly persons = new ArrayColl<Person>();
  //readonly persons: Collection<Contact> = mergeColls(this.addressbooks.map(ab => ab.persons));
  //readonly allContacts: Collection<Contact> = mergeColls(this.addressbooks.map(ab => ab.contacts));
  readonly allAccounts: Collection<Account> = mergeColl(this.addressbooks, this.chatAccounts, this.addressbooks, this.calendars);
  remoteApp: any;
  me = new Person();
}

export const appGlobal = new AppGlobal();
