/**
 * This module checks for new mail, using the IMAP standard protocol
 * and the emailjs.org JS library.
 */

import ImapClient from "emailjs-imap-client";
import util from "../../util/util";
util.importAll(util, global);
import MailAccount from "../account/MailAccount";
import MsgFolder from "../account/MsgFolder";
import SQLFolder from "../storage/SQLFolder";
import RFC822Mail from "./MIME";
import { openDatabase }  from "../storage/mail-sql";
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
     * {IMAPFolder}
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
   * {Collection of IMAPFolder}
   */
  get folders() {
    return this._folders;
  }

  /**
   * {IMAPFolder}
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
    await IMAPFolder.init();
    let conn = await this._openConnection();
    if (this._folders.length == 1) {
      await this.listFolders();
    }
    //notifyGlobalObservers("logged-in", { account: self });
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
   * Gets any free server connection.
   */
  get connection() {
    // Implement with pool or
    // record which connections are busy.
    return this._connections.first;
  }

  async listFolders() {
    try {
    let rootMailboxes = await this.connection.listMailboxes();
    assert(rootMailboxes.root);
    let iterateMailboxes = (mailboxes, parent) => {
      if (!mailboxes || !mailboxes.length) {
        return;
      }
      for (let mailbox of mailboxes) {
        let folder = IMAPFolder.fromLibJSON(mailbox, parent);
        iterateMailboxes(mailbox.children, folder);
        if (folder.name.toUpperCase() == "INBOX") {
          parent._inbox = folder;
        }
      };
    }
    iterateMailboxes(rootMailboxes.children, this);
    assert(this._inbox, "No INBOX found");
    } catch (ex) { console.error(ex); throw ex; }
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

export class IMAPFolder extends MsgFolder {
  constructor(name, fullPath, account) {
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
        var msg = new RFC822Mail();
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
