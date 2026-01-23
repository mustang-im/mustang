import { ChatRoom } from "../ChatRoom";
import type { MatrixAccount } from "./MatrixAccount";
import { ChatMessage, DeliveryStatus, UserChatMessage } from "../Message";
import { Group } from "../../Abstract/Group";
import { ChatRoomEvent, Invite, JoinLeave } from "../RoomEvent";
import { assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { MatrixPerson } from "./MatrixPerson";
import { convertTextToHTML, sanitizeHTML } from "../../util/convertHTML";

export class MatrixRoom extends ChatRoom {
  declare account: MatrixAccount;
  constructor(account: MatrixAccount) {
    super(account);
  }

  async listMembers(): Promise<void> {
  }

  async listMessages(): Promise<void> {
    let init = await this.account.client.roomInitialSync(this.id, 3000);
  }

  async getEvent(event): Promise<ChatMessage | null> {
    let type = event.getType();
    if (type == "m.room.message") {
      return this.getUserMessage(event);
    } else if (type == "m.room.redaction") {
      this.redactMessage(event);
      return null;
    } else if (type == "m.reaction") {
      this.getReaction(event);
      return null;
    } else if (type == "m.room.encrypted") {
      return await this.getEncryptedUserMessage(event);
    } else if (type == "m.room.member") {
      return this.getJoinLeaveInviteEvent(event);
    } else if (type == "m.room.name") {
      this.name = sanitize.nonemptylabel(event.name);
      await this.save();
      return null;
    } else if (type == "m.room.topic") {
      let textNode = event["@m.topic"]?.["@m.text"];
      console.log("Room topic", event.topic, "node", textNode);
      this.descriptionHTML =
        textNode?.mimetype?.startsWith("text/html")
          ? sanitizeHTML(textNode.body)
          : convertTextToHTML(sanitize.nonemptystring(event.topic));
      await this.save();
      return null;
    } else if (type == "m.room.power_levels" ||
      type == "m.room.encryption" ||
      type == "m.room.avatar" || // TODO Handle `{ url: "mxc://matrix.org/5646" }`
      type == "m.room.join_rules" ||
      type == "m.room.server_acl" ||
      type == "m.room.third_party_invite" ||
      type == "m.room.history_visibility" ||
      type == "m.room.guest_access") {
      return null;
    } else {
      return this.getShowRawEvent(event);
    }
  }
  fillMessage(event, msg: ChatMessage): void {
    msg.id = event.event?.event_id;
    msg.sent = msg.received = new Date(event.getTs());
    let senderUserID = event.getSender();
    msg.contact = this.account.getExistingPerson(senderUserID);
    msg.outgoing = senderUserID == this.account.globalUserID;
  }

  getUserMessage(event): ChatMessage | null {
    let relation = event.getRelation();
    if (relation?.rel_type == "m.replace") {
      // <https://github.com/matrix-org/matrix-spec-proposals/blob/main/proposals/2676-message-editing.md>
      let orgID = sanitize.nonemptystring(relation.event_id);
      let orgMessage = this.messages.find(m => m.id == orgID);
      if (orgMessage) { // In case we're live and received the original - TODO untested
        console.log("replacement message", event.getContent());
        let content = event.getContent()["m.new_content"];
        orgMessage.text = content.body;
        orgMessage.rawHTMLDangerous = content.formatted_body;
      }
      return null;
    }
    let replacedBy = event.replacingEvent(); // In case we're restoring history from server, which merges the replacement in
    if (replacedBy) {
      event = replacedBy;
    }
    let msg = new UserChatMessage(this);
    this.fillMessage(event, msg);
    msg.deliveryStatus = msg.outgoing ? DeliveryStatus.User : DeliveryStatus.Server;
    let content = event.getContent();
    if (replacedBy) {
      content = content["m.new_content"];
    }
    msg.text = content.body;
    msg.rawHTMLDangerous = content.formatted_body;
    return msg;
  }

  async getEncryptedUserMessage(event): Promise<ChatMessage | null> {
    await this.account.client.decryptEventIfNeeded(event);
    return this.getUserMessage(event);
  }

  redactMessage(event): void {
    // TODO
  }

  getReaction(event): void {
    let orgID = event.event.TODO;
    this.messages.find(m => m.id == orgID);
    let senderUserID = event.getSender();
    let person = this.account.getExistingPerson(senderUserID);
    assert(person, "Reaction: Sender not found: " + senderUserID);
    let data = event.event?.content["m.relates_to"];
    assert(data?.rel_type == "m.annotation", "Unknown reaction type " + data?.rel_type);
    let emoji = data.key;
    let reactTo = this.messages.find(msg => msg.id == data.event_id);
    if (!reactTo) {
      // might be reacting to an older message which is not in our history
      return;
    }
    assert(reactTo instanceof UserChatMessage, "Reacting to something that is not a message");
    reactTo.reactions.set(person, emoji);
  }

  getJoinLeaveInviteEvent(event): ChatMessage {
    let data = event.event.content;
    let senderUserID = event.getSender();
    let person = this.account.getExistingPerson(senderUserID);
    if (!person) {
      person = new MatrixPerson(senderUserID, event.displayname);
      person.picture = event.avatar_url; // may be null
    }

    if (data.membership == "join" || data.membership == "leave") {
      let msg = new JoinLeave(this);
      msg.join = data.membership == "join";
      let group = this.contact;
      if (group instanceof Group) {
        if (msg.join) {
          group.participants.add(person);
        } else {
          group.participants.remove(person);
        }
      } else {
        // TODO change to group
      }
      this.fillMessage(event, msg);
      msg.text = (msg.join ? "%person% joined" : "%person% left the room")
        .replace("%person%", person.name);
      msg.html = `<span class="joinleave">` +
        (msg.join ? "%person% joined" : "%person% left the room")
          .replace("%person%", `<span class="person">${person.name}</span>`) +
        `</span>`;
      return msg;
    } else if (data.membership == "invite") {
      let msg = new Invite(this);
      this.fillMessage(event, msg);
      msg.text = "%person% is invited to this room"
        .replace("%person%", person.name);
      msg.html = `<span class="invite">` +
        "%person% is invited to this room"
          .replace("%person%", `<span class="person">${person.name}</span>`) +
        `</span>`;
      return msg;
    } else {
      return this.getShowRawEvent(event);
    }
  }

  getShowRawEvent(event): ChatMessage {
    let msg = new ChatRoomEvent(this);
    this.fillMessage(event, msg);
    let json = JSON.stringify(event.event?.content ?? event, null, 2);
    msg.text = json.substring(2, json.length - 2);
    msg.html =
      `<div>
        <h4>${event.getType()}</h4>
        <pre>${msg.text}</pre>
      </div>`;
    return msg;
  }

  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.add(message);
    //console.log("Sending", message.text, "to", this.name);
    //this.account.client.encryptAndSendToDevices();
    let response = await this.account.client.sendHtmlMessage(this.id, message.text, message.html);
    message.id = response.event_id;
    // By the time send() returns async, the server already sent us the message to the room
    this.messages.remove(message);
  }
}
