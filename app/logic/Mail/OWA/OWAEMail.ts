import { EMail } from "../EMail";
import type { OWAFolder } from "./OWAFolder";
import type { OWACalendar } from "../../Calendar/OWA/OWACalendar";
import { OWAEvent } from "../../Calendar/OWA/OWAEvent";
import { Tag, getTagByName } from "../Tag";
import OWACreateItemRequest from "./Request/OWACreateItemRequest";
import OWADeleteItemRequest from "./Request/OWADeleteItemRequest";
import OWAUpdateItemRequest from "./Request/OWAUpdateItemRequest";
import { owaDownloadMsgsRequest } from "./Request/OWAFolderRequests";
import { owaGetEventsRequest } from "../../Calendar/OWA/Request/OWAEventRequests";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { Scheduling } from "../../Calendar/Invitation";
import { base64ToArrayBuffer, assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";

export class OWAEMail extends EMail {
  folder: OWAFolder;

  get itemID(): string | null {
    return this.pID as string | null;
  }
  set itemID(val: string | null) {
    assert(val == null || typeof (val) == "string", "OWA EMail itemID must be a string");
    this.pID = val;
  }

  async download() {
    let result = await this.folder.account.callOWA(owaDownloadMsgsRequest([ this ]));
    let mimeBase64 = sanitize.nonemptystring(result.Items[0].MimeContent.Value);
    this.mime = new Uint8Array(await base64ToArrayBuffer(mimeBase64, "message/rfc822"));
    await this.parseMIME();
    await this.saveCompleteMessage();
  }

  fromJSON(json) {
    this.itemID = sanitize.nonemptystring(json.ItemId.Id);
    this.id = sanitize.nonemptystring(json.InternetMessageId, "");
    this.subject = sanitize.nonemptystring(json.Subject, "");
    this.sent = sanitize.date(json.DateTimeSent, new Date());
    this.received = sanitize.date(json.DateTimeReceived, new Date());
    this.setFlags(json);
    this.inReplyTo = sanitize.nonemptystring(json.InReplyTo, null);
    this.references = sanitize.nonemptystring(json.References, null)?.split(" ");
    /*if ("ReplyTo" in json) {
      this.replyTo = findOrCreatePersonUID(sanitize.emailAddress(json.ReplyTo.Mailbox.EmailAddress), sanitize.nonemptystring(json.ReplyTo.Mailbox.Name, null));
    }*/
    if ("From" in json) {
      this.from = findOrCreatePersonUID(sanitize.emailAddress(json.From.Mailbox.EmailAddress), sanitize.nonemptystring(json.From.Mailbox.Name, null));
    } else if ("Sender" in json) {
      this.from = findOrCreatePersonUID(sanitize.emailAddress(json.Sender.Mailbox.EmailAddress), sanitize.nonemptystring(json.Sender.Mailbox.Name, null));
    }
    this.outgoing = this.folder?.account.identities.some(id => id.isEMailAddress(this.from?.emailAddress));
    setPersons(this.to, json.ToRecipients);
    setPersons(this.cc, json.CcRecipients);
    setPersons(this.bcc, json.BccRecipients);
    this.contact = this.outgoing ? this.to.first : this.from;
    this.scheduling = ExchangeScheduling[json.ItemClass] || Scheduling.None;
  }

  setFlags(json) {
    this.isRead = sanitize.boolean(json.IsRead);
    // don't know how to get new or replied status
    this.isStarred = json.Flag?.FlagStatus == "Flagged";
    // can't work out how to find junk status
    this.isDraft = sanitize.boolean(json.IsDraft);
    this.tags.replaceAll((json.Categories || []).map(name => getTagByName(name)));
  }

  async markRead(read = true) {
    let request = new OWAUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendCalendarInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "IsRead", read, "message:IsRead");
    await this.folder.account.callOWA(request);
    await super.markRead(read);
  }

  async markStarred(starred = true) {
    let request = new OWAUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendCalendarInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "Flag", {
      __type: "FlagType:#Exchange",
      CompleteDate: null,
      DueDate: null,
      StartDate: null,
      FlagStatus: starred ? "Flagged" : "NotFlagged",
    }, "item:Flag");
    await this.folder.account.callOWA(request);
    await super.markStarred(starred);
  }

  //async markSpam(spam = true) {
  //} Don't know how to do this in OWA

  async markDraft(isDraft = true) {
    await super.markDraft(isDraft);
    let request = new OWAUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendCalendarInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "IsDraft", isDraft, "message:IsDraft");
    await this.folder.account.callOWA(request);
  }

  async deleteMessageOnServer() {
    let request = new OWADeleteItemRequest(this.itemID, {SuppressReadReceipts: true});
    await this.folder.account.callOWA(request);
  }

  async addTagOnServer(tag: Tag) {
    await this.updateTags();
  }

  async removeTagOnServer(tag: Tag) {
    await this.updateTags();
  }

  async updateTags() {
    let request = new OWAUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendCalendarInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "Categories", this.tags.contents.map(tag => tag.name), "Categories");
    await this.folder.account.callOWA(request);
  }

  getUpdateCalendars(): OWACalendar[] {
    assert(this.scheduling && this.event, "Must have event to find calendar");
    if (this.folder.account.calendar && (this.scheduling == Scheduling.Request || this.folder.account.calendar.events.some(event => event.calUID == this.event.calUID))) {
      return [this.folder.account.calendar];
    }
    return [];
  }

  /** OWA only provides event data for invitations,
   * but not responses to invitations.
   * Disabled, but keeping the code, in case it will be useful later.
   *
   * `EMail.loadEvent()` works for all iTIP messages.
   * By not overriding `loadEvent()` here, `EMail.loadEvent()` will be called. */
  async loadEvent_disabled() {
    assert(this.scheduling == Scheduling.Request, "This is not an invitation");
    assert(!this.event, "Event has already been loaded");
    let result = await this.folder.account.callOWA(owaGetEventsRequest([ this.itemID ]));
    let event = new OWAEvent();
    event.fromJSON(result.Items[0]);
    this.event = event;
  }
}


const ExchangeScheduling: Record<string, number> = {
  "IPM.Schedule.Meeting.Resp.Pos": Scheduling.Accepted,
  "IPM.Schedule.Meeting.Resp.Tent": Scheduling.Tentative,
  "IPM.Schedule.Meeting.Resp.Neg": Scheduling.Declined,
  "IPM.Schedule.Meeting.Request": Scheduling.Request,
  "IPM.Schedule.Meeting.Canceled": Scheduling.Cancellation,
};

function setPersons(targetList: ArrayColl<PersonUID>, mailboxes: any): void {
  if (!mailboxes) {
    return;
  }
  targetList.replaceAll(mailboxes.map(mailbox => findOrCreatePersonUID(sanitize.emailAddress(mailbox.EmailAddress), sanitize.nonemptystring(mailbox.Name, null))));
}
