import { Calendar } from '../Calendar';
import { EWSCalendar } from '../EWS/EWSCalendar';
import { OWACalendar } from '../OWA/OWACalendar';
import { ActiveSyncCalendar } from '../ActiveSync/ActiveSyncCalendar';
import { SQLCalendarStorage } from '../SQL/SQLCalendarStorage';
import { NotReached } from '../../util/util';

export function newCalendarForProtocol(protocol: string): Calendar {
  let calendar = _newCalendarForProtocol(protocol);
  calendar.storage = new SQLCalendarStorage();
  return calendar;
}

function _newCalendarForProtocol(protocol: string): Calendar {
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
}
