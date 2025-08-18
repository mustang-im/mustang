import { Calendar } from '../Calendar';
// #if [!WEBMAIL && PROPRIETARY]
import { EWSCalendar } from '../EWS/EWSCalendar';
import { OWACalendar } from '../OWA/OWACalendar';
import { ActiveSyncCalendar } from '../ActiveSync/ActiveSyncCalendar';
// #endif
// #if [!WEBMAIL]
import { CalDAVCalendar } from '../CalDAV/CalDAVCalendar';
import { SQLCalendarStorage } from '../SQL/SQLCalendarStorage';
// #else
import { DummyCalendarStorage } from '../SQL/DummyCalendarStorage';
// #endif
import { NotReached, NotImplemented } from '../../util/util';
import type { Collection } from 'svelte-collections';
import { gt } from '../../../l10n/l10n';

export function newCalendarForProtocol(protocol: string): Calendar {
  let calendar = _newCalendarForProtocol(protocol);
  // #if [!WEBMAIL]
  calendar.storage = new SQLCalendarStorage();
  // #else
  calendar.storage = new DummyCalendarStorage();
  // #endif
  return calendar;
}

function _newCalendarForProtocol(protocol: string): Calendar {
  if (protocol == "calendar-local") {
    return new Calendar();
  }
  // #if [!WEBMAIL || WEBMAIL=JMAP]
  if (protocol == "calendar-jmap") {
    throw new NotImplemented("JMAP Calendar not implemented");
    // return new JMAPCalendar();
  }
  // #endif
  // #if [!WEBMAIL]
  if (protocol == "caldav") {
    return new CalDAVCalendar();
  }
  // #endif
  // #if [(!WEBMAIL || WEBMAIL=EWS) && PROPRIETARY]
  if (protocol == "calendar-ews") {
    return new EWSCalendar();
  }
  // #endif
  // #if [!WEBMAIL && PROPRIETARY]
  if (protocol == "calendar-owa") {
    return new OWACalendar();
  } else if (protocol == "calendar-activesync") {
    return new ActiveSyncCalendar();
  }
  // #endif
  throw new NotReached(`Unknown calendar type ${protocol}`);
}

// #if [!WEBMAIL]
export async function readCalendars(): Promise<Collection<Calendar>> {
  let calendars = await SQLCalendarStorage.readCalendars();
  if (calendars.isEmpty) {
    calendars.add(await createPersonalCalendar());
  }
  return calendars;
}
// #endif

export async function createPersonalCalendar(): Promise<Calendar> {
  console.log("Creating default calendars");
  let personal = newCalendarForProtocol("calendar-local");
  personal.name = gt`Personal calendar`;
  await personal.save();
  return personal;
}
