/**
 * This module checks for new mail, using the IMAP standard protocol
 * and the emailjs.org JS library.
 */

import ImapClient from "emailjs-imap-client";
import util from "../../util/util";
util.importAll(util, global);
import { MailAccount, MsgFolder } from "../account/account-base";
import RFC822Mail from "./MIME";
import { sanitize } from "../../util/sanitizeDatatypes";
import { StringBundle } from "../../trex/stringbundle";
const gStringBundle = new StringBundle("mail");

/**
 * Holds and manages login state of one IMAP account
 */
export class IMAPAccount extends MailAccount {
  constructor(accountID) {
    super(accountID);
    this.kType = "imap";

    /**
     * {MsgFolder}
     */
    this._inbox = new MsgFolder("INBOX", "INBOX", this);

    this._folders.set("INBOX", this._inbox);

    /**
     * Lists |ImapClient|s for this account
     * {Array of ImapClient}
     */
    this._connections = new ArrayColl();
  }

  get isLoggedIn() {
    return !!this._connections.length;
  }

  /**
    * Amount of new mails in all known folders.
    * New here means mails not seen by any IMAP client (called "RECENT" in IMAP).
    * It's NOT the unread mails (called "UNSEEN" in IMAP).
    * {Integer} -1 = not checked
    */
  get newMessageCount() {
    let sum = 0;
    this._folders.forEach(folder => {
      if (folder.newMessageCount) {
        sum += folder.newMessageCount;
      }
    });
    return sum;
  }

  /**
   * Some of the unchecked mails (headers) in all folders.
   * Count depends on |peekMails|.
   * {Collection of RFC822Mail}
   */
  get messages() {
    let coll = null;
    this._folders.forEach(folder => {
      if (!coll) {
        coll = folder.messages;
      } else {
        coll = coll.concat(folder.messages);
      }
    });
    return coll;
  }

  /**
   * {Collection of MsgFolder}
   */
  get folders() {
    return this._folders;
  }

  /**
   * {MsgFolder}
   */
  get inbox() {
    return this._inbox;
  }

  /**
   * @param continuously {Boolean} start poller
   *    Currently ignored
   *    If true, return after login, but continue polling after returning.
   */
  async login(continuously) {
    try {
    let conn = await this._openConnection();
    //notifyGlobalObservers("logged-in", { account: self });
    let mailboxes = await conn.listMailboxes();
    assert(mailboxes.root);
    for (let mailbox of mailboxes.children) {
      let folder = new MsgFolder(
          sanitize.label(sanitize.nonemptystring(mailbox.name)),
          sanitize.label(sanitize.nonemptystring(mailbox.path)),
          this);
      folder.flags = mailbox.flags.map(flag => sanitize.nonemptystring(flag).substr(1));
      folder.isNoSelect = folder.flags.indexOf("Noselect") != -1;
      if (mailbox.specialUse) {
        folder.specialUse = sanitize.nonemptystring(mailbox.specialUse).substr(1);
      }
      folder.subscribed = sanitize.boolean(mailbox.subscribed);
      this._folders.set(sanitize.nonemptystring(mailbox.path), folder);
      if (folder.name.toUpperCase() == "INBOX") {
        this._inbox = folder;
      }
      // TODO recurse into mailbox.children
    };
    assert(this._inbox, "No INBOX found");
    await this.openFolderUsingConnection(this._inbox, conn);
    } catch (ex) { console.error(ex); throw ex; }
  }

  /**
   * @returns connection from ImapClient
   */
  async _openConnection() {
    assert(this.hostname, "Need to configure");
    assert(this._password, "Need password");
    var self = this;
    var conn = new ImapClient(this.hostname, this.port, {
      auth : {
        user: self.username,
        pass: self._password,
      },
      useSecureTransport : self.socketType == 2, // SSL
      requireTLS : self.socketType == 3, // STARTTLS
      //enableCompression : true,
    });
    await conn.connect();
    this._connections.add(conn);
    return conn;
  }

  /**
   * @param folder {MsgFolder}
   */
  async openFolder(folder) {
    assert(folder instanceof MsgFolder);
    let conn = await this._openConnection();
    await this.openFolderUsingConnection(folder, conn);
  }

  /**
   * @param folder {MsgFolder}
   * @param conn {ImapClient}
   *    If you have an open connection that you want to re-use, pass this.
   *    Required.
   */
  async openFolderUsingConnection(folder, conn) {
    assert(folder instanceof MsgFolder);
    assert(conn instanceof ImapClient);
    conn.onupdate = (path, type, value) => {
      if (type == "exists") {
        assert(path == folder.fullPath, "Wrong mailbox selected");
        folder.messageCount = sanitize.integer(mailbox.exists);
      }
    };
    let mailbox = await conn.selectMailbox(folder.name);
    folder.messageCount = sanitize.integer(mailbox.exists);
    if (this.peekMails) {
      // TODO keep existing mails, get all unknown. For now, just peek the first n = |peekMails|.
      let messages = await conn.listMessages(folder.name, "1:" + this.peekMails, ["uid", "flags", "envelope", "body[]"]);
      messages.forEach(message => {
        var msg = new RFC822Mail();
        msg.imapUID = sanitize.integer(message.uid);
        msg.msgID = sanitize.nonemptystring(message.envelope["message-id"]);
        msg.subject = sanitize.label(message.envelope.subject);
        msg.date = new Date(message.envelope.date);
        var from = message.envelope.from[0];
        msg.authorRealname = sanitize.label(from.name);
        msg.authorEmailAddress = sanitize.emailAddress(from.address);
        msg.authorFull = msg.authorRealname
            ? msg.authorRealname + " <" + msg.authorEmailAddress + ">"
            : msg.authorEmailAddress;
        msg.flags = message.flags.map(flag => sanitize.nonemptystring(flag).substr(1));
        msg.seen = msg.flags.indexOf("Seen") != -1;
        folder._messages.set(msg.msgID, msg);
      });
    }
  }

  /**
   * Closes open connections with the server,
   * and stops any possible ongoing periodic checks,
   * and deletes the stored credentials/password.
   */
  async logout() {
    this._deleteStoredPassword();
    await this.logoutButKeepCredentials();
  }

  /**
   * Closes open connections with the server,
   * and stops any possible ongoing periodic checks.
   */
  async logoutButKeepCredentials() {
    // logout modifies _conns, but forEach() copies
    this._connections.forEach(conn => {
      conn.logout(); // This is async, but do not wait for server response
      conn.close();
    });
    this._folders.clear();
    //notifyGlobalObservers("mail-check", { account: self });
    //notifyGlobalObservers("logged-out", { account: self });
  }
}
