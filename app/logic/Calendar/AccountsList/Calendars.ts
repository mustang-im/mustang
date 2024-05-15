import { Calendar } from '../Calendar';
import { EWSCalendar } from '../EWS/EWSCalendar';
import { OWACalendar } from '../OWA/OWACalendar';
import { ActiveSyncCalendar } from '../ActiveSync/ActiveSyncCalendar';
import { NotReached } from '../../util/util';

export function newCalendarForProtocol(protocol: string): Calendar {
  if (protocol == "calendar-local") {
    return new Calendar();
  }
  if (protocol == "calendar-ews") {
    return new EWSCalendar();
  }
  if (protocol == "calendar-owa") {
    return new OWACalendar();
  }
  if (protocol == "calendar-activesync") {
    return new ActiveSyncCalendar();
  }
  throw new NotReached(`Unknown calendar type ${protocol}`);
}
