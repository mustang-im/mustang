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

var util = require("/util/util.js");
util.importAll(util, this);
importAll(require("/logic/mail/account-base"), this);
importAll(require("/logic/mail/Auth"), this);
importAll(require("/logic/mail/MIME"), this);
var Socket = require("/logic/mail/Socket").Socket;
var sanitize = require("/util/sanitizeDatatypes").sanitize;
var gStringBundle = new require("/util/stringbundle").StringBundle("mail");


/**
 * Holds and manages login state of one IMAP account
 */
function IMAPAccount(accountID, isNew)
{
  this._folders = {};
  this._connections = [];
  this._pollingErrorLoopCounter = 0;
  MailAccount.call(this, accountID, isNew);
}
IMAPAccount.prototype =
{
  kType : "imap",

  /**
   * {Map of foldername -> {
   *   mailCount {Integer}
   *   newMailCount {Integer}
   *   emails {Array of RFC822Mail}
   * }}
   */
  _folders : null,

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
  get newMailCount()
  {
    var sum = 0;
    objForEach(this._folders, function(folder) {
      if (folder.newMailCount)
        sum += folder.newMailCount;
    }, this);
    return sum;
  },

  /**
   * Some of the unchecked mails (headers) in all folders.
   * Count depends on |peekMails|.
   * {Array of RFC822Mail}
   */
  get emails()
  {
    var coll = [];
    objForEach(this._folders, function(folderInfo) {
      if (folderInfo.emails && folderInfo.emails.length)
        coll = coll.concat(folderInfo.emails);
    }, this);
    return coll;
  },

  /**
   * @param continuously {Boolean}
   *    if false, check only once. Logs out afterward.
   *    if true, keeps the connection open via IDLE and waits for the server
   *        to tell us about new mail arrivals.
   * @param successCallback {Function(newMailCount {Integer}),
   *    emails {Array of RFC822Mail})}
   *    Will be called only once, even if the checks continue.
   *    |emails| count depends on |peekMails|.
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
    var pollingErrorCallback = function(e) {
      // Error happened before the first poll succeeded
      if ( !pollingSucceededOnce) {
        errorCallback(e);
        return;
      }
      errorInBackend(e);
      if (self._pollingErrorLoopCounter++ > 2) {
        // Loop happened when _started = true in Socket._createSocket().
        // Not anymore, but loops are bad, so add some extra protection.
        errorInBackend("Loop detected!");
        return;
      }
      //conn.logout(); done in checkMailsFolder() pollingErrorCallback
      self.login(continuously, function() {}, function(e) {
        errorInBackend(e);
        // Give up
        self.logoutButKeepCredentials(function() {}, errorInBackend);
      });
    };

    var conn = new IMAPConnection(this, pollingErrorCallback);
    // IMAPConnection adds itself to this._connections
    conn.login(function()
    {
      notifyGlobalObservers("logged-in", { account: self });
      // TODO NAMESPACE
      // TODO LIST folders
      conn.checkMailsFolder("INBOX", self._peekMails, continuously,
      function(newMailCount, previousNewMailCount, emails)
      {
        pollingSucceededOnce = true;
        successCallback(newMailCount, emails);
        if (newMailCount != previousNewMailCount) {
          notifyGlobalObservers("mail-check", { account: self });
        }
        if (!continuously)
          conn.logout();
      }, errorCallback, pollingErrorCallback);
    }, errorCallback);
  },

  _getFolderInfo : function(foldername)
  {
    if ( !this._folders[foldername])
    {
      this._folders[foldername] = {
        newMailCount : 0,
        mailCount : 0,
        emails : [],
      };
    }
    return this._folders[foldername];
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
    this._connections.forEach(function(conn) {
      conn.logout();
    }, this);
    this._folders = {};
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
    errorCallback = function(e)
    {
      self.logout();
      callerErrorCallback(e);
    };

    var socket = this._socket;
    this._openConnection(function()
    {
      var done = function()
      {
        self._loggedIn = true;
        self._account._connections.push(self);
        successCallback();
      };
      var username = self._account.username;
      var password = self._account._password;
      if (self._capability["AUTH=CRAM-MD5"])
      {
        socket.sendAndReceiveIMAP("AUTHENTICATE CRAM-MD5",
        function(line)
        {
          var challenge = sanitize.nonemptystring(line);
          var cred = AuthCRAMMD5.encodeLine(username, password, challenge);
          socket.sendLines([ cred ]);
        }, null, null, done, errorCallback);
      }
      else if (self._capability["AUTH=PLAIN"])
      {
        socket.sendAndReceiveIMAP("AUTHENTICATE PLAIN",
        function()
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
    this._socket.openSocket(function()
    {
      // Wait for server response
      self._socket.receiveIMAP(null, null, function(line)
      {
        // Got "* OK servername" response
        self._doSTARTTLSIfNecessary(function()
        {
          self._getCAPs(successCallback, errorCallback);
        }, errorCallback);
      },
      function(okMsg)
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

    this._socket.sendAndReceiveIMAP("STARTTLS", null, null, null,
    function()
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
    function(line)
    {
      if (line.substr(0, 11) != "CAPABILITY ")
        return;
      line = line.substr(11);
      line.split(" ").forEach(function(cap)
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
   * @param peekMails {Integer}  Also fetch the email headers.
   *   Fetch this many mails maximum. Pass 0 to only get the number of mails.
   * @param continuously {Boolean}
   *    if false, check only once. Logs out afterward.
   *    if true, keeps the connection open via IDLE and waits for the server
   *        to tell us about new mail arrivals.
   * @param successCallback {Function(newMailCount {Integer},
   *        previousNewMailCount {Integer}),
   *    emails {Array of RFC822Mail})}
   *    Will be called only once, even if the checks continue.
   *    |emails| count depends on |peekMails|.
   * @param firstErrorCallback {Function(e)}   When the first
   *     opening of the folder fails
   * @param pollingErrorCallback {Function(e)}   Later errors when
   *     the polling or IDLE call fails or the connection drops.
   *     You need to handle conn.logout(), possibly reconnect etc.
   */
  checkMailsFolder : function(foldername, peekMails, continuously,
                              successCallback, firstErrorCallback, pollingErrorCallback)
  {
    assert(this._loggedIn, "Please login() first");
    sanitize.nonemptystring(foldername);
    sanitize.integer(peekMails);
    sanitize.boolean(continuously);
    assert(typeof(successCallback) == "function");
    assert(typeof(firstErrorCallback) == "function");
    assert(typeof(pollingErrorCallback) == "function");
    var self = this;
    var callerFirstErrorCallback = firstErrorCallback;
    firstErrorCallback = function(e) {
      self.logout();
      callerFirstErrorCallback(e);
    };
    var callerPollingErrorCallback = pollingErrorCallback;
    pollingErrorCallback = function(e) {
      self.logout();
      callerPollingErrorCallback(e);
    };

    var folderInfo = this._account._getFolderInfo(foldername);

    var socket = this._socket;
    socket.sendAndReceiveIMAP("EXAMINE " + socket.quoteArg(foldername), null, null,
    function(line)
    {
      self._folderInfoReponse(folderInfo, line);
    },
    function(okMsg)
    {
      // Note: Must run _haveNewMail() only after we have one full statement
      // EXISTS and RECENT, because we'll otherwise consider the
      // increate of EXISTS from 0 (start) to the real number as new mail

      self._fetchMessages(folderInfo, peekMails, function(emails) {

        // successCallback (or errorCallback) must be called once
        successCallback(folderInfo.newMailCount, folderInfo.previousNewMailCount, emails);
        folderInfo.previousNewMailCount = folderInfo.newMailCount;
        folderInfo.previousMailCount = folderInfo.mailCount;
        folderInfo.emails = emails;
        if (!continuously)
          return;

        if (self._capability["IDLE"])
        {
          // RFC 2177

          // Remove timeout on our side
          assert(socket._socket instanceof Ci.nsISocketTransport);
          const PR_UINT32_MAX = Math.pow(2, 32) - 1;
          socket._socket.setTimeout(Ci.nsISocketTransport.TIMEOUT_READ_WRITE, PR_UINT32_MAX);

          var idle = function()
          {
            socket.sendAndReceiveIMAP("IDLE",
            function(line) {
              // server says "* idling"
            }, null,
            function(line)
            {
              self._folderInfoReponse(folderInfo, line);
              self._haveNewMail(folderInfo, function(newMailCount, previousNewMailCount) {
                notifyGlobalObservers("mail-check", { account: self._account });
              });
            },
            function(okMsg) // server response to "DONE" received
            {
              self._fetchMessages(folderInfo, peekMails, function(emails) {
                folderInfo.emails = emails;

                idle(); // loop

              }, pollingErrorCallback);
            }, pollingErrorCallback);
            self._poller = runAsync(function()
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
          self._poller = runPeriodically(function()
          {
            //socket.sendAndReceiveIMAP("EXAMINE " + socket.quoteArg(foldername), null, null,
            socket.sendAndReceiveIMAP("NOOP", function() {}, null,
            function(line)
            {
              self._folderInfoReponse(folderInfo, line);
              self._haveNewMail(folderInfo, function(newMailCount, previousNewMailCount) {
                notifyGlobalObservers("mail-check", { account: self._account });
              });
            },
            function(okMsg)
            {
              self._fetchMessages(folderInfo, peekMails, function(emails) {
                folderInfo.emails = emails;
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
  _folderInfoReponse : function(folderInfo, line)
  {
    var spl = line.split(" ");
    if (spl.length < 2)
      return;
    if (spl[1] == "RECENT")
    {
      folderInfo.newMailCount = sanitize.integer(spl[0]);
    }
    else if (spl[1] == "EXISTS")
    {
      folderInfo.mailCount = sanitize.integer(spl[0]);
    }
  },

  _haveNewMail : function(folderInfo, successCallback)
  {
    //ddebug("have new mail?");
    //debugObject(folderInfo, "folderInfo");
    if (folderInfo.newMailCount != folderInfo.previousNewMailCount)
    {
      //ddebug("RECENT changed");
      successCallback(folderInfo.newMailCount, folderInfo.previousNewMailCount);
    }
    /*
    // When another mail client is active, it gets the RECENT instead of us.
    // Also, imap.web.de server is broken and never reports RECENT (imap.gmx.net works).
    // So, watch changes in EXISTS.
    else if ( !folderInfo.newMailCount && !folderInfo.previousNewMailCount &&
        typeof(folderInfo.previousMailCount) == "number" &&
        folderInfo.mailCount != folderInfo.previousMailCount)
    {
      //ddebug("EXISTS changed");
      // TODO issue "SEARCH UNSEEN", but we might be in the middle
      // of IDLE, so we'd have to close and restart that. Bad IMAP protocol!
      // So, for now, accept that the new mail will be shown only for |interval| time.
      successCallback(folderInfo.mailCount - folderInfo.previousMailCount);
    }
    */
    folderInfo.previousNewMailCount = folderInfo.newMailCount;
    folderInfo.previousMailCount = folderInfo.mailCount;
  },

  _fetchMessages : function(folderInfo, peekMails, successCallback, errorCallback) {
    if (peekMails == 0) {
      successCallback([]);
      return;
    }
    var self = this;
    var messageIDs = [];
    self._socket.sendAndReceiveIMAP("SEARCH NEW", null, null,
    function(line)
    {
      var spl = line.trim().split(" ");
      assert(spl.length > 0);
      assert(spl.shift() == "SEARCH");
      spl.forEach(function(msgID) {
        messageIDs.push(sanitize.alphanumdash(msgID));
      });
    },
    function(okMsg)
    {
      if (messageIDs.length == 0) {
        successCallback([]);
        return;
      }
      var emails = [];

      // last n messages only
      messageIDs = messageIDs.slice(0 - peekMails);

      // recursive function doing async I/O
      function fetchNextMessage(msgID) {
        var currentEmailLines = [];
        self._socket.sendAndReceiveIMAP("FETCH " + msgID + " (BODY[HEADER.FIELDS (FROM SUBJECT DATE)])", null,
        function(line) { // raw line
          if (line == ")") {
            // Parse email
            emails.push(new RFC822Mail(currentEmailLines));
            currentEmailLines = [];
            ddebug(JSON.stringify(emails[emails.length - 1], null, " "));
            return;
          }
          currentEmailLines.push(line);
        },
        function(line) // info line
        {
          var spl = line.split(" ");
          assert(spl.length > 2);
          var msgIDResponse = sanitize.alphanumdash(spl.shift());
          if (msgID != msgIDResponse) {
            ddebug("fetched ID " + msgID + " and got ID " + msgIDResponse + ", possibly due to async callback overwrite");
          }
          assert(spl.shift() == "FETCH");
        },
        function(okMsg)
        {
          self._socket._rawLineResponseCallback = null;
          if (messageIDs.length) {
            fetchNextMessage(messageIDs.shift());
          } else {
            successCallback(emails);
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
    arrayRemove(this._account._connections, this);
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
    inLines.forEach(function(line)
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
          this._successResponseCallback = function(line)
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
