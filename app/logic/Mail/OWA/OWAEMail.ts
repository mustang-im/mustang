import { EMail, Scheduling } from "../EMail";
import type { OWAFolder } from "./OWAFolder";
import type { OWACalendar } from "../../Calendar/OWA/OWACalendar";
import { OWAEvent } from "../../Calendar/OWA/OWAEvent";
import { ResponseType, type Responses } from "../../Calendar/Event";
import { Tag, getTagByName } from "../Tag";
import OWACreateItemRequest from "./OWACreateItemRequest";
import OWADeleteItemRequest from "./OWADeleteItemRequest";
import OWAUpdateItemRequest from "./OWAUpdateItemRequest";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { appGlobal } from "../../app";
import { base64ToArrayBuffer, assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";

const ExchangeScheduling: Record<string, number> = {
  "IPM.Schedule.Meeting.Resp.Pos": Scheduling.Accepted,
  "IPM.Schedule.Meeting.Resp.Tent": Scheduling.Tentative,
  "IPM.Schedule.Meeting.Resp.Neg": Scheduling.Declined,
  "IPM.Schedule.Meeting.Request": Scheduling.Request,
  "IPM.Schedule.Meeting.Canceled": Scheduling.Cancellation,
};

const ResponseTypes: Record<Responses, string> = {
  [ResponseType.Accept]: "AcceptItem",
  [ResponseType.Tentative]: "TentativelyAcceptItem",
  [ResponseType.Decline]: "DeclineItem",
};

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
    let request = {
      __type: "GetItemJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "GetItemRequest:#Exchange",
        ItemShape: {
          __type: "ItemResponseShape:#Exchange",
          BaseShape: "IdOnly",
          AdditionalProperties: [{ // Work around Office365 bug
            __type: "PropertyUri:#Exchange",
            FieldURI: "item:Size"
          }],
          IncludeMimeContent: true,
        },
        ItemIds: [{
          __type: "ItemId:#Exchange",
          Id: this.itemID,
        }],
      },
    };
    let result = await this.folder.account.callOWA(request);
    let mimeBase64 = sanitize.nonemptystring(result.Items[0].MimeContent.Value);
    this.mime = new Uint8Array(await base64ToArrayBuffer(mimeBase64, "message/rfc822"));
    await this.parseMIME();
    await this.saveCompleteMessage();
  }

  fromJSON(json) {
    this.itemID = sanitize.nonemptystring(json.ItemId.Id);
    this.id = sanitize.nonemptystring(json.InternetMessageId, "");
    this.subject = sanitize.nonemptystring(json.Subject, "");
    if ("DateTimeSent" in json) {
      this.sent = sanitize.date(json.DateTimeSent);
    } else {
      this.sent = new Date();
    }
    if ("DateTimeReceived" in json) {
      this.received = sanitize.date(json.DateTimeReceived);
    } else {
      this.received = new Date();
    }
    this.setFlags(json);
    this.inReplyTo = sanitize.nonemptystring(json.InReplyTo, null);
    this.references = sanitize.nonemptystring(json.References, null)?.split(" ");
    /*if ("ReplyTo" in json) {
      this.replyTo = findOrCreatePersonUID(sanitize.emailAddress(json.ReplyTo.Mailbox.EmailAddress), sanitize.nonemptystring(json.ReplyTo.Mailbox.Name, null));
    }*/
    if ("From" in json) {
      this.from = findOrCreatePersonUID(sanitize.emailAddress(json.From.Mailbox.EmailAddress), sanitize.nonemptystring(json.From.Mailbox.Name, null));
      this.outgoing = appGlobal.me.emailAddresses.some(e => e.value == this.from.emailAddress);
    } else if ("Sender" in json) {
      this.from = findOrCreatePersonUID(sanitize.emailAddress(json.Sender.Mailbox.EmailAddress), sanitize.nonemptystring(json.Sender.Mailbox.Name, null));
      this.outgoing = appGlobal.me.emailAddresses.some(e => e.value == this.from.emailAddress);
    }
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
    // `replaceAll` doesn't work for a `SetColl`
    this.tags.clear();
    if (json.Categories) {
      this.tags.addAll(json.Categories.map(name => getTagByName(name)));
    }
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

  async markDraft() {
    let request = new OWAUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendCalendarInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "IsDraft", true, "message:IsDraft");
    await this.folder.account.callOWA(request);
    await super.markDraft();
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

  async respondToInvitation(response: Responses): Promise<void> {
    assert(this.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let request = new OWACreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
    request.addField(ResponseTypes[response], "ReferenceItemId", {
      __type: "ItemId:#Exchange",
      Id: this.itemID,
    });
    await this.folder.account.callOWA(request);
    await this.deleteMessageLocally(); // Exchange deletes the message from the inbox
  }

  getUpdateCalendars(): OWACalendar[] {
    if (!this.scheduling || this.scheduling == Scheduling.Request || !this.event) {
      return [];
    }
    if (this.folder.account.calendar?.events.some(event => event.calUID == this.event.calUID)) {
      return [this.folder.account.calendar];
    }
    return [];
  }

  async updateCalendar(calendar: OWACalendar): Promise<void> {
    await calendar.updateFromResponse(this.scheduling, this.event);
  }
}

function setPersons(targetList: ArrayColl<PersonUID>, mailboxes: any): void {
  if (!mailboxes) {
    return;
  }
  targetList.replaceAll(mailboxes.map(mailbox => findOrCreatePersonUID(sanitize.emailAddress(mailbox.EmailAddress), sanitize.nonemptystring(mailbox.Name, null))));
}
