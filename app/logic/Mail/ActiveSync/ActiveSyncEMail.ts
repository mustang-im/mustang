import { EMail } from "../EMail";
import type { ActiveSyncFolder } from "./ActiveSyncFolder";
import { ActiveSyncError } from "./ActiveSyncError";
import { ActiveSyncEvent } from "../../Calendar/ActiveSync/ActiveSyncEvent";
import { type Tag, getTagByName } from "../Tag";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../../Calendar/Invitation";
import { ensureArray, assert, NotSupported } from "../../util/util";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";
import { parseOneAddress, parseAddressList, type ParsedMailbox } from "email-addresses";

const ExchangeScheduling: Record<string, number> = {
  "IPM.Schedule.Meeting.Resp.Pos": InvitationMessage.ParticipantReply,
  "IPM.Schedule.Meeting.Resp.Tent": InvitationMessage.ParticipantReply,
  "IPM.Schedule.Meeting.Resp.Neg": InvitationMessage.ParticipantReply,
  "IPM.Schedule.Meeting.Request": InvitationMessage.Invitation,
  "IPM.Schedule.Meeting.Canceled": InvitationMessage.CancelledEvent,
};

const ActiveSyncResponse: Record<InvitationResponseInMessage, number> = {
  [InvitationResponse.Accept]: 1,
  [InvitationResponse.Tentative]: 2,
  [InvitationResponse.Decline]: 3,
};

export class ActiveSyncEMail extends EMail {
  folder: ActiveSyncFolder;

  get serverID(): string | null {
    return this.pID as string | null;
  }
  set serverID(val: string | null) {
    assert(val == null || typeof (val) == "string", "ActiveSync EMail serverID must be a string");
    this.pID = val;
  }

  async download() {
    let request = {
      Fetch: {
        Store: "Mailbox",
        ServerId: this.serverID,
        CollectionId: this.folder.id,
        Options: {
          MIMESupport: "2",
          BodyPreference: {
            Type: "4",
          },
        },
      },
    };
    let response = await this.folder.account.callEAS("ItemOperations", request);
    if (response.Response.Fetch.Status != "1") {
      throw new ActiveSyncError("ItemOperations", response.Response.Fetch.Status, this.folder?.account);
    }
    this.mime = response.Response.Fetch.Properties.Body.RawData;
    await this.parseMIME();
    await this.saveCompleteMessage();
  }

  fromWBXML(wbxmljs: any) {
    this.subject = sanitize.nonemptystring(wbxmljs.Subject, "");
    this.received = sanitize.date(wbxmljs.DateReceived, new Date());
    this.sent = this.received; // ActiveSync only supports received date
    this.setFlags(wbxmljs);
    let from = (parseOneAddress(wbxmljs.From) || parseOneAddress(wbxmljs.Sender) || { name: "Unknown", address: "unknown@invalid" }) as ParsedMailbox;
    this.from = findOrCreatePersonUID(from.address, from.name);
    this.outgoing = this.folder?.account.identities.some(id => id.isEMailAddress(this.from.emailAddress));
    setPersons(this.to, wbxmljs.To);
    setPersons(this.cc, wbxmljs.Cc);
    setPersons(this.bcc, wbxmljs.Bcc);
    this.contact = this.outgoing ? this.to.first : this.from;
    this.scheduling = ExchangeScheduling[wbxmljs.MessageClass] || InvitationMessage.None;
    /* Can't use this data because the description is missing.
    if (wbxmljs.MeetingRequest) {
      let event = new ActiveSyncEvent();
      event.fromWBXML(wbxmljs.MeetingRequest);
      this.event = event;
    }
    */
  }

  setFlags(wbxmljs: any) {
    this.isRead = wbxmljs.Read != "0";
    this.isStarred = wbxmljs.Flag?.Status == "2";
    if (this.folder.account.protocolVersion == "16.1") {
      this.isDraft = wbxmljs.IsDraft != "0";
    }
    this.tags.clear();
    if (wbxmljs.Categories) {
      this.tags.addAll(ensureArray(wbxmljs.Categories.Category).map(name => getTagByName(name)));
    }
  }

