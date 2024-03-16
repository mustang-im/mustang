import type { MailAccount } from './Mail/MailAccount';
import type { ChatAccount } from './Chat/ChatAccount';
import type { Person } from './Abstract/Person';
import type { VideoConfMeeting } from './Meet/VideoConfMeeting';
import type { Calendar } from './Calendar/Calendar';
import type { Directory } from './Files/File';
import Apps from './Apps/Apps';
import { ArrayColl } from 'svelte-collections';

class AppGlobal {
  readonly emailAccounts = new ArrayColl<MailAccount>();
  readonly chatAccounts = new ArrayColl<ChatAccount>();
  readonly calendars = new ArrayColl<Calendar>();
  readonly meetings = new ArrayColl<VideoConfMeeting>();
  readonly persons = new ArrayColl<Person>();
  readonly files = new ArrayColl<Directory>();
  readonly apps = new Apps();
  remoteApp: any;
  me: Person;
}

export let appGlobal = new AppGlobal();
