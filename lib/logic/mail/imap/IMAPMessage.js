import EMail from "../../mail/EMail";
import IMAPFolder from "../../mail/imap/IMAPFolder";
import { sanitize } from "../../../util/sanitizeDatatypes";
import { assert } from "../../util/util";

export default class IMAPMessage extends EMail {
  constructor(folder) {
    super(folder);
  }

  /**
    * Import the message from the IMAP library.
    *
    * @see <https://github.com/emailjs/emailjs-imap-client>
    * for API documentation
    *
   * @param message {Message object from the emailjs IMAP library}
   */
  static fromLib(message, folder) {
    assert(folder instanceof IMAPFolder);
    let msg = new IMAPMessage(folder);
    let header = message.envelope;
    msg.UID = sanitize.integer(message.uid);
    msg.msgID = sanitize.nonemptystring(header["message-id"]);
    if (msg.msgID[0] == "<") {
      msg.msgID = msg.msgID.substring(1, msg.msgID.length - 1);
    }
    if (header["in-reply-to"]) {
      msg.parentMsgID = sanitize.nonemptystring(header["in-reply-to"]);
      if (msg.parentMsgID[0] == "<") {
        msg.parentMsgID = msg.parentMsgID.substring(1, msg.parentMsgID.length - 1);
      }
    }
    msg.subject = sanitize.label(header.subject);
    msg.date = new Date(header.date);
    var firstFrom = header.from[0];
    msg.authorEmailAddress = sanitize.emailAddress(firstFrom.address);
    msg.authorRealname = sanitize.label(firstFrom.name);
    msg.authorFull = msg.authorRealname
      ? msg.authorRealname + " <" + msg.authorEmailAddress + ">"
      : msg.authorEmailAddress;
    var firstTo = header.to && header.to.length ? header.to[0] : null;
    msg.recipientEmailAddress = sanitize.emailAddress(firstTo.address);
    msg.recipientRealname = sanitize.label(firstTo.name);
    msg.flags = message.flags.map(flag => sanitize.nonemptystring(flag).substr(1));
    msg.seen = msg.flags.indexOf("Seen") != -1;
    msg._mime = message["body[]"];
    msg._bodyParts = message.bodystructure;
    return msg;
  }

  /**
   * Wheather the message has been read or not
   * @param read {Boolean}
   *   true: mark as read
   *   false: mark as unread
   *   not passed (undefined): mark as read
   */
  async markAsRead(read) {
    if (read === undefined) {
      read = true;
    }
    this.isRead = read;
    console.log("Marking message " + this.subject + " " + this.msgID + " as read");
    await this.folder.updateMessagesMetadata([this], { read: read });
    return read;
  }

  /**
   * Wheather the message has been marked as flagged or not
   * @param starred {Boolean}
   *   true: flagged
   *   false: not flagged
   *   not passed (undefined): flagged
   */
  async star(starred) {
    if (starred === undefined) {
      starred = true;
    }
    this.isStarred = starred;
    console.log("Marking message " + this.subject + " " + this.msgID + " as starred");
    await this.folder.updateMessagesMetadata([this], { starred: starred });
    return starred;
  }

  async deleteMessage(toTrash) {
    await this.folder.deleteMessages([this], toTrash);
  }

  async copy(targetFolder) {
    await this.folder.copyMessages([this], targetFolder);
  }

  async move(targetFolder) {
    await this.folder.moveMessages([this], targetFolder);
  }
}
