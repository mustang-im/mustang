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
 * The Original Code is the Beonex Mail Notifier
 *
 * The Initial Developer of the Original Code is
 *  Ben Bucksch <ben.bucksch beonex.com>
 * Portions created by the Initial Developer are Copyright (C) 2010 - 2017
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
 * This module checks for new mail, using the IMAP standard protocol.
 *
 * TODO
 * - password store
 * - RECENT vs. EXISTS
 * - FETCH mail contents
 * - multiple folders
 */
/**
 * Messages sent:
 * "logged-in" @see login-logic.js
 *    Means: We are
 *    When: We authenticated with the IMAP server
 * "logged-out" @see login-logic.js
 *    When: We dropped the IMAP connection.
 *    TODO currently only sent when voluntarily dropped.
 *    Should handle case when server drops connection.
 * "mail-check" @see email-logic.js
 *    We checked the number of new mails, and the number changed.
 */

var util = require("util/util");
util.importAll(util, global);
util.importAll(require("logic/mail/Auth"), global);
util.importAll(require("logic/mail/MIME"), global);
var { MailAccount, MsgFolder } = require("logic/account/account-base");
var LineSocket = require("logic/mail/Socket").LineSocket;
var sanitize = require("util/sanitizeDatatypes").sanitize;
var gStringBundle = new (require("trex/stringbundle").StringBundle)("mail");

/**
 * Holds and manages login state of one IMAP account
 */
function IMAPAccount(accountID, isNew)
{
  this._folders = new MapColl();
  this._inbox = new MsgFolder("INBOX", "INBOX");
  this._folders.set("INBOX", this._inbox);
  this._connections = new ArrayColl();
  this._pollingErrorLoopCounter = 0;
  MailAccount.call(this, accountID, isNew);
}
IMAPAccount.prototype =
{
  kType : "imap",

  /**
   * {MapColl of foldername -> MsgFolder}
   */
  _folders : null,

  /**
   * {MsgFolder}
   */
  _inbox : null,

  /**
   * Lists |IMAPConnection|s for this account,
   * but only those which are open.
   * {Array of IMAPConnection}
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
   * @param continuously {Boolean}
   *    if false, check only once. Logs out afterward.
   *    if true, keeps the connection open via IDLE and waits for the server
   *        to tell us about new mail arrivals.
   * @param successCallback {Function()}
   *    Will be called only once, even if the checks continue.
   */
  login : function(continuously, successCallback, errorCallback)
  {
    sanitize.boolean(continuously);
    var self = this;

    /* The |errorCallback| passed to checkMailsFolder()
     * is for the first login and might remove the account.
     *
     * If polling fails, we need to another error recovery:
     * - show the error on the browser console only
     * - log out
     * - try to log in again
     * - if that fails, give up, and
     *     silently log out (don't annoy him while browsing) and
     *     wait for the user to manually log in again
     *
     * Note: We're in IMAPConnection here, not in IMAPAccount.
     * IMAPAccount.logout() causes credentials to be deleted etc..
     * IMAPConnection.logout() just closes the server connection.
     * TODO: Move into IMAPConnection?
     * Consider multiple checkMailsFolder() running at the same time
     * for several folders.
     */
    var pollingSucceededOnce = false;
    var pollingErrorCallback = e => {
      // Error happened before the first poll succeeded
      if ( !pollingSucceededOnce) {
        errorCallback(ex);
        return;
      }
      errorInBackend(ex);
      if (self._pollingErrorLoopCounter++ > 2) {
        // Loop happened when _started = true in Socket._createSocket().
        // Not anymore, but loops are bad, so add some extra protection.
        errorInBackend("Loop detected!");
        return;
      }
      //conn.logout(); done in checkMailsFolder() pollingErrorCallback
      self.login(continuously, function() {}, ex => {
        errorInBackend(ex);
        // Give up
        self.logoutButKeepCredentials(function() {}, errorInBackend);
      });
    };

    var conn = new IMAPConnection(this, pollingErrorCallback);
    // IMAPConnection adds itself to this._connections
    conn.login(() =>
    {
      notifyGlobalObservers("logged-in", { account: self });
      // TODO NAMESPACE
      // TODO LIST folders
      conn.checkMailsFolder(this._inbox, self._peekMails, continuously,
      msgFolder =>
      {
        pollingSucceededOnce = true;
        successCallback();
        if (!continuously)
          conn.logout();
      }, errorCallback, pollingErrorCallback);
    }, errorCallback);
  },

  /*
  _getFolderByName : function(foldername)
  {
    if ( !this._folders.containsKey(foldername))
    {
      var fullPath = foldername; // TODO
      this._folders.set(foldername, new MsgFolder(foldername, fullPath));
    }
    return this._folders.get(foldername);
  },
  */

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
    this._connections.forEach(conn => conn.logout());
    this._folders.clear();
    successCallback();
    var self = this;
    notifyGlobalObservers("mail-check", { account: self });
    notifyGlobalObservers("logged-out", { account: self });
  },
}
extend(IMAPAccount, MailAccount);



