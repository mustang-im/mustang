import type { MailAccount } from './Mail/MailAccount';
import type { ChatAccount } from './Chat/ChatAccount';
import { Person } from './Abstract/Person';
// import type { Contact } from './Abstract/Contact';
import type { Addressbook } from './Contacts/Addressbook';
import type { Calendar } from './Calendar/Calendar';
import type { MeetAccount } from './Meet/MeetAccount';
import type { VideoConfMeeting } from './Meet/VideoConfMeeting';
import type { FileSharingAccount } from './Files/FileSharingAccount';
import type { Workspace } from './Abstract/Workspace';
import { WebApps } from './WebApps/WebApps';
import { Observable, notifyChangedProperty } from './util/Observable';
import { ArrayColl, Collection, mergeColls } from 'svelte-collections';

class AppGlobal extends Observable {
  readonly emailAccounts = new ArrayColl<MailAccount>();
  readonly chatAccounts = new ArrayColl<ChatAccount>();
  readonly addressbooks = new ArrayColl<Addressbook>();
  readonly calendars = new ArrayColl<Calendar>();
  readonly calendarEvents = mergeColls(this.calendars.map(cal => cal.eventsWithRecurrences)).sortBy(ev => ev.startTime);
  readonly meetAccounts = new ArrayColl<MeetAccount>();
  readonly meetings = new ArrayColl<VideoConfMeeting>();
  readonly fileSharingAccounts = new ArrayColl<FileSharingAccount>();
  readonly workspaces = new ArrayColl<Workspace>();
  readonly webApps = new WebApps();

  personalAddressbook: Addressbook;
  collectedAddressbook: Addressbook;
  readonly persons: Collection<Person> = mergeColls(this.addressbooks.map(ab => ab.persons));
  //readonly allContacts: Collection<Contact> = mergeColls(this.addressbooks.map(ab => ab.contacts));
  remoteApp: any;
  me = new Person();

  @notifyChangedProperty
  isSmall = false;
  @notifyChangedProperty
  isMobile = false;
}

export const appGlobal = new AppGlobal();
