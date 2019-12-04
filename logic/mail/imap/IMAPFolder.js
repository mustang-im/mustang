/**
 * This module checks for new mail, using the IMAP standard protocol
 * and the emailjs.org JS library.
 */

import ImapClient from "emailjs-imap-client";
import IMAPAccount from "../../mail/imap/IMAPAccount";
import EMail from "../../mail/EMail";
import MsgFolder from "../../account/MsgFolder";
import SQLFolder from "../../storage/SQLFolder";
import { openDatabase }  from "../../storage/mail-sql";
import util from "../../../util/util";
util.importAll(util, global);
import { sanitize } from "../../../util/sanitizeDatatypes";
import { StringBundle } from "../../../trex/stringbundle";
const gStringBundle = new StringBundle("mail");

export default class IMAPFolder extends MsgFolder {
  constructor(name, fullPath, account) {
    assert(account instanceof IMAPAccount);
    super(name, fullPath, account);

    this.cache = new SQLFolder(this);
    this._messages = this.cache.messages;
    this._subfolders = this.cache.folders;
    this.cache.watch(this._messages, this._subfolders);
    this.cache.fetch().catch(console.error);
  }

  static async init() {
    await openDatabase();
  }

  static fromLibJSON(mailbox, parent) {
    let account = parent instanceof IMAPAccount ? parent : parent.account;

    let folder = new IMAPFolder(
        sanitize.label(sanitize.nonemptystring(mailbox.name)),
        sanitize.label(sanitize.nonemptystring(mailbox.path)),
        account);
    folder.flags = mailbox.flags.map(flag => sanitize.nonemptystring(flag).substr(1));
    folder.isNoSelect = folder.flags.indexOf("Noselect") != -1;
    if (mailbox.specialUse) {
      folder.specialUse = sanitize.nonemptystring(mailbox.specialUse).substr(1);
    }
    folder.subscribed = sanitize.boolean(mailbox.subscribed);

    parent._folders.set(folder.fullPath, folder);
    if (account != parent) {
      account._folders.set(folder.fullPath, folder);
    }
    return folder;
  }

  async fetch() {
    try {
    let conn = await this.account.connection;
    await this._openUsingConnection(conn);
    } catch (ex) { console.error(ex); throw ex; }
  }

  async fetchWithDedicatedConnection() {
    try {
    let conn = await this.account._openConnection();
    await this._openUsingConnection(conn);
    } catch (ex) { console.error(ex); throw ex; }
  }

  /**
   * @param conn {ImapClient}
   *    If you have an open connection that you want to re-use, pass this.
   *    Required.
   */
  async _openUsingConnection(conn) {
    assert(conn instanceof ImapClient);
    conn.onupdate = (path, type, value) => {
      if (type == "exists") {
        assert(path == this.fullPath, "Wrong mailbox selected");
        this.messageCount = sanitize.integer(mailbox.exists);
      }
    };
    let mailbox = await conn.selectMailbox(this.fullPath);
    this.messageCount = sanitize.integer(mailbox.exists);
    if (this.account.peekMails) {
      // TODO keep existing mails, get all unknown. For now, just peek the first n = |peekMails|.
      let messages = await conn.listMessages(this.name, "1:" + this.account.peekMails, ["uid", "flags", "envelope", "body[]"]);
      messages.forEach(message => {
        //console.log(JSON.stringify(message, null, " ").substr(0, 1000));
        var msg = new EMail();
        msg.imapUID = sanitize.integer(message.uid);
        msg.msgID = sanitize.nonemptystring(message.envelope["message-id"]);
        if (msg.msgID[0] == "<") {
          msg.msgID = msg.msgID.substring(1, msg.msgID.length - 1);
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
        this._messages.set(msg.msgID, msg);
      });
    }
  }
}
