import { EMail } from "../EMail";
import type { ActiveSyncFolder } from "./ActiveSyncFolder";
import { EASError } from "./ActiveSyncAccount";
import { type Tag, getTagByName } from "../Tag";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { ensureArray, assert, NotSupported } from "../../util/util";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";
import { parseOneAddress, parseAddressList, type ParsedMailbox } from "email-addresses";

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
    let response = await this.folder.queuedSyncRequest(data);
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
    let response = await this.folder.queuedSyncRequest(data);
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
    let response = await this.folder.queuedSyncRequest(data);
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
    let response = await this.folder.queuedSyncRequest(data);
    if (response.Responses) {
      throw new EASError("Sync", response.Responses.Change.Status);
    }
  }
}

function setPersons(targetList: ArrayColl<PersonUID>, addresses: string): void {
  let list = parseAddressList(addresses);
  if (!list) {
    return;
  }
  targetList.replaceAll(list.map((mailbox: ParsedMailbox) => findOrCreatePersonUID(mailbox.address, mailbox.name)));
}
