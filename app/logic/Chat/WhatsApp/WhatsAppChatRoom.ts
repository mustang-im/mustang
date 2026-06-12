import { ChatRoom } from "../ChatRoom";
import { WhatsAppChatMessage } from "./WhatsAppChatMessage";
import { WhatsAppRoomEvent } from "./WhatsAppRoomEvent";
import { type ChatRoomEvent, RoomEventKind } from "../RoomEvent";
import { ChatPerson } from "../ChatPerson";
import type { Person } from "../../Abstract/Person";
import { Group } from "../../Abstract/Group";
import { SQLChatMessage } from "../SQL/SQLChatMessage";

export class WhatsAppChatRoom extends ChatRoom {
  async listMembers(): Promise<void> {
    let persons = this.contact instanceof Group
      ? this.contact.participants.contents
      : [this.contact as any as Person];
    this.members.replaceAll(persons.map(person => chatPersonFor(person)));
  }

  async listMessages(): Promise<void> {
    if (this.messages.hasItems) {
      return;
    }
    await SQLChatMessage.readAll(this);
    this.lastMessage = this.messages.contents
      .filter((msg): msg is WhatsAppChatMessage => msg instanceof WhatsAppChatMessage)
      .reduce((last, msg) => !last || msg.sent > last.sent ? msg : last, null);
  }

  newMessage(): WhatsAppChatMessage {
    return new WhatsAppChatMessage(this);
  }

  newRoomEvent(kind?: RoomEventKind): ChatRoomEvent {
    if (kind && kind != RoomEventKind.Generic) {
      return super.newRoomEvent(kind);
    }
    return new WhatsAppRoomEvent(this);
  }
}

function chatPersonFor(person: Person): ChatPerson {
  let chatID = person.chatAccounts.find(e => e.protocol == "whatsapp")?.value;
  let chatPerson = new ChatPerson("whatsapp", chatID, person.name);
  chatPerson.person = person;
  chatPerson.picture = person.picture;
  return chatPerson;
}
