import { EMail } from "../EMail";
import { type EWSFolder, getEWSItem } from "./EWSFolder";
import type { EWSCalendar } from "../../Calendar/EWS/EWSCalendar";
import { EWSEvent } from "../../Calendar/EWS/EWSEvent";
import { type Tag, getTagByName } from "../Tag";
import { Attachment, ContentDisposition } from "../../Abstract/Attachment";
import EWSCreateItemRequest from "./Request/EWSCreateItemRequest";
import EWSDeleteItemRequest from "./Request/EWSDeleteItemRequest";
import EWSUpdateItemRequest from "./Request/EWSUpdateItemRequest";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { Scheduling } from "../../Calendar/Invitation";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { base64ToArrayBuffer, assert, ensureArray } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

const ExchangeScheduling: Record<string, number> = {
  "IPM.Schedule.Meeting.Resp.Pos": Scheduling.Accepted,
  "IPM.Schedule.Meeting.Resp.Tent": Scheduling.Tentative,
  "IPM.Schedule.Meeting.Resp.Neg": Scheduling.Declined,
  "IPM.Schedule.Meeting.Request": Scheduling.Request,
  "IPM.Schedule.Meeting.Canceled": Scheduling.Cancellation,
};

export class EWSEMail extends EMail {
  folder: EWSFolder;

  get itemID(): string | null {
    return this.pID as string | null;
  }
  set itemID(val: string | null) {
    assert(val == null || typeof (val) == "string", "EWS EMail itemID must be a string");
    this.pID = val;
  }

