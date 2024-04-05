import { Calendar } from '../Calendar';
import { NotReached } from '../../util/util';

export function newCalendarForProtocol(protocol: string): Calendar {
  if (protocol == "calendar-local") {
    return new Calendar();
  }
  throw new NotReached(`Unknown calendar type ${protocol}`);
}
