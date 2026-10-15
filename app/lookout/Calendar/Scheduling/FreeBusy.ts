import type { Calendar } from "../../../logic/Calendar/Calendar";
import type { Participant } from "../../../logic/Calendar/Participant";

export interface BusyInterval {
  from: Date;
  to: Date;
}

export interface AttendeeAvailability {
  participant: Participant;
  busy: BusyInterval[] | null;
}

export type AvailabilityStatus = "free" | "busy" | "unknown";

type ArePersonsFreeResult = Awaited<ReturnType<Calendar["arePersonsFree"]>>;

export class FreeBusy {
  readonly rows: AttendeeAvailability[];
  readonly isSupported: boolean;

  constructor(rows: AttendeeAvailability[], isSupported = true) {
    this.rows = rows;
    this.isSupported = isSupported;
  }

  static async load(calendar: Calendar, participants: Participant[], from: Date, to: Date): Promise<FreeBusy> {
    if (!participants.length) {
      return new FreeBusy([]);
    }
    let availability = await calendar.arePersonsFree(participants, from, to);
    return FreeBusy.fromAvailability(participants, availability);
  }

  static fromAvailability(participants: Participant[], availability: ArePersonsFreeResult): FreeBusy {
    return new FreeBusy(participants.map(participant => {
      let result = availability.find(entry => entry.participant == participant) ??
        availability.find(entry => entry.participant?.emailAddress == participant.emailAddress);
      if (!result?.availability) {
        return { participant, busy: null };
      }
      let busy = result.availability
        .filter(interval => !interval.free)
        .map(interval => ({ from: new Date(interval.from), to: new Date(interval.to) }));
      return { participant, busy: FreeBusy.merge(busy) };
    }), availability.length > 0);
  }

  get hasInformation(): boolean {
    return this.rows.some(row => row.busy);
  }

  get allAttendeesBusy(): BusyInterval[] {
    return FreeBusy.merge(this.rows.flatMap(row => row.busy ?? []));
  }

  rowFor(participant: Participant): AttendeeAvailability | undefined {
    return this.rows.find(row => row.participant == participant) ??
      this.rows.find(row => row.participant.emailAddress == participant.emailAddress);
  }

  status(participant: Participant, start: Date, end: Date): AvailabilityStatus {
    let busy = this.rowFor(participant)?.busy;
    if (!busy) {
      return "unknown";
    }
    return busy.some(interval => interval.from < end && interval.to > start) ? "busy" : "free";
  }

  static merge(intervals: BusyInterval[]): BusyInterval[] {
    let sorted = intervals
      .filter(interval => interval.to > interval.from)
      .sort((a, b) => a.from.getTime() - b.from.getTime());
    let merged: BusyInterval[] = [];
    for (let interval of sorted) {
      let last = merged.at(-1);
      if (last && interval.from <= last.to) {
        if (interval.to > last.to) {
          last.to = new Date(interval.to);
        }
      } else {
        merged.push({ from: new Date(interval.from), to: new Date(interval.to) });
      }
    }
    return merged;
  }
}
