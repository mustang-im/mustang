import { Calendar } from '../Calendar';
// #if [WEBMAIL]
import { DummyCalendarStorage } from '../SQL/DummyCalendarStorage';
// #else
import { EWSCalendar } from '../EWS/EWSCalendar';
import { OWACalendar } from '../OWA/OWACalendar';
import { ActiveSyncCalendar } from '../ActiveSync/ActiveSyncCalendar';
import { SQLCalendarStorage } from '../SQL/SQLCalendarStorage';
// #endif
import { isWebMail } from '../../build';
import { NotReached, assert } from '../../util/util';
import { ArrayColl, type Collection } from 'svelte-collections';
import { gt } from '../../../l10n/l10n';

export function newCalendarForProtocol(protocol: string): Calendar {
  let calendar = _newCalendarForProtocol(protocol);
  // #if [WEBMAIL]
  calendar.storage = new DummyCalendarStorage();
  // #else
  calendar.storage = new SQLCalendarStorage();
  // #endif
  return calendar;
}

function _newCalendarForProtocol(protocol: string): Calendar {
  // #if [WEBMAIL]
  if (isWebMail) {
    assert(protocol == "jmap", "Need JMAP account for webmail");
    // return new JMAPCalendar();
  }
  // #else
  if (protocol == "calendar-local") {
    return new Calendar();
  } else if (protocol == "calendar-ews") {
    return new EWSCalendar();
  } else if (protocol == "calendar-owa") {
    return new OWACalendar();
  } else if (protocol == "calendar-activesync") {
    return new ActiveSyncCalendar();
  }
  throw new NotReached(`Unknown calendar type ${protocol}`);
  // #endif
}

// #if [WEBMAIL]
// #else
export async function readCalendars(): Promise<Collection<Calendar>> {
  let calendars = await SQLCalendarStorage.readCalendars();
  if (calendars.isEmpty) {
    calendars.addAll(await createDefaultCalendars());
  }
  return calendars;
}
// #endif

async function createDefaultCalendars(): Promise<Collection<Calendar>> {
  console.log("Creating default calendars");
  let calendars = new ArrayColl<Calendar>();
  let personal = newCalendarForProtocol("calendar-local");
  personal.name = gt`Personal calendar`;
  calendars.add(personal);
  await personal.save();
  return calendars;
}