  async markRead(read = true) {
    let data = {
      GetChanges: "0",
      Commands: {
        Change: {
          ServerId: this.serverID,
          ApplicationData: {
            Read: read ? "1" : "0",
          },
        },
      },
    };
    let response = await this.folder.makeSyncRequest(data);
    if (response.Responses) {
      throw new ActiveSyncError("Sync", response.Responses.Change.Status, this.folder?.account);
    }
    await super.markRead(read);
  }

  async markStarred(starred = true) {
    let data = {
      GetChanges: "0",
      Commands: {
        Change: {
          ServerId: this.serverID,
          ApplicationData: {
            Flag: starred ? { Status: "2", FlagType: "for Follow Up" } : {},
          },
        },
      },
    };
    let response = await this.folder.makeSyncRequest(data);
    if (response.Responses) {
      throw new ActiveSyncError("Sync", response.Responses.Change.Status, this.folder?.account);
    }
    await super.markStarred(starred);
  }

  //markSpam(spam = true) {
  //}

  async markDraft(isDraft = true) {
    throw new NotSupported("Drafts are not supported by ActiveSync 14.1");
    // ActiveSync 16 apparently does let you create drafts.
    // And only drafts.
  }

  async deleteMessageOnServer() {
    let data = {
      DeletesAsMoves: "1",
      GetChanges: "0",
      Commands: {
        Delete: {
          ServerId: this.serverID,
        },
      },
    };
    let response = await this.folder.makeSyncRequest(data);
    if (response.Responses) {
      throw new ActiveSyncError("Sync", response.Responses.Delete.Status, this.folder?.account);
    }
  }

  async addTagOnServer(tag: Tag) {
    await this.updateTags();
  }

  async removeTagOnServer(tag: Tag) {
    await this.updateTags();
  }

  async updateTags() {
    let data = {
      GetChanges: "0",
      Commands: {
        Change: {
          ServerId: this.serverID,
          ApplicationData: {
            Categories: {
              Category: this.tags.contents.map(tag => tag.name),
            },
          },
        },
      },
    };
    let response = await this.folder.makeSyncRequest(data);
    if (response.Responses) {
      throw new ActiveSyncError("Sync", response.Responses.Change.Status, this.folder?.account);
    }
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.scheduling == InvitationMessage.Invitation, "Only invitations can be responded to");
    let request = {
      Request: {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: this.folder.id,
        ReqeustId: this.serverID,
      },
    };
    await this.folder.account.callEAS("MeetingResponse", request);
    await super.sendInvitationResponse(response); // needs 16.x to do this automatically
    await this.deleteMessageLocally(); // Exchange deletes the message from the inbox
  }

  /** ActiveSync only does not provide complete event data.
   * At least attendees are missing.
   * Disabled, but keeping the code, in case it will be useful later.
   *
   * `EMail.loadEvent()` works for all iTIP messages.
   * By not overriding `loadEvent()` here, `EMail.loadEvent()` will be called. */
  async loadEvent_disabled() {
    assert(this.scheduling, "This is not an invitation or response");
    assert(!this.event, "Event has already been loaded");
    let request = {
      Fetch: {
        Store: "Mailbox",
        ServerId: this.serverID,
        CollectionId: this.folder.id,
        Options: {
          BodyPreference: {
            Type: "2",
          },
        },
      },
    };
    let result = await this.folder.account.callEAS("ItemOperations", request);
    if (result.Response.Fetch.Status != "1") {
      throw new ActiveSyncError("ItemOperations", result.Response.Fetch.Status, this.folder?.account);
    }
    let event = new ActiveSyncEvent();
    // When fetching an invitation or response, ActiveSync splits up the
    // calendar-specific properties, so we need to merge them again.
    event.fromWBXML({ ...result.Response.Fetch.Properties.MeetingRequest, ...result.Response.Fetch.Properties });
    // ActiveSync only tells us the organiser, not the full list of attendees
    setPersons(event.participants, result.Response.Fetch.Properties.MeetingRequest.Organizer);
    this.event = event;
  }
}

function setPersons(targetList: ArrayColl<PersonUID>, addresses: string): void {
  let list = parseAddressList(addresses);
  if (!list) {
    return;
  }
  targetList.replaceAll(list.map((mailbox: ParsedMailbox) => findOrCreatePersonUID(mailbox.address, mailbox.name)));
}
