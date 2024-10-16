import { Calendar } from '../Calendar';
import { EWSCalendar } from '../EWS/EWSCalendar';
import { OWACalendar } from '../OWA/OWACalendar';
import { ActiveSyncCalendar } from '../ActiveSync/ActiveSyncCalendar';
import { SQLCalendarStorage } from '../SQL/SQLCalendarStorage';
import { NotReached } from '../../util/util';

export function newCalendarForProtocol(protocol: string): Calendar {
  let calendar: Calendar;
  if (protocol == "calendar-local") {
    calendar = new Calendar();
  } else if (protocol == "calendar-ews") {
    calendar = new EWSCalendar();
  } else if (protocol == "calendar-owa") {
    calendar = new OWACalendar();
  } else if (protocol == "calendar-activesync") {
    calendar = new ActiveSyncCalendar();
  } else {
    throw new NotReached(`Unknown calendar type ${protocol}`);
  }
  calendar.storage = new SQLCalendarStorage();
  return calendar;
}
