/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * Not any newer versions of these licenses
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Corvette
 *
 * The Initial Developer of the Original Code is
 *  Ben Bucksch <ben.bucksch beonex.com>
 * Portions created by the Initial Developer are Copyright (C) 2017
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
/**
 * This module checks for new mail, using the IMAP standard protocol
 * and the emailjs.org JS library.
 */

var ImapClient = require("emailjs-imap-client");
var util = require("util/util");
util.importAll(util, global);
var accountbase = require("logic/account/account-base");
var MailAccount = accountbase.MailAccount;
var MsgFolder = accountbase.MsgFolder;
var RFC822Mail = new require("logic/mail/MIME").RFC822Mail;
var sanitize = require("util/sanitizeDatatypes").sanitize;
var gStringBundle = new (require("trex/stringbundle").StringBundle)("mail");

/**
 * Holds and manages login state of one IMAP account
 */
function IMAPAccount(accountID, isNew)
{
  MailAccount.call(this, accountID, isNew);
  this._inbox = new MsgFolder("INBOX", "INBOX");
  this._folders.set("INBOX", this._inbox);
  this._connections = new ArrayColl();
}
IMAPAccount.prototype =
{
  kType : "imap",

  /**
   * {MsgFolder}
   */
  _inbox : null,

  /**
   * Lists |ImapClient|s for this account
   * {Array of ImapClient}
   */
  _connections : null,

  get isLoggedIn()
  {
    return !!this._connections.length;
  },

  /**
   * Amount of new mails in all known folders.
   * New here means mails not seen by any IMAP client (called "RECENT" in IMAP).
   * It's NOT the unread mails (called "UNSEEN" in IMAP).
   * {Integer} -1 = not checked
   */
  get newMessageCount()
  {
    var sum = 0;
    this._folders.forEach(folder => {
      if (folder.newMessageCount) {
        sum += folder.newMessageCount;
      }
    });
    return sum;
  },

  /**
   * Some of the unchecked mails (headers) in all folders.
   * Count depends on |peekMails|.
   * {Collection of RFC822Mail}
   */
  get messages()
  {
    var coll = null;
    this._folders.forEach(folder => {
      if (!coll) {
        coll = folder.messages;
      } else {
        coll = coll.concat(folder.messages);
      }
    });
    return coll;
  },

  /**
   * {Collection of MsgFolder}
   */
  get folders()
  {
    return this._folders;
  },

  /**
   * {MsgFolder}
   */
  get inbox()
  {
    return this._inbox;
  },

  /**
   * @param continuously {Boolean} ignored
   * @param successCallback {Function()}
   *    Will be called only once, even if the checks continue.
   */
  login : function(continuously, successCallback, errorCallback)
  {
    this._openConnection(conn => {
      //notifyGlobalObservers("logged-in", { account: self });
      conn.listMailboxes().then(mailboxes => {
        assert(mailboxes.root);
        mailboxes.children.forEach(mailbox => {
          var folder = new MsgFolder(
              sanitize.label(sanitize.nonemptystring(mailbox.name)),
              sanitize.label(sanitize.nonemptystring(mailbox.path)));
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
        });
        assert(this._inbox, "No INBOX found");
        this.openFolderUsingConnection(this._inbox, conn, successCallback, errorCallback);
      }).catch(errorCallback);
    }, errorCallback);
  },

  /**
   * @param successCallback {Function(conn {ImapClient})}
   */
  _openConnection : function(successCallback, errorCallback) {
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
    conn.connect().then(() => {
      this._connections.add(conn);
      successCallback(conn);
    }).catch(errorCallback);
  },

  /**
   * @param folder {MsgFolder}
   */
  openFolder : function(folder, successCallback, errorCallback) {
    assert(folder instanceof MsgFolder);
    this._openConnection(conn => {
      this.openFolderUsingConnection(folder, conn, successCallback, errorCallback);
    }, errorCallback);
  },

  /**
   * @param folder {MsgFolder}
   * @param conn {ImapClient}
   *    If you have an open connection that you want to re-use, pass this.
   *    Required.
   */
  openFolderUsingConnection : function(folder, conn, successCallback, errorCallback) {
    assert(folder instanceof MsgFolder);
    assert(conn instanceof ImapClient);
    conn.selectMailbox(folder.name).then(mailbox => {
      folder.messageCount = sanitize.integer(mailbox.exists);
      if (this.peekMails) {
        // TODO keep existing mails, get all unknown. For now, just peek the first n = |peekMails|.
        conn.listMessages(folder.name, "1:" + this.peekMails, ["uid", "flags", "envelope", "body[]"]).then(messages => {
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
          successCallback();
        }).catch(errorCallback);
      } else {
        successCallback();
      }
    }).catch(errorCallback);
    conn.onupdate = (path, type, value) => {
      if (type == "exists") {
        assert(path == folder.fullPath, "Wrong mailbox selected");
        folder.messageCount = sanitize.integer(mailbox.exists);
      }
    };
  },

  /**
   * Closes open connections with the server,
   * and stops any possible ongoing periodic checks,
   * and deletes the stored credentials/password.
   */
  logout : function(successCallback, errorCallback)
  {
    this._deleteStoredPassword();
    this.logoutButKeepCredentials(successCallback, errorCallback);
  },

  /**
   * Closes open connections with the server,
   * and stops any possible ongoing periodic checks.
   */
  logoutButKeepCredentials : function(successCallback, errorCallback)
  {
    assert(typeof(successCallback) == "function", "need successCallback");
    assert(typeof(errorCallback) == "function", "need errorCallback");

    // logout modifies _conns, but forEach() copies
    this._connections.forEach(conn => {
      conn.logout(); // This is async, but do not wait for server response
      conn.close();
    });
    this._folders.clear();
    successCallback();
    //notifyGlobalObservers("mail-check", { account: self });
    //notifyGlobalObservers("logged-out", { account: self });
  },
}
extend(IMAPAccount, MailAccount);

exports.IMAPAccount = IMAPAccount;