  async download() {
    let request = {
      m$GetItem: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
          t$IncludeMimeContent: true,
        },
        m$ItemIds: {
          t$ItemId: {
            Id: this.itemID,
          },
        },
      },
    };
    let result = await this.folder.account.callEWS(request);
    let mimeBase64 = sanitize.nonemptystring(getEWSItem(result.Items).MimeContent.Value);
    this.mime = new Uint8Array(await base64ToArrayBuffer(mimeBase64, "message/rfc822"));
    await this.parseMIME();
    await this.saveCompleteMessage();
  }

  fromXML(xmljs) {
    this.itemID = sanitize.nonemptystring(xmljs.ItemId.Id);
    this.id = sanitize.nonemptystring(xmljs.InternetMessageId, "");
    this.subject = sanitize.nonemptystring(xmljs.Subject, "");
    this.sent = sanitize.date(xmljs.DateTimeSent, new Date());
    this.received = sanitize.date(xmljs.DateTimeReceived, new Date());
    this.setFlags(xmljs);
    this.inReplyTo = sanitize.nonemptystring(xmljs.InReplyTo, null);
    this.references = sanitize.nonemptystring(xmljs.References, null)?.split(" ");
    if ("ReplyTo" in xmljs) {
      this.replyTo = findOrCreatePersonUID(sanitize.emailAddress(xmljs.ReplyTo.Mailbox.EmailAddress), sanitize.nonemptystring(xmljs.ReplyTo.Mailbox.Name, null));
    }
    if ("From" in xmljs) {
      this.from = findOrCreatePersonUID(sanitize.emailAddress(xmljs.From.Mailbox.EmailAddress), sanitize.nonemptystring(xmljs.From.Mailbox.Name, null));
    } else if ("Sender" in xmljs) {
      this.from = findOrCreatePersonUID(sanitize.emailAddress(xmljs.Sender.Mailbox.EmailAddress), sanitize.nonemptystring(xmljs.Sender.Mailbox.Name, null));
    }
    this.outgoing = this.folder?.account.identities.some(id => id.isEMailAddress(this.from?.emailAddress));
    setPersons(this.to, xmljs.ToRecipients?.Mailbox);
    setPersons(this.cc, xmljs.CcRecipients?.Mailbox);
    setPersons(this.bcc, xmljs.BccRecipients?.Mailbox);
    this.contact = this.outgoing ? this.to.first : this.from;
    this.scheduling = ExchangeScheduling[xmljs.ItemClass] || Scheduling.None;
  }

  /** Get body and attachments from Exchange.
   * This is an alternative to parsing MIME.
   * @see EWSFolder GetItem server call. */
  bodyAndAttachmentsFromXML(xmljs) {
    assert(this.itemID == xmljs.ItemId.Id, "EWS EMail ItemID doesn't match");
    if (xmljs.Body?.BodyType == "Text") {
      this.text = sanitize.nonemptystring(xmljs.Body.Value, "");
    } else {
      this.text = sanitize.nonemptystring(xmljs.TextBody?.Value, "");
      if (xmljs.Body?.BodyType == "HTML") {
        this.html = sanitize.nonemptystring(xmljs.Body.Value, "");
      }
    }
    if (xmljs.Attachments?.FileAttachment) {
      let attachments = ensureArray(xmljs.Attachments.FileAttachment);
      this.attachments.replaceAll(attachments.map(a => {
        let attachment = new Attachment();
        attachment.filename = a.Name;
        attachment.mimeType = a.ContentType;
        attachment.disposition = a.IsInline == "true" ? ContentDisposition.inline : ContentDisposition.attachment;
        if (a.ContentId) {
          attachment.contentID = a.ContentId;
        }
        attachment.size = Number(a.Size);
        return attachment;
      }));
    }
  }

  setFlags(xmljs) {
    this.isRead = sanitize.boolean(xmljs.IsRead);
    this.isNewArrived = xmljs.ExtendedProperty?.Value == 0xFFFFFFFF; // -1?
    this.isReplied = xmljs.ExtendedProperty?.Value == 0x105;
    this.isStarred = xmljs.Flag?.FlagStatus == "Flagged";
    // can't work out how to find junk status
    this.isDraft = sanitize.boolean(xmljs.IsDraft);
    this.tags.replaceAll(ensureArray(xmljs.Categories?.String).map(name => getTagByName(name)));
  }

  async markRead(read = true) {
    let request = new EWSUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendMeetingInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "IsRead", read, "message:IsRead");
    await this.folder.account.callEWS(request);
    await super.markRead(read);
  }

  async markStarred(starred = true) {
    let request = new EWSUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendMeetingInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "Flag", {
      t$CompleteDate: null,
      t$DueDate: null,
      t$StartDate: null,
      t$FlagStatus: starred ? "Flagged" : "NotFlagged",
    }, "item:Flag");
    await this.folder.account.callEWS(request);
    await super.markStarred(starred);
  }

  async markSpam(spam = true) {
    let request = {
      m$MarkAsJunk: {
        IsJunk: spam,
        MoveItem: false,
        m$ItemIds: {
          t$ItemId: {
            Id: this.itemID,
          },
        },
      },
    };
    await this.folder.account.callEWS(request);
    await super.markSpam(spam);
  }

  async markDraft(isDraft = true) {
    await super.markDraft(isDraft);
    let request = new EWSUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendMeetingInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "IsDraft", isDraft, "message:IsDraft");
    await this.folder.account.callEWS(request);
  }

  async deleteMessageOnServer() {
    let request = new EWSDeleteItemRequest(this.itemID, {SuppressReadReceipts: true});
    await this.folder.account.callEWS(request);
  }

  async addTagOnServer(tag: Tag) {
    await this.updateTags();
  }

  async removeTagOnServer(tag: Tag) {
    await this.updateTags();
  }

  async updateTags() {
    let request = new EWSUpdateItemRequest(this.itemID, {
      MessageDisposition: "SaveOnly",
      SendCalendarInvitationsOrCancellations: "SendToNone",
      SuppressReadReceipts: true,
    });
    request.addField("Message", "Categories", this.tags.hasItems ? { t$String: this.tags.contents.map(tag => tag.name) } : null, "item:Categories");
    await this.folder.account.callEWS(request);
  }

  getUpdateCalendars(): EWSCalendar[] {
    assert(this.scheduling && this.event, "Must have event to find calendar");
    if (this.folder.account.calendar && (this.scheduling == Scheduling.Request || this.folder.account.calendar.events.some(event => event.calUID == this.event.calUID))) {
      return [this.folder.account.calendar];
    }
    return [];
  }

  /** EWS only provides event data for invitations,
   * but not responses to invitations.
   * Disabled, but keeping the code, in case it will be useful later.
   *
   * `EMail.loadEvent()` works for all iTIP messages.
   * By not overriding `loadEvent()` here, `EMail.loadEvent()` will be called. */
  async loadEvent_disabled() {
    assert(this.scheduling == Scheduling.Request, "This is not an invitation");
    assert(!this.event, "Event has already been loaded");
    let request = {
      m$GetItem: {
        m$ItemShape: {
          t$BaseShape: "Default",
          t$BodyType: "Best",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "item:Body",
            }, {
              FieldURI: "item:ReminderIsSet",
            }, {
              FieldURI: "item:ReminderMinutesBeforeStart",
            }, {
              FieldURI: "item:LastModifiedTime",
            }, {
              FieldURI: "item:TextBody",
            }, {
              FieldURI: "calendar:IsAllDayEvent",
            }, {
              FieldURI: "calendar:MyResponseType",
            }, {
              FieldURI: "calendar:RequiredAttendees",
            }, {
              FieldURI: "calendar:OptionalAttendees",
            }, {
              FieldURI: "calendar:Recurrence",
            }, {
              FieldURI: "calendar:ModifiedOccurrences",
            }, {
              FieldURI: "calendar:DeletedOccurrences",
            }, {
              FieldURI: "calendar:UID",
            }, {
              FieldURI: "calendar:RecurrenceId",
            }],
          },
        },
        m$ItemIds: {
          t$ItemId: {
            Id: this.itemID,
          },
        },
      },
    };
    let result = await this.folder.account.callEWS(request);
    let event = new EWSEvent();
    event.fromXML(getEWSItem(result.Items));
    this.event = event;
  }
}

function setPersons(targetList: ArrayColl<PersonUID>, mailboxes: any): void {
  if (!mailboxes) {
    return;
  }
  targetList.replaceAll(ensureArray(mailboxes).map(mailbox => findOrCreatePersonUID(sanitize.emailAddress(mailbox.EmailAddress), sanitize.nonemptystring(mailbox.Name, null))));
}
