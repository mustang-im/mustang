import EMail from "../../mail/EMail";
import IMAPFolder from "../../mail/imap/IMAPFolder";
import util from "../../../util/util";
util.importAll(util, global);
import { sanitize } from "../../../util/sanitizeDatatypes";

export default class IMAPMessage extends EMail {
  /**
   * @param message {Message object from the emailjs IMAP library}
   */
  static fromLib(message, folder) {
    assert(folder instanceof IMAPFolder);
    var msg = new EMail(folder);
    msg.UID = sanitize.integer(message.uid);
    msg.msgID = sanitize.nonemptystring(message.envelope["message-id"]);
    if (msg.msgID[0] == "<") {
      msg.msgID = msg.msgID.substring(1, msg.msgID.length - 1);
    }
    if (message.envelope["in-reply-to"]) {
      msg.parentMsgID = sanitize.nonemptystring(message.envelope["in-reply-to"]);
      if (msg.parentMsgID[0] == "<") {
        msg.parentMsgID = msg.parentMsgID.substring(1, msg.parentMsgID.length - 1);
      }
    }
    msg.subject = sanitize.label(message.envelope.subject);
    msg.date = new Date(message.envelope.date);
    var firstFrom = message.envelope.from[0];
    msg.authorEmailAddress = sanitize.emailAddress(firstFrom.address);
    msg.authorRealname = sanitize.label(firstFrom.name);
    msg.authorFull = msg.authorRealname
        ? msg.authorRealname + " <" + msg.authorEmailAddress + ">"
        : msg.authorEmailAddress;
    var firstTo = message.envelope.to[0];
    msg.recipientEmailAddress = sanitize.emailAddress(firstTo.address);
    msg.recipientRealname = sanitize.label(firstTo.name);
    msg.flags = message.flags.map(flag => sanitize.nonemptystring(flag).substr(1));
    msg.seen = msg.flags.indexOf("Seen") != -1;
    msg._mime = message["body[]"];
    return msg;
  }
}
