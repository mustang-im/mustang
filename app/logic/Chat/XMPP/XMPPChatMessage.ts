import { assert } from "../../util/util";
import { UserChatMessage } from "../Message";
import { getJID } from "./XMPPAccount";
import { XMPPChat } from "./XMPPChat";
import type { Message, Forward } from "stanza/protocol";

export class XMPPChatMessage extends UserChatMessage {
  constructor(chatRoom: XMPPChat) {
    super(chatRoom);
  }
  get chatRoom(): XMPPChat {
    return this.to as XMPPChat;
  }
  fromStanzaJS(json: Message, wrapper: Forward) {
    assert(json, "No message");
    console.log("got chat message", json);
    this.id = getJID(json.id) ?? crypto.randomUUID();
    this.sent = wrapper.iq?.time?.utc ?? wrapper.delay?.timestamp ?? json.delay?.timestamp ?? new Date();
    let me = this.chatRoom.account.jid;
    let from = getJID(json.from);
    let to = getJID(json.to);
    if (from && from != me) {
      this.contact = this.chatRoom.account.getExistingPerson(from);
    } else if (to && to != me) {
      this.contact = this.chatRoom.account.getExistingPerson(to);
      this.outgoing = true;
    }
    if (json.hasSubject && json.subject) {
      this.subject = json.subject;
    }
    if (json.html?.body) {
      this.html = json.html.body.toString();
    } else {
      this.text = json.body;
    }
    assert(this.html, "No message text");
  }
}
