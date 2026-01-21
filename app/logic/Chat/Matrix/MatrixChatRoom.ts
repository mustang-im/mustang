import { Chat } from "../Chat";
import type { MatrixAccount } from "./MatrixAccount";
import { ChatMessage, DeliveryStatus, UserChatMessage } from "../Message";
import { ChatPerson } from "../Person";
import { Invite, JoinLeave } from "../RoomEvent";
import { assert } from "../../util/util";
import { Group } from "../../Abstract/Group";

export class MatrixChatRoom extends Chat {
  declare account: MatrixAccount;
  constructor(account: MatrixAccount) {
    super(account);
  }

  async listMembers(): Promise<void> {
  }

  async listMessages(): Promise<void> {
    let init = await this.account.client.roomInitialSync(this.id, 3000);
  }

  getUserMessage(event): ChatMessage {
    let msg = new UserChatMessage(this);
    this.account.fillMessage(event, msg);
    msg.deliveryStatus = msg.outgoing ? DeliveryStatus.User : DeliveryStatus.Server;
    let content = event.getContent();
    msg.text = content.body;
    msg.html = content.formatted_body ?? content.body.replace("\n", "<br>");
    return msg;
  }

  async getEncryptedUserMessage(event): Promise<ChatMessage> {
    await this.account.client.decryptEventIfNeeded(event);
    return this.getUserMessage(event);
  }

  redactMessage(event, chatRoom: MatrixChatRoom): void {
    // TODO
  }

  getReaction(event): void {
    let orgID = event.event.TODO;
    this.messages.find(m => m.id == orgID);
    let senderUserID = event.getSender();
    let person = this.account.getExistingPerson(senderUserID);
    assert(person, "Reaction: Sender not found: " + senderUserID);
    let data = event.event?.content["m.relates_to"];
    assert(data.rel_type == "m.annotation", "Unknown reaction type " + data.rel_type);
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
      person = new ChatPerson();
      person.name = event.displayname;
      person.picture = event.avatar_url; // may be null
      //appGlobal.persons.add(person);
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
      this.account.fillMessage(event, msg);
      msg.text = (msg.join ? "%person% joined" : "%person% left the room")
        .replace("%person%", person.name);
      msg.html = `<span class="joinleave">` +
        (msg.join ? "%person% joined" : "%person% left the room")
          .replace("%person%", `<span class="person">${person.name}</span>`) +
        `</span>`;
      return msg;
    } else if (data.membership == "invite") {
      let msg = new Invite(this);
      this.account.fillMessage(event, msg);
      msg.text = "%person% is invited to this room"
        .replace("%person%", person.name);
      msg.html = `<span class="invite">` +
        "%person% is invited to this room"
          .replace("%person%", `<span class="person">${person.name}</span>`) +
        `</span>`;
      return msg;
    } else {
      return this.account.getGenericChatRoomEvent(event);
    }
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
