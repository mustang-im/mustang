import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Attachment } from "../../Abstract/Attachment";
import { NotReached } from "../../util/util";
import { ChatMessage } from "../Message";
import type { GraphChatRoom } from "./GraphChatRoom";
import type { TGraphChatMessage } from "./TGraphChat";

export class GraphChatMessage extends ChatMessage {
  to: GraphChatRoom;
  info: TGraphChatMessage;
  constructor(chat: GraphChatRoom) {
    super(chat);
  }

  async fromGraph(info: TGraphChatMessage): Promise<void> {
    this.info = info;
    this.id = sanitize.nonemptystring(info.id);
    let userID = info.from?.user?.id;
    this.contact = this.to.members.find(person => person.chatID == userID) ?? this.to.contact;
    this.outgoing = userID != this.to.account.account.userID;
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
    this.sent = this.received = sanitize.date(info.createdDateTime, null);
    for (let attachmentJSON of info.attachments) {
      let a = this.newAttachment();
      a.contentID = attachmentJSON.id; // TODO sanitize
      a.filename = attachmentJSON.name;
      a.mimeType = attachmentJSON.contentType;
      if (attachmentJSON.content) {
        a.content = new File([attachmentJSON.content], a.filename);
      }
      // TODO a.contentUrl
      this.attachments.push(a);
      await a.save();
    }
    for (let reactionJSON of info.reactions) {
      let sender = null; // TODO find reactionJSON.user in this.chatRoom.members;
      if (sender) {
        this.reactions.set(sender, reactionJSON.reactionType);
      }
    }
  }
}
