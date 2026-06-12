import { XMPPChat } from "./XMPPChat";
import { getBareJID } from "./XMPPAccount";
import type { XMPPChatMessage } from "./XMPPChatMessage";
import { ChatPerson } from "../ChatPerson";
import { Person } from "../../Abstract/Person";
import { Group } from "../../Abstract/Group";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { MAMFin, Paging, ReceivedMUCPresence } from "stanza/protocol";

/** A group chat room (XEP-0045 MUC), e.g. room@conference.example.com */
export class XMPPGroupChat extends XMPPChat {
  /** Our user's nickname in this room */
  nick: string;
  /** Nickname -> contact, for the people currently in the room.
   * They are also in `contact.participants`. */
  readonly memberByNick = new Map<string, Person>();
  /** Nickname -> contact, for everybody we ever saw in this room,
   * including past senders in old messages */
  protected readonly personByNick = new Map<string, Person>();
  /** Processes the room presences one by one, so that `join()`
   * can wait for the initial member list */
  protected occupantQueue: Promise<void> = Promise.resolve();
  /** The initial member list arrived, after we entered the room */
  protected joinDone = false;
  protected messageType: "chat" | "groupchat" = "groupchat";

  get group(): Group | null {
    return this.contact instanceof Group ? this.contact : null;
  }

  /** Enters the room on the server. The server then sends us the
   * current members as presences, and afterwards the live messages. */
  async join(): Promise<void> {
    this.nick ??= this.account.jid.split("@")[0];
    if (this.account.client.joinedRooms?.has(this.id)) {
      return;
    }
    this.joinDone = false;
    let pres = await this.account.client.joinRoom(this.id, this.nick);
    // the room may have changed our nickname, e.g. on conflicts
    this.nick = nickOfOccupant(pres.from) ?? this.nick;
    // XEP-0045 7.1: The members arrive before our own join presence
    await this.occupantQueue;
    this.joinDone = true;
    await this.save(); // also saves the members
  }

  /** A presence from the room arrived. Called by `XMPPAccount`. */
  onOccupantPresence(pres: ReceivedMUCPresence): void {
    this.occupantQueue = this.occupantQueue
      .then(() => pres.type == "unavailable"
        ? this.onOccupantLeft(pres)
        : this.onOccupantJoined(pres))
      .catch(this.account.errorCallback);
  }

  /** The members are in `contact.participants`, tracked live,
   * see `onOccupantJoined()` */
  async listMembers(): Promise<void> {
    let chatPersons = [...this.memberByNick.entries()].map(([nick, person]) => {
      let chatPerson = new ChatPerson("xmpp", `${this.id}/${nick}`, person.name);
      chatPerson.person = person;
      chatPerson.picture = person.picture;
      return chatPerson;
    });
    this.members.replaceAll(chatPersons);
  }

  /** An occupant is in the room: Sent when we join the room,
   * and when somebody enters it later. */
  protected async onOccupantJoined(pres: ReceivedMUCPresence): Promise<void> {
    let nick = nickOfOccupant(pres.from);
    if (!nick || nick == this.nick) {
      return; // that's our own user
    }
    // Anonymous rooms hide the real address of the members
    let realJID = getBareJID(pres.muc?.jid);
    let person = this.getMemberPerson(nick, realJID);
    this.memberByNick.set(nick, person);
    this.group?.participants.add(person);
    if (this.joinDone) {
      await this.save(); // persist the changed members
    }
  }

  protected async onOccupantLeft(pres: ReceivedMUCPresence): Promise<void> {
    let nick = nickOfOccupant(pres.from);
    if (!nick || nick == this.nick) {
      return;
    }
    let person = this.memberByNick.get(nick);
    this.memberByNick.delete(nick);
    if (person) {
      this.group?.participants.remove(person);
      if (this.joinDone) {
        await this.save();
      }
    }
  }

  /** The members live in the chat account's own address book,
   * deliberately *not* in the user's address books.
   * The same person is reused across rooms.
   * @param realJID The real address of the member, if the room discloses it */
  protected getMemberPerson(nick: string, realJID?: string): Person {
    let person = this.personByNick.get(nick);
    if (person) {
      return person;
    }
    let userID = realJID ?? `${this.id}/${nick}`;
    person = this.account.getPerson(userID, nick);
    this.personByNick.set(nick, person);
    return person;
  }

  /** The sender is the room member with this nickname.
   * Also senders who left the room long ago, in old messages. */
  fillSender(msg: XMPPChatMessage, from: string): void {
    let nick = nickOfOccupant(from);
    msg.outgoing = !!nick && nick == this.nick;
    if (!msg.outgoing && nick) {
      msg.contact = this.getMemberPerson(nick);
    }
  }

  /** Asks the room's own archive */
  protected async queryArchive(paging: Paging): Promise<MAMFin> {
    return await this.account.client.searchHistory(this.id, {
      paging: paging,
    });
  }
}

/** @returns the nickname from an occupant JID like "room@server/nickname" */
function nickOfOccupant(occupantJID: string): string | null {
  let jid = sanitize.nonemptystring(occupantJID, null);
  let slash = jid?.indexOf("/") ?? -1;
  return slash < 0 ? null : jid.substring(slash + 1);
}
