import { EMail } from "../EMail";
import { type EWSFolder, getEWSItem } from "./EWSFolder";
import { Attachment, ContentDisposition } from "../Attachment";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { appGlobal } from "../../app";
import { base64ToArrayBuffer, assert } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

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
    let mimeBase64 = getEWSItem(result.Items).MimeContent.Value;
    this.mime = new Uint8Array(await base64ToArrayBuffer(mimeBase64, "message/rfc822"));
    await this.parseMIME();
    await this.save();
  }

  fromXML(xmljs) {
    this.itemID = xmljs.ItemId.Id;
    if ("InternetMessageId" in xmljs) {
      this.id = xmljs.InternetMessageId;
    }
    if ("Subject" in xmljs) {
      this.subject = xmljs.Subject;
    }
    if ("DateTimeSent" in xmljs) {
      this.sent = new Date(xmljs.DateTimeSent);
    }
    if ("DateTimeReceived" in xmljs) {
      this.received = new Date(xmljs.DateTimeReceived);
    }
    this.setFlags(xmljs);
    if ("InReplyTo" in xmljs) {
      this.inReplyTo = xmljs.InReplyTo;
    }
    if ("References" in xmljs) {
      this.references = xmljs.References;
    }
    if ("ReplyTo" in xmljs) {
      this.replyTo = findOrCreatePersonUID(xmljs.ReplyTo.Mailbox.EmailAddress, xmljs.ReplyTo.Mailbox.Name);
    }
    if ("From" in xmljs) {
      this.from = findOrCreatePersonUID(xmljs.From.Mailbox.EmailAddress, xmljs.From.Mailbox.Name);
      this.outgoing = appGlobal.me.emailAddresses.some(e => e.value == this.from.emailAddress);
    } else if ("Sender" in xmljs) {
      this.from = findOrCreatePersonUID(xmljs.Sender.Mailbox.EmailAddress, xmljs.Sender.Mailbox.Name);
      this.outgoing = appGlobal.me.emailAddresses.some(e => e.value == this.from.emailAddress);
    }
    setPersons(this.to, xmljs.ToRecipients?.Mailbox);
    setPersons(this.cc, xmljs.CcRecipients?.Mailbox);
    setPersons(this.bcc, xmljs.BccRecipients?.Mailbox);
    this.contact = this.outgoing ? this.to.first : this.from;
  }

  /** Get body and attachments from Exchange.
   * This is an alternative to parsing MIME.
   * @see EWSFolder GetItem server call. */
  bodyAndAttachmentsFromXML(xmljs) {
    assert(this.itemID == xmljs.ItemId.Id, "EWS EMail ItemID doesn't match");
    if (xmljs.Body?.BodyType == "Text") {
      this.text = xmljs.Body.Value;
    } else {
      if (xmljs.TextBody) {
        this.text = xmljs.TextBody.Value;
      }
      if (xmljs.Body?.BodyType == "HTML") {
        this.html = xmljs.Body.Value;
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
    this.isRead = xmljs.IsRead == "true";
    this.isNewArrived = xmljs.ExtendedProperty?.Value == 0xFFFFFFFF; // -1?
    this.isReplied = xmljs.ExtendedProperty?.Value == 0x105;
    this.isStarred = xmljs.Flag?.FlagStatus == "Flagged";
    // can't work out how to find junk status
    this.isDraft = xmljs.IsDraft == "true";
  }

  async markRead(read = true) {
    let request = {
      m$UpdateItem: {
        m$ItemChanges: {
          t$ItemChange: {
            t$ItemId: {
              Id: this.itemID,
            },
            t$Updates: {
              t$SetItemField: {
                t$FieldURI: {
                  FieldURI: "message:IsRead",
                },
                t$Message: {
                  t$IsRead: read,
                },
              },
            },
          },
        },
        ConflictResolution: "AlwaysOverwrite",
        MessageDisposition: "SaveOnly",
        SendMeetingInvitationsOrCancellations: "SendToNone",
        SuppressReadReceipts: true,
      },
    };
    await this.folder.account.callEWS(request);
    await super.markRead(read);
  }

  async markStarred(starred = true) {
    let request = {
      m$UpdateItem: {
        m$ItemChanges: {
          t$ItemChange: {
            t$ItemId: {
              Id: this.itemID,
            },
            t$Updates: {
              t$SetItemField: {
                t$FieldURI: {
                  FieldURI: "item:Flag",
                },
                t$Item: {
                  t$Flag: {
                    t$CompleteDate: null,
                    t$DueDate: null,
                    t$StartDate: null,
                    t$FlagStatus: starred ? "Flagged" : "notFlagged",
                  },
                },
              },
            },
          },
        },
        ConflictResolution: "AlwaysOverwrite",
        MessageDisposition: "SaveOnly",
        SendMeetingInvitationsOrCancellations: "SendToNone",
        SuppressReadReceipts: true,
      },
    };
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

  async markDraft() {
    let request = {
      m$UpdateItem: {
        m$ItemChanges: {
          t$ItemChange: {
            t$ItemId: {
              Id: this.itemID,
            },
            t$Updates: {
              t$SetItemField: {
                t$FieldURI: {
                  FieldURI: "message:IsDraft",
                },
                t$Message: {
                  t$IsDraft: true,
                },
              },
            },
          },
        },
        ConflictResolution: "AlwaysOverwrite",
        MessageDisposition: "SaveOnly",
        SendMeetingInvitationsOrCancellations: "SendToNone",
        SuppressReadReceipts: true,
      },
    };
    await this.folder.account.callEWS(request);
    await super.markDraft();
  }

  async deleteMessageOnServer() {
    let request = {
      m$DeleteItem: {
        m$ItemIds: {
          t$ItemId: {
            Id: this.itemID,
          },
        },
      },
      DeleteType: "MoveToDeletedItems",
      SuppressReadReceipts: true,
    };
    await this.folder.account.callEWS(request);
  }
}

function setPersons(targetList: ArrayColl<PersonUID>, mailboxes: any): void {
  if (!mailboxes) {
    return;
  }
  targetList.replaceAll(ensureArray(mailboxes).map(mailbox => findOrCreatePersonUID(mailbox.EmailAddress, mailbox.Name)));
}

export function ensureArray<Type>(val: Type[] | Type): Type[] {
  return val ? Array.isArray(val) ? val : [val] : [];
}