// IMAP Implementation

/**
 * @param errorCallback   Called when the connection drops.
 */
function IMAPConnection(account, errorCallback)
{
  this._capability = [];
  assert(account instanceof IMAPAccount);
  this._account = account;
  var self = this;
  this._socket = new IMAPClientSocket({
    hostname : self._account.hostname,
    port : self._account.port,
    ssl : self._account.ssl,
    errorCallback : errorCallback,
  });
}
IMAPConnection.prototype =
{
  /**
   * {Map of server capability (string per IMAP spec) -> true}
   */
  _capability : null,

  _loggedIn : false,

  /**
   * The folder that this collection has currently open.
   * {MsgFolder}
   */
  folder : null,

  /**
   * Opens a new connection to the server.
   */
  login : function(successCallback, errorCallback)
  {
    assert(typeof(successCallback) == "function");
    assert(typeof(errorCallback) == "function");
    assert( !this._loggedIn, "already logged in");
    assert(this._account._password, "need password before trying to log in");
    var self = this;
    var callerErrorCallback = errorCallback;
    errorCallback = ex =>
    {
      self.logout();
      callerErrorCallback(ex);
    };

    var socket = this._socket;
    this._openConnection(() =>
    {
      var done = () =>
      {
        self._loggedIn = true;
        self._account._connections.add(self);
        successCallback();
      };
      var username = self._account.username;
      var password = self._account._password;
      if (self._capability["AUTH=CRAM-MD5"])
      {
        socket.sendAndReceiveIMAP("AUTHENTICATE CRAM-MD5",
        line =>
        {
          var challenge = sanitize.nonemptystring(line);
          var cred = AuthCRAMMD5.encodeLine(username, password, challenge);
          socket.sendLines([ cred ]);
        }, null, null, done, errorCallback);
      }
      else if (self._capability["AUTH=PLAIN"])
      {
        socket.sendAndReceiveIMAP("AUTHENTICATE PLAIN",
        () =>
        {
          var cred = AuthPLAIN.encodeLine(username, password);
          socket.sendLines([ cred ]);
        }, null, null, done, errorCallback);
      }
      else if ( !self._capability["LOGINDISABLED"])
      {
        socket.sendAndReceiveIMAP("LOGIN " +
            socket.quoteArg(username) + " " + socket.quoteArg(password),
            null, null, null, done, errorCallback);
      }
      else
        throw new Exception(gStringBundle.get("imap.noLoginMechs.error",
                                              [ self._account.hostname ]));
    }, errorCallback);
  },

  _openConnection : function(successCallback, errorCallback)
  {
    var self = this;
    this._socket.openSocket(() =>
    {
      // Wait for server response
      self._socket.receiveIMAP(null, null,
      line =>
      {
        // Got "* OK servername" response
        self._doSTARTTLSIfNecessary(() =>
        {
          self._getCAPs(successCallback, errorCallback);
        }, errorCallback);
      },
      okMsg =>
      {
        // command success: there was no command, so this never comes
      }, errorCallback);
    }, errorCallback);
  },

  _doSTARTTLSIfNecessary : function(successCallback, errorCallback)
  {
    if (this._account.ssl != 3)
    {
      successCallback();
      return;
    }
    // Don't bother checking CAPS. If it's configured in prefs, we require it.

    assert(this._socket._socket instanceof Ci.nsISocketTransport);
    var sslControl = this._socket._socket.securityInfo;
    if (!(sslControl instanceof Ci.nsISSLSocketControl)) // implicitly does QI
      throw new Exception("nsISSLSocketControl not found");

    this._socket.sendAndReceiveIMAP("STARTTLS", null, null, null, () =>
    {
      // |Socket| implements SSL notification callbacks
      sslControl.StartTLS(); // apparently sync, blocks UI :-(
      successCallback();
    }, errorCallback);
  },

  _getCAPs : function(successCallback, errorCallback)
  {
    var self = this;
    this._socket.sendAndReceiveIMAP("CAPABILITY", null, null,
    line =>
    {
      if (line.substr(0, 11) != "CAPABILITY ")
        return;
      line = line.substr(11);
      line.split(" ").forEach(cap =>
      {
        cap = sanitize.nonemptystring(cap);
        if (!/^[a-zA-Z0-9\-\_=\+]*$/.test(cap))
          return;
        self._capability[cap] = true;
      }, this);
    },
    successCallback, errorCallback);
  },

  /**
   * @param folder {MsgFolder}
   * @param peekMails {Integer}  Also fetch the email headers.
   *   Fetch this many mails maximum. Pass 0 to only get the number of mails.
   * @param continuously {Boolean}
   *    if false, check only once. Logs out afterward.
   *    if true, keeps the connection open via IDLE and waits for the server
   *        to tell us about new mail arrivals.
   * @param successCallback {Function(folder {MsgFolder})}
   *    Will be called only once, even if the checks continue.
   * @param firstErrorCallback {Function(ex)}   When the first
   *     opening of the folder fails
   * @param pollingErrorCallback {Function(ex)}   Later errors when
   *     the polling or IDLE call fails or the connection drops.
   *     You need to handle conn.logout(), possibly reconnect etc.
   */
  checkMailsFolder : function(folder, peekMails, continuously,
                              successCallback, firstErrorCallback, pollingErrorCallback)
  {
    assert(this._loggedIn, "Please login() first");
    sanitize.nonemptystring(folder.name);
    sanitize.integer(peekMails);
    sanitize.boolean(continuously);
    assert(typeof(successCallback) == "function");
    assert(typeof(firstErrorCallback) == "function");
    assert(typeof(pollingErrorCallback) == "function");
    var self = this;
    var callerFirstErrorCallback = firstErrorCallback;
    firstErrorCallback = ex => {
      self.logout();
      callerFirstErrorCallback(ex);
    };
    var callerPollingErrorCallback = pollingErrorCallback;
    pollingErrorCallback = ex => {
      self.logout();
      callerPollingErrorCallback(ex);
    };

    this.folder = folder;

    var socket = this._socket;
    socket.sendAndReceiveIMAP("EXAMINE " + socket.quoteArg(folder.name), null, null,
    line =>
    {
      self._folderInfoReponse(self.folder, line);
    },
    okMsg =>
    {
      // Note: Must run _haveNewMail() only after we have one full statement
      // EXISTS and RECENT, because we'll otherwise consider the
      // increate of EXISTS from 0 (start) to the real number as new mail

      self._fetchMessages(self.folder, peekMails, () => {

        // successCallback (or errorCallback) must be called once
        successCallback(self.folder);
        self.folder._previousNewMessageCount = self.folder.newMessageCount;
        self.folder._previousMessageCount = self.folder.messageCount;
        if (!continuously)
          return;

        if (self._capability["IDLE"])
        {
          // RFC 2177

          // Remove timeout on our side
          assert(socket._socket instanceof Ci.nsISocketTransport);
          const PR_UINT32_MAX = Math.pow(2, 32) - 1;
          socket._socket.setTimeout(Ci.nsISocketTransport.TIMEOUT_READ_WRITE, PR_UINT32_MAX);

          var idle = () =>
          {
            socket.sendAndReceiveIMAP("IDLE",
            line =>
            {
              // server says "* idling"
            }, null,
            line =>
            {
              self._folderInfoReponse(self.folder, line);
              self._haveNewMail(self.folder, () => {
                notifyGlobalObservers("mail-check", { account: self._account });
              });
            },
            okMsg => // server response to "DONE" received
            {
              self._fetchMessages(self.folder, peekMails, () => {

                idle(); // loop

              }, pollingErrorCallback);
            }, pollingErrorCallback);
            self._poller = runAsync(() =>
            {
              socket.sendLines(["DONE"]);
            }, pollingErrorCallback, 28 * 60 * 1000); // 28min
            // There's no need to implement a nice loop exit.
            // The only way is to stop is logout(), which cuts the connection and
            // prevents the runAsync = DONE.
          }
          idle();
        }
        else
        {
          self._poller = runPeriodically(() =>
          {
            //socket.sendAndReceiveIMAP("EXAMINE " + socket.quoteArg(folder.name), null, null,
            socket.sendAndReceiveIMAP("NOOP", function() {}, null,
            line =>
            {
              self._folderInfoReponse(self.folder, line);
              self._haveNewMail(self.folder, () => {
                notifyGlobalObservers("mail-check", { account: self._account });
              });
            },
            okMsg =>
            {
              self._fetchMessages(self.folder, peekMails, () => {
              }, pollingErrorCallback);
            }, pollingErrorCallback);
          }, pollingErrorCallback, self._account._interval * 1000);
        }
      }, pollingErrorCallback);
    }, firstErrorCallback);
  },

  /**
   * Parses "* 4 RECENT" response to EXAMIME or IDLE
   */
  _folderInfoReponse : function(folder, line)
  {
    var spl = line.split(" ");
    if (spl.length < 2)
      return;
    if (spl[1] == "RECENT")
    {
      folder.newMessageCount = sanitize.integer(spl[0]);
    }
    else if (spl[1] == "EXISTS")
    {
      folder.messageCount = sanitize.integer(spl[0]);
    }
  },

  _haveNewMail : function(folder, successCallback)
  {
    //ddebug("have new mail?");
    //debugObject(folder, "folder");
    if (folder.newMessageCount != folder._previousNewMessageCount)
    {
      //ddebug("RECENT changed");
      successCallback(folder.newMessageCount, folder._previousNewMessageCount);
    }
    /*
    // When another mail client is active, it gets the RECENT instead of us.
    // Also, imap.web.de server is broken and never reports RECENT (imap.gmx.net works).
    // So, watch changes in EXISTS.
    else if ( !folder.newMessageCount && !folder._previousNewMessageCount &&
        typeof(folder._previousMessageCount) == "number" &&
        folder.messageCount != folder._previousMessageCount)
    {
      //ddebug("EXISTS changed");
      // TODO issue "SEARCH UNSEEN", but we might be in the middle
      // of IDLE, so we'd have to close and restart that. Bad IMAP protocol!
      // So, for now, accept that the new mail will be shown only for |interval| time.
      successCallback(folder.messageCount - folder._previousMessageCount);
    }
    */
    folder._previousNewMessageCount = folder.newMessageCount;
    folder._previousMessageCount = folder.messageCount;
  },

  _fetchMessages : function(folder, peekMails, successCallback, errorCallback) {
    if (peekMails == 0) {
      successCallback();
      return;
    }
    var self = this;
    var messageIDs = [];
    self._socket.sendAndReceiveIMAP("SEARCH NEW", null, null,
    line =>
    {
      var spl = line.trim().split(" ");
      assert(spl.length > 0);
      assert(spl.shift() == "SEARCH");
      spl.forEach(msgID => {
        messageIDs.push(sanitize.alphanumdash(msgID));
      });
    },
    okMsg =>
    {
      if (messageIDs.length == 0) {
        successCallback();
        return;
      }

      // last n messages only
      messageIDs = messageIDs.slice(0 - peekMails);

      var previousMessages = new ArrayColl(folder.messages);

      // recursive function doing async I/O
      function fetchNextMessage(msgID) {
        var currentEmailLines = [];
        self._socket.sendAndReceiveIMAP("FETCH " + msgID + " (BODY[HEADER.FIELDS (FROM SUBJECT DATE)])", null,
        line => // raw line
        {
          if (line == ")") {
            // Parse email
            var email = new RFC822Mail(currentEmailLines);
            if ( !folder.messages.containsKey(email.msgID)) {
              folder.messages.add(email);
            }
            currentEmailLines = [];
            //ddebug(JSON.stringify(email, null, " "));
            return;
          }
          currentEmailLines.push(line);
        },
        line => // info line
        {
          var spl = line.split(" ");
          assert(spl.length > 2);
          var msgIDResponse = sanitize.alphanumdash(spl.shift());
          if (msgID != msgIDResponse) {
            ddebug("fetched ID " + msgID + " and got ID " + msgIDResponse + ", possibly due to async callback overwrite");
          }
          assert(spl.shift() == "FETCH");
        },
        okMsg =>
        {
          self._socket._rawLineResponseCallback = null;
          if (messageIDs.length) {
            fetchNextMessage(messageIDs.shift());
          } else {
            // remove emails that are no longer returned by server
            folder.messages.removeAll(previousMessages.substract(folder.messages));

            successCallback();
          }
        }, errorCallback);
      };
      fetchNextMessage(messageIDs.shift());
    }, errorCallback);
  },

  logout : function()
  {
    this._loggedIn = false;
    if (this._poller)
      this._poller.cancel();
    this._socket.close();
    this._account._connections.remove(this);
  },

}

