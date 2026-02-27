import { Event } from "../Event";
import { JSCalendarEvent } from "./JSCalendarEvent";
import type { TJMAPCalendarEvent } from "./TJSCalendar";
import type { TID, TJMAPChangeResponse } from "../../Mail/JMAP/TJMAPGeneric";
import type { JMAPCalendar } from "./JMAPCalendar";
import type { InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import { JMAPOutgoingInvitation } from "./JMAPOutgoingInvitation";
import { checkChangeError } from "../../Mail/JMAP/JMAPError";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class JMAPEvent extends Event {
  declare calendar: JMAPCalendar;
  declare parentEvent: JMAPEvent;
  declare readonly exceptions: ArrayColl<JMAPEvent>;
  isOrigin = true;
  original: TJMAPCalendarEvent;

  get jmapID(): TID {
    return this.pID;
  }
  set jmapID(val: TID) {
    this.pID = val;
  }

  get account() {
    return this.calendar.account;
  }

  fromJMAP(jmap: TJMAPCalendarEvent) {
    JSCalendarEvent.toEvent(jmap, this);
    this.isOrigin = sanitize.boolean(jmap.isOrigin, true);
    this.jmapID = sanitize.alphanumdash(jmap.id);
    this.original = jmap;
  }

  get outgoingInvitation() {
    return new JMAPOutgoingInvitation(this);
  }

  async saveToServer() {
    await this.prepareSaveToServer();

    let isNew = !this.original;
    let jsevent = this.original ?? {} as TJMAPCalendarEvent;
    JSCalendarEvent.fromEvent(this, jsevent); // overwrites `jsevent`, so must be first
    jsevent.calendarIds ??= {};
    jsevent.calendarIds[this.calendar.jmapID] = true;
    delete jsevent.id; // Workaround for <https://github.com/stalwartlabs/stalwart/discussions/2858>
    delete jsevent.isOrigin; // ditto
    assert(this.id, "Event ctor should set this");

    let results = await this.account.makeSingleCall("CalendarEvent/set", {
      accountId: this.account.accountID,
      [isNew ? "create" : "update"]: {
        [isNew ? this.id : this.jmapID]: jsevent,
      },
    }) as TJMAPChangeResponse<TJMAPCalendarEvent>;
    checkChangeError(results);

    this.original = jsevent;
    if (isNew) {
      this.jmapID = this.original.id = sanitize.alphanumdash(results.created[this.id].id);
      await this.saveLocally();
    }
  }

  async deleteFromServer() {
    await this.account.makeSingleCall("CalendarEvent/set", {
      accountId: this.account.accountID,
      destroy: [this.jmapID],
    });
  }

  async makeExclusions(exclusions: JMAPEvent[]) {
    await super.makeExclusions(exclusions);
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.isIncomingMeeting, "Only invitations can be responded to");
    // ...
    await this.calendar.listEvents(); // Sync whatever the server decides to do
  }

  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    this.original = sanitize.json(json.original, {}); // as object, not string
    this.jmapID = sanitize.alphanumdash(json.jmapID, null);
  }
  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.original = this.original;
    json.jmapID = this.jmapID;
    return json;
  }
}
