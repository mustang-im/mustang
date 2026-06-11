import { XMPPChat } from "./XMPPChat";
import type { XMPPChatMessage } from "./XMPPChatMessage";
import { ChatPerson } from "../ChatPerson";
import { Person } from "../../Abstract/Person";
import { SQLChatMessage } from "../SQL/SQLChatMessage";
import { Lock } from "../../util/flow/Lock";
import { ArrayColl } from "svelte-collections";
import type { MAMResult } from "stanza/protocol";

const kPageSize = 50;

export class XMPP1to1Chat extends XMPPChat {
  protected readonly syncLock = new Lock();
  async listMembers(): Promise<void> {
    if (!(this.contact instanceof Person)) {
      return;
    }
    let chatPerson = new ChatPerson("xmpp", this.id, this.contact.name);
    chatPerson.person = this.contact;
    chatPerson.picture = this.contact.picture;
    this.members.replaceAll([chatPerson]);
  }

  /** Shows the messages from our DB, then gets new messages from the
   * server archive (XEP-0313), skipping those already in our DB. */
  async listMessages(): Promise<void> {
    let lock = await this.syncLock.lock();
    try {
      await this.readMessagesFromDB();
      if (!this.account.isLoggedIn || !this.account.hasMAM) {
        return;
      }
      if (this.syncState) {
        await this.listNewMessages();
      } else {
        await this.listLastMessages();
      }
    } finally {
      lock.release();
    }
  }

  protected async readMessagesFromDB(): Promise<void> {
    if (this.messages.hasItems || !this.dbID) {
      return;
    }
    await SQLChatMessage.readAll(this);
    this.lastMessage = this.messages.contents
      .reduce((last, msg) => !last || msg.sent > last.sent ? msg : last, null);
  }

  /** First sync: Gets the newest page of the server archive.
   * TODO Page further back, to get the older history. */
  protected async listLastMessages(): Promise<void> {
    let result = await this.searchArchive({ max: kPageSize, before: "" });
    if (!result) {
      return;
    }
    let newMessages = this.parseMessages(result.results);
    await this.saveNewMessages(newMessages.contents);
    if (result.paging?.last) {
      this.syncState = result.paging.last;
      await this.save();
    }
  }

  /** Gets the messages that are newer than the newest one in our DB.
   * The server skips everything older, so this is fast and cheap. */
  protected async listNewMessages(): Promise<void> {
    let after = this.syncState;
    while (true) {
      let result = await this.searchArchive({ max: kPageSize, after });
      if (!result) { // syncState too old: server forgot that message
        this.syncState = null;
        return await this.listLastMessages();
      }
      let newMessages = this.parseMessages(result.results);
      await this.saveNewMessages(newMessages.contents);
      after = result.paging?.last ?? after;
      if (result.complete || !result.results?.length) {
        break;
      }
    }
    if (after != this.syncState) {
      this.syncState = after;
      await this.save();
    }
  }

  /** @returns null, if the paging window is gone on the server */
  protected async searchArchive(paging: { max: number, before?: string, after?: string }) {
    try {
      return await this.account.client.searchHistory({
        with: this.id,
        paging: paging,
      });
    } catch (ex) {
      // stanza rejects with the error IQ stanza, not an `Error`
      let condition = ex?.error?.condition ?? "";
      if (condition == "item-not-found") {
        return null;
      }
      if (condition == "service-unavailable" || condition == "feature-not-implemented") {
        this.account.hasMAM = false;
      }
      throw ex instanceof Error ? ex
        : new Error(`Failed to get the chat history of ${this.name}: ${condition || JSON.stringify(ex)}`);
    }
  }

  protected parseMessages(results: MAMResult[] = []): ArrayColl<XMPPChatMessage> {
    let newMessages = new ArrayColl<XMPPChatMessage>();
    for (let result of results) {
      try {
        let msg = this.addMessage(result.item?.message, result.item, result.id);
        if (msg) {
          newMessages.add(msg);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
    // results within a MAM page are in chronological order
    let newest = newMessages.last;
    if (newest && (!this.lastMessage || newest.sent >= this.lastMessage.sent)) {
      this.lastMessage = newest;
    }
    return newMessages;
  }
}
