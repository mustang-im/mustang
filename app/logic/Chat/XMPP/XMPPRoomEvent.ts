import { ChatRoomEvent } from "../RoomEvent";
import type { XMPPChat } from "./XMPPChat";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import type { Message, Forward } from "stanza/protocol";

export class XMPPRoomEvent extends ChatRoomEvent {
  constructor(chatRoom: XMPPChat) {
    super(chatRoom);
  }
  get chatRoom(): XMPPChat {
    return this.to as XMPPChat;
  }

  /**
   * Take a raw message from the server, interpret it, and set the values of this object.
   *
   * If from the archive:
   * @param wrapper The MAM/carbon envelope
   * @param archiveID The MAM archive ID
   */
  fromStanzaJS(json: Message, wrapper?: Forward, archiveID?: string): void {
    assert(json, "Need message");
    this.id = sanitize.nonemptystring(json.id, null) ??
      sanitize.nonemptystring(archiveID, null) ?? crypto.randomUUID();
    this.sent = sanitize.date(wrapper?.delay?.timestamp ?? json.delay?.timestamp, new Date());
    this.received = new Date(this.sent); // copy: callers may mutate dates in place

    // TODO implement
  }
}
