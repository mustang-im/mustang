import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Attachment } from "../../Abstract/Attachment";
import { NotReached } from "../../util/util";
import { ChatMessage } from "../Message";
import type { GraphChatRoom } from "./GraphChatRoom";
import type { TGraphChatMessage } from "./GraphChatTypes";

export class GraphChatMessage extends ChatMessage {
  chatRoom: GraphChatRoom;
  info: TGraphChatMessage;
  constructor(chat: GraphChatRoom) {
    super(chat);
  }

  fromGraph(info: TGraphChatMessage) {
    this.info = info;
    this.id = sanitize.nonemptystring(info.id);
    // TODO this.contact = find info.from in this.chatRoom.members;
    if (info.body) {
      if (info.body.contentType == "html") {
        this.html = sanitize.string(info.body.content);
      } else if (info.body.contentType == "text") {
        this.text = sanitize.string(info.body.content);
      } else {
        throw new NotReached();
      }
    }
    this.inReplyTo = sanitize.nonemptystring(info.replyToId, null);
    this.sent = sanitize.date(info.createdDateTime, null);
    for (let attachmentJSON of info.attachments) {
      let a = new Attachment();
      a.contentID = attachmentJSON.id;
      a.filename = attachmentJSON.name;
      a.mimeType = attachmentJSON.contentType;
      a.content = new File([attachmentJSON.content], a.filename);
      // TODO a.contentUrl
      this.attachments.push(a);
    }
    for (let reactionJSON of info.reaction) {
      let sender = null; // TODO find reactionJSON.user in this.chatRoom.members;
      if (sender) {
        this.reactions.set(sender, reactionJSON.reactionType);
      }
    }
  }
}
