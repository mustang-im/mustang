// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { EMail } from "../EMail";
import type { ActiveSyncFolder } from "./ActiveSyncFolder";
import { EASError } from "./ActiveSyncAccount";
import { ActiveSyncEvent } from "../../Calendar/ActiveSync/ActiveSyncEvent";
import { type Tag, getTagByName } from "../Tag";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { Scheduling, type Responses } from "../../Calendar/Invitation";
import { ensureArray, assert, NotSupported } from "../../util/util";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";
import { parseOneAddress, parseAddressList, type ParsedMailbox } from "email-addresses";

const ExchangeScheduling: Record<string, number> = {
  "IPM.Schedule.Meeting.Resp.Pos": Scheduling.Accepted,
  "IPM.Schedule.Meeting.Resp.Tent": Scheduling.Tentative,
  "IPM.Schedule.Meeting.Resp.Neg": Scheduling.Declined,
  "IPM.Schedule.Meeting.Request": Scheduling.Request,
  "IPM.Schedule.Meeting.Canceled": Scheduling.Cancellation,
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
      throw new EASError("ItemOperations", response.Response.Fetch.Status);
    }
    this.mime = response.Response.Fetch.Properties.Body.RawData;
    await this.parseMIME();
    await this.saveCompleteMessage();
  }

  fromWBXML(wbxmljs: any) {
    this.subject = sanitize.nonemptystring(wbxmljs.Subject, "");
    if (wbxmljs.DateReceived) {
      this.received = sanitize.date(wbxmljs.DateReceived);
    } else {
      this.received = new Date();
    }
    this.sent = this.received; // ActiveSync only supports received date
    this.setFlags(wbxmljs);
    let from = (parseOneAddress(wbxmljs.From) || parseOneAddress(wbxmljs.Sender) || { name: "Unknown", address: "unknown@invalid" }) as ParsedMailbox;
    this.from = findOrCreatePersonUID(from.address, from.name);
    this.outgoing = appGlobal.me.emailAddresses.some(e => e.value == this.from.emailAddress);
    setPersons(this.to, wbxmljs.To);
    setPersons(this.cc, wbxmljs.Cc);
    setPersons(this.bcc, wbxmljs.Bcc);
    this.contact = this.outgoing ? this.to.first : this.from;
    this.scheduling = ExchangeScheduling[wbxmljs.MessageClass] || Scheduling.None;
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
      throw new EASError("Sync", response.Responses.Change.Status);
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
      throw new EASError("Sync", response.Responses.Change.Status);
    }
    await super.markStarred(starred);
  }

  //markSpam(spam = true) {
  //}

  async markDraft() {
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
      throw new EASError("Sync", response.Responses.Delete.Status);
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
      throw new EASError("Sync", response.Responses.Change.Status);
    }
  }

  async respondToInvitation(response: Responses): Promise<void> {
    assert(this.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let request = {
      Request: {
        UserResponse: response,
        CollectionId: this.folder.id,
        ReqeustId: this.serverID,
      },
    };
    await this.folder.account.callEAS("MeetingResponse", request);
    await super.sendInvitationResponse(response); // needs 16.x to do this automatically
    await this.deleteMessageLocally(); // Exchange deletes the message from the inbox
  }

  async loadEvent() {
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
      throw new EASError("ItemOperations", result.Response.Fetch.Status);
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