/**
 * This implements the basic IMAP protocol syntax, i.e.
 * how commands and responses are passed.
 *
 * Parses IMAP command responses ala
 * "* some info", "+ continue", "A03 OK msg" and "A03 BAD error msg".
 * Per IMAP spec, the latter two are called "tagged" responses,
 * the former two ("* " and "+ ") are called "untagged".
 * Although IMAP allows it, you should not send 2 commands at the same time
 * using this implementation.
 */
function IMAPClientSocket(p)
{
  p.separator = "newline";
  p.charset = "ASCII";
  this.protocolDebug = true;
  LineSocket.call(this, p);
  this.registerReceiveLinesCallback(makeCallback(this, this._receiveLinesToIMAP));
}
IMAPClientSocket.prototype =
{
  _currentLineTag : 0,

  sendIMAPCommand : function(line)
  {
    this._currentLineTag++;
    this.sendLines([ this._currentLineTag + " " + line ]);
  },
  receiveIMAP : function(continuationResponseCallback,
      rawLineResponseCallback, infoResponseCallback,
      successResponseCallback, errorResponseCallback)
  {
    assert( !continuationResponseCallback || typeof(continuationResponseCallback) == "function");
    assert( !infoResponseCallback || typeof(infoResponseCallback) == "function");
    assert( !rawLineResponseCallback || typeof(rawLineResponseCallback) == "function");
    assert(typeof(successResponseCallback) == "function");
    assert(typeof(errorResponseCallback) == "function");

    this._continuationResponseCallback = continuationResponseCallback; // can be null
    this._infoResponseCallback = infoResponseCallback ?
        infoResponseCallback : function() {};
    this._rawLineResponseCallback = rawLineResponseCallback; // can be null
    this._successResponseCallback = successResponseCallback;
    this._errorResponseCallback = errorResponseCallback;
  },
  /**
   * @param continuationResponseCallback {Function(line {String})} (Optional)
   *    The server sent a "+" line
   *    Typically, you have to react to this by sending another raw line
   *    using sendLines() (*not* sendIMAPCommand()).
   * @param infoResponseCallback {Function(line {String})} (Optional)
   *    The server sent a "*" line
   *    This is normally called several times, once per info line.
   * @param successResponseCallback {Function(line {String})}
   *    The server sent a "OK" result to this specific command.
   *    This is called only once.
   * @param rawLineResponseCallback {Function(line {String})} (Optional)
   *    All other response lines without tag or prefix are passed here.
   *    If you don't expect such lines (as in most cases), pass |null| here.
   * @param errorResponseCallback {Function(line {String})}
   *    The server sent a "NO", "BAD" or invalid line.
   *    This may be called several times, esp. if the server does nonsense.
   */
  sendAndReceiveIMAP : function(sendLine,
      continuationResponseCallback, rawLineResponseCallback, infoResponseCallback,
      successResponseCallback, errorResponseCallback)
  {
    this.receiveIMAP(continuationResponseCallback,
        rawLineResponseCallback, infoResponseCallback,
        successResponseCallback, errorResponseCallback);
    this.sendIMAPCommand(sendLine);
  },

  //  RFC 3501 Sec 2.2.1 and 2.2.2 and 7
  _receiveLinesToIMAP : function(inLines)
  {
    var expectedTagSpace = this._currentLineTag + " ";
    inLines.forEach(line =>
    {
      if (line == "")
        return;
      else if (line[0] == "+" && this._continuationResponseCallback)
        this._continuationResponseCallback(line.substr(2));
      else if (line.substr(0, 5) == "* BAD")
        this._errorResponseCallback(new IMAPSyntaxErrorResponse(
            line.substr(6), this.hostname));
      else if (line[0] == "*")
        this._infoResponseCallback(line.substr(2));
      else if (line.substr(0, expectedTagSpace.length) == expectedTagSpace)
      {
        line = line.substr(expectedTagSpace.length);
        if (line.substr(0, 2) == "OK")
        {
          this._successResponseCallback(line.substr(3));

          // ensure that the successCallback is called only once
          /* TODO is called when it shouldn't be
          this._successResponseCallback = line =>
          {
            this._errorResponseCallback(new UnexpectedIMAPResponse(
                line, this.hostname));
          };
          */
        }
        else if (line.substr(0, 25) == "NO [AUTHENTICATIONFAILED]")
          this._errorResponseCallback(new IMAPAuthFailedResponse(
              line.substr(25), this.hostname));
        else if (line.substr(0, 2) == "NO")
          this._errorResponseCallback(new IMAPErrorResponse(
              line.substr(3), this.hostname));
        else if (line.substr(0, 3) == "BAD")
          this._errorResponseCallback(new IMAPSyntaxErrorResponse(
              line.substr(4), this.hostname));
        else if (line.substr(0, 3) == "BYE")
          this._errorResponseCallback(new IMAPErrorResponse(
              line.substr(4), this.hostname));
        else
          this._errorResponseCallback(new UnexpectedIMAPResponse(
              line, this.hostname));
      }
      else if (this._rawLineResponseCallback)
        this._rawLineResponseCallback(line);
      else
        this._errorResponseCallback(new UnexpectedIMAPResponse(
            line, this.hostname));
    }, this);
  },

  quoteArg : function(arg)
  {
    return '"' + arg + '"';
  },
},
extend(IMAPClientSocket, LineSocket);

function UnexpectedIMAPResponse(badLine, hostname)
{
  Exception.call(this, gStringBundle.get("imap.unexpected.error", [ hostname, badLine ]));
}
extend(UnexpectedIMAPResponse, Exception);

function IMAPErrorResponse(serverErrorMsg, hostname)
{
  Exception.call(this, gStringBundle.get("imap.server.error", [ hostname, serverErrorMsg ]));
}
extend(IMAPErrorResponse, Exception);

function IMAPAuthFailedResponse(serverErrorMsg, hostname)
{
  Exception.call(this, gStringBundle.get("imap.auth.error", [ hostname, serverErrorMsg ]));
}
extend(IMAPAuthFailedResponse, Exception);

function IMAPSyntaxErrorResponse(serverErrorMsg, hostname)
{
  Exception.call(this, gStringBundle.get("imap.syntax.error", [ hostname, serverErrorMsg ]));
}
extend(IMAPSyntaxErrorResponse, Exception);

exports.IMAPAccount = IMAPAccount;
