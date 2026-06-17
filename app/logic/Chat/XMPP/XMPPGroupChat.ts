import { XMPPChat } from "./XMPPChat";
import { getBareJID } from "./XMPPAccount";
import type { XMPPChatMessage } from "./XMPPChatMessage";
import { XMPPPerson } from "./XMPPPerson";
import { Group } from "../../Abstract/Group";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { Message, MAMFin, Paging, ReceivedMUCPresence } from "stanza/protocol";

/** A group chat room (XEP-0045 MUC), e.g. room@conference.example.com.
 *
 * Occupants are tracked live from presence (not from the address book), since
 * they come and go and many rooms are anonymous. Each occupant is a `Person` in
 * the chat account's own (unsaved) address book, reused across rooms; their name
 * and JID are stored on each message so old senders survive a restart. */
export class XMPPGroupChat extends XMPPChat {
  /** Our user's nickname in this room */
  nick: string;
  /** Nickname -> contact, for the people currently in the room.
   * They are also in `members`. */
  readonly memberByNick = new Map<string, XMPPPerson>();
  /** Nickname -> contact, for everybody we ever saw in this room,
   * including past senders in old messages */
  protected readonly personByNick = new Map<string, XMPPPerson>();
  /** Processes the room presences one by one, so that `join()`
   * can wait for the initial member list */
  protected occupantQueue: Promise<void> = Promise.resolve();
  /** The initial member list arrived, after we entered the room */
  protected joinDone = false;
  messageType: "chat" | "groupchat" = "groupchat";

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
    // Our own affiliation/role in the room (XEP-0045): owners/admins, or a
    // moderator, may retract other people's messages.
    let affiliation = pres.muc?.affiliation;
    this.isAdmin = affiliation == "owner" || affiliation == "admin" || pres.muc?.role == "moderator";
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

  /** The members are already tracked live, see `onOccupantJoined()` */
  async listMembers(): Promise<void> {
    this.members.replaceAll([...this.memberByNick.values()]);
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
    await this.listMembers();
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
      await this.listMembers();
      if (this.joinDone) {
        await this.save();
      }
    }
  }

  /** @param realJID The real address of the member, if the room discloses it */
  protected getMemberPerson(nick: string, realJID?: string): XMPPPerson {
    let person = this.personByNick.get(nick);
    if (person) {
      return person;
    }
    let userID = realJID ?? `${this.id}/${nick}`;
    person = this.account.getPersonUID(userID, nick);
    this.personByNick.set(nick, person);
    return person;
  }

  /** The sender (`from`) is the room member with this nickname (also senders who
   * left the room long ago, in old messages); our own messages are from us.
   * `contact` stays the room's Group. */
  fillSender(msg: XMPPChatMessage, from: string): void {
    let nick = nickOfOccupant(from);
    msg.outgoing = !!nick && nick == this.nick;
    if (msg.outgoing) {
      msg.from = this.account.getOwnContact();
    } else if (nick) {
      msg.from = this.getMemberPerson(nick);
    }
    // else: a message from the room itself (no occupant) — leave `from` unset;
    // `contact` (the Group) shows it.
  }

  /** The room subject (XEP-0045 §8.1) — its topic, shown as the description. */
  onSubject(subject: string | undefined): void {
    this.descriptionHTML = sanitize.nonemptystring(subject, "");
  }

  // --- subclass hooks for OMEMO and message references ---

  protected messageSender(json: Message): XMPPPerson {
    let nick = nickOfOccupant(json.from);
    return (!nick || nick == this.nick ? this.account.getOwnContact() : this.getMemberPerson(nick)) as XMPPPerson;
  }

  /** OMEMO encrypts to each member's real JID — only known in a non-anonymous,
   * members-only room. */
  protected omemoRecipientJIDs(): string[] {
    let jids = new Set<string>();
    for (let person of this.memberByNick.values()) {
      let userID = realJIDOf(person);
      if (userID) {
        jids.add(userID);
      }
    }
    return [...jids];
  }

  /** For OMEMO, the session is keyed by the sender's real JID, not their nick. */
  protected senderJID(json: Message): string {
    let nick = nickOfOccupant(json.from);
    let person = nick ? this.memberByNick.get(nick) ?? this.personByNick.get(nick) : null;
    return (person && realJIDOf(person)) ?? getBareJID(json.from);
  }

  /** In a MUC, reactions/markers reference the room's stanza ID (XEP-0359),
   * which all occupants see, not the sender's own message ID. */
  referenceID(message: XMPPChatMessage): string {
    return message.stanzaID ?? message.id;
  }

  /** Group messages carry an origin-id so we recognize the room's reflection of
   * our own message; they don't use 1:1 delivery receipts or read markers. */
  protected decorateOutgoing(stanza: Message): void {
    stanza.originId = stanza.id;
  }

  /** Asks the room's own archive */
  protected async queryArchive(paging: Paging): Promise<MAMFin> {
    return await this.account.client.searchHistory(this.id, { paging });
  }
}

/** @returns the nickname from an occupant JID like "room@server/nickname" */
function nickOfOccupant(occupantJID: string): string | null {
  let jid = sanitize.nonemptystring(occupantJID, null);
  let slash = jid?.indexOf("/") ?? -1;
  return slash < 0 ? null : jid.substring(slash + 1);
}

/** A member's real bare JID, if known (not an anonymous `room/nick` placeholder) */
function realJIDOf(person: XMPPPerson): string | null {
  let userID = person.chatID;
  return userID && userID.includes("@") && !userID.includes("/") ? getBareJID(userID) : null;
}
