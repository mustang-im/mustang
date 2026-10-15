import { RecurrenceCase, type Event } from "../../../logic/Calendar/Event";
import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
import { k1DayMS, k1MinuteMS } from "../../../frontend/Util/date";
import { gt } from "../../../l10n/l10n";

export type EventStatus = "busy" | "tentative" | "unanswered" | "declined" | "cancelled";

export class EventLook {
  readonly event: Event;

  constructor(event: Event) {
    this.event = event;
  }

  get status(): EventStatus {
    if (this.event.isCancelled) {
      return "cancelled";
    }
    switch (this.event.myParticipation) {
    case InvitationResponse.Decline:
      return "declined";
    case InvitationResponse.Tentative:
      return "tentative";
    case InvitationResponse.NoResponseReceived:
      return "unanswered";
    }
    return "busy";
  }

  get title(): string {
    let title = this.event.title ?? "";
    switch (this.status) {
    case "cancelled":
      return gt`Canceled: ${title}`;
    case "declined":
      return gt`Declined: ${title}`;
    }
    return title;
  }

  get color(): string | null {
    return this.event.color ?? this.event.calendar?.color ?? null;
  }

  isPast(now: Date): boolean {
    return this.event.endTime <= now;
  }

  get isInAllDayArea(): boolean {
    return this.event.allDay || this.event.endTime.getTime() - this.event.startTime.getTime() >= k1DayMS;
  }

  get isRecurring(): boolean {
    return this.event.recurrenceCase == RecurrenceCase.Instance;
  }

  get isException(): boolean {
    return this.event.recurrenceCase == RecurrenceCase.Exception;
  }

  get isMeeting(): boolean {
    return this.event.participants.hasItems;
  }

  get isOnlineMeeting(): boolean {
    return this.event.isOnline && !!this.event.onlineMeetingURL;
  }

  canJoin(now: Date): boolean {
    const kJoinableBeforeStartMS = 15 * k1MinuteMS;
    return this.isOnlineMeeting &&
      this.event.startTime.getTime() - kJoinableBeforeStartMS <= now.getTime() &&
      now < this.event.endTime;
  }

  get organizerName(): string | null {
    if (!this.event.isIncomingMeeting) {
      return null;
    }
    let organizer = this.event.organizer;
    return organizer?.name || organizer?.emailAddress || null;
  }

  timeText(locale: string): string {
    let start = this.event.startTime;
    let end = this.event.endTime;
    if (this.event.allDay) {
      let lastDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
      if (lastDay <= start) {
        return gt`All day`;
      }
      return new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).formatRange(start, lastDay);
    }
    if (start.toDateString() == end.toDateString()) {
      return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).formatRange(start, end);
    }
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).formatRange(start, end);
  }

  startTimeText(locale: string): string {
    return this.event.startTime.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  }

  tooltip(locale: string): string {
    return [ this.timeText(locale), this.title, this.event.location, this.organizerName ]
      .filter(line => line?.trim())
      .join("\n");
  }
}
