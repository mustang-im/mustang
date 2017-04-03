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
 * This file contains
 * - the |Account| class API, which all account types implement
 * - the |MailAccount| class, from which IMAP and POP3 inherit
 */

const EXPORTED_SYMBOLS = [ "Account", "MailAccount" ];

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://corvette/util/util.js");
var gStringBundle = new StringBundle("mail");

/**
 * API for all accounts
 *
 * @param accountID {String}   unique ID for this account
 *      used as pref branch name
 * @param isNew {Boolean}
 *     if false, read the settings for this account from the prefs
 *     if true, this account is not configured yet.
 *       You must set the required properties (depending on account type),
 *       and then call saveToPrefs().
 */
function Account(accountID, isNew)
{
  this.accountID = sanitize.nonemptystring(accountID);
}
Account.prototype =
{
  accountID : null, // {String}
  kType : "overwriteme", // for prefs .type and password manager
  _pref : null, // {Preferences} prefs branch for this account. null, if not saved yet.
  _interval : 300, // {Integer} in s

  get prefs() {
    return this._pref;
  },

  get interval()
  {
    return this._interval;
  },

  set interval(val)
  {
    this._interval = val;
    if (this._pref)
      this._pref.set("interval", this._interval);
  },

  get type()
  {
    return this.kType;
  },

  /**
   * We have credentials that we can probably use for login
   * without having to query the user for password or similar.
   * @returns {Boolean}
   */
  get haveStoredLogin()
  {
    throw new NotReached("implement");
  },

  /**
   * user says he wants to stay logged in / "remember me"
   * @returns {Boolean}
   */
  get wantStoredLogin()
  {
    throw new NotReached("implement");
  },

  /**
   * Setter also saves to prefs.
   */
  set wantStoredLogin(val)
  {
    throw new NotReached("implement");
  },

  /**
   * Store password to use in lext login attempt.
   * If wantStoredLogin is true, it may be saved, too,
   * otherwise not.
   */
  setPassword : function(password)
  {
    throw new NotReached("implement");
  },

  /**
   * We are currently logged into the account,
   * or (in the case of POP3) doing periodical mail checks.
   */
  get isLoggedIn()
  {
    throw new NotReached("implement");
  },

  /**
   * @param continuously {Boolean}
   *    if false, check only once. Logs out afterward.
   *    if true, keeps the connection open via IDLE and waits for the server
   *        to tell us about new mail arrivals.
   * @param successCallback {Function(newMailCount {Integer}),
   *    emails {Array of RFC822Mail})}
   *    Will be called only once, even if the checks continue.
   *    |emails| is null, if peekMails == false.
   */
  login : function(continuously, successCallback, errorCallback)
  {
    throw new NotReached("implement");
  },

  /**
   * Closes open connections with the server,
   * and stops any possible ongoing periodic checks.
   */
  logout : function(successCallback, errorCallback)
  {
    throw new NotReached("implement");
  },

  /**
   * remove this account from prefs and here in backend
   */
  deleteAccount : function()
  {
    if (this.isLoggedIn)
      this.logout(function() {}, errorInBackend);

    ourPref.resetBranch("account." + this.accountID + ".");
    // delete from accounts list pref
    var accounts = ourPref.get("accountsList", "").split(",");
    arrayRemove(accounts, this.accountID, true);
    ourPref.set("accountsList", accounts.join(","));

    _removeAccount(this); // from account-list.js
  },
}

Account.getDomainForEmailAddress = function(emailAddress)
{
  var spl = emailAddress.split("@");
  assert(spl.length == 2, gStringBundle.get("error.syntax"));
  return sanitize.hostname(spl[1]);
}

/**
 * Base class for IMAPAccount and POP3Account
 */
function MailAccount(accountID, isNew)
{
  Account.call(this, accountID, isNew);
  if ( !isNew)
    this._readFromPrefs();
}
MailAccount.prototype =
{
  emailAddress : null, // {String}
  _password : null, // {String}
  _wantStoredLogin : true, // {Boolean} pref says "remember me"
  _peekMails : 10, // {Integer} number of mail headers to fetch. Compare email-panel.js kShowNumberOfMails

  /**
   * Amount of new mails in all known folders.
   * New here means mails not seen by any IMAP client (called "RECENT" in IMAP).
   * It's NOT the unread mails (called "UNSEEN" in IMAP).
   * {Integer} -1 = not checked
   */
  get newMailCount()
  {
    throw new NotReached("implement");
  },

  /**
   * Some of the unchecked mails (headers) in all folders
   * {Array of RFC822Mail}
   * may be null or an empty array when this is not implemented.
   */
  get emails()
  {
    return [];
    //throw new NotReached("implement");
  },

  /**
   * @param email {RFC822Mail}
   */
  markAsRead : function(email) {
    //throw new NotReached("implement");
  },

  get peekMails()
  {
    return this._peekMails;
  },

  set peekMails(val)
  {
    this._peekMails = val;
    //if (this._pref)
      //this._pref.set("peekMails", this._peekMails);
  },

  /**
   * We have a loginToken that we can probably use.
   * A LoginToken is a form of password-less credentials
   * with long or short expiry.
   * @returns {Boolean}
   */
  get haveStoredLogin()
  {
    if (!!this._password) {
      return true;
    }
    this._getPasswordFromStore();
    return !!this._password;
  },

  /**
   * user says he wants to stay logged in / "remember me"
   * @returns {Boolean}
   */
  get wantStoredLogin()
  {
    return this._wantStoredLogin;
  },

  set wantStoredLogin(val)
  {
    this._wantStoredLogin = sanitize.boolean(val);
    if ( !val)
      this._deleteStoredPassword();
    if (this._pref)
      this._pref.set("storeLogin", this._wantStoredLogin);
  },

  /**
   * Use this password for login().
   *
   * If wantStoredLogin is true, stores it persistently in password manager, too,
   * otherwise not.
   *
   * @param password {String}
   */
  setPassword : function(password)
  {
    this._deleteStoredPassword(); // otherwise loginManager throws when already exists
    this._password = sanitize.string(password);
    if ( !this._wantStoredLogin)
      return;
    // nsILoginManager (same below)
    Services.logins.addLogin(new LoginInfo(
        this.kType + "://" + this.hostname, null, "mail",
        this.username, password,
        "", "")); // username and password field name
  },

  _getPasswordFromStore : function()
  {
    this._password = null;
    try {
      Services.logins.findLogins({},
          this.kType + "://" + this.hostname,
          null, "mail").forEach(function(login) {
        if (login.username == this.username)
           this._password = sanitize.string(login.password);
      }, this);
    } catch (e) {
      if ( !userCancelledMasterPasswordEntry(e)) {
        errorInBackend(e);
      }
    }
    return !!this._password;
  },

  _deleteStoredPassword : function()
  {
    this._password = null;
    try {
      Services.logins.findLogins({},
          this.kType + "://" + this.hostname,
          null, "mail").forEach(function(login) {
        if (login.username == this.username)
          Services.logins.removeLogin(login);
      }, this);
    } catch (e) {
      if ( !userCancelledMasterPasswordEntry(e)) {
        errorInBackend(e);
      }
    }
  },

  get domain()
  {
    return Account.getDomainForEmailAddress(this.emailAddress);
  },

  setServerConfig : function(config)
  {
    this.config = config;
    // Interval defaults, protocol-specific
    // We can't set them in the constructor
    // due to the order of calling the base class and readFromPrefs.
    if (config.interval)
      this._interval = config.interval;
    else if (config.type == "imap")
      // If this is too long, the server closes the connection.
      this._interval = 30; // Just for NOOP, not IDLE
    else if (config.type == "pop3")
      this._interval = 300;

    this.username = config.username || this.emailAddress;
    this.hostname = config.hostname;
    this.port = config.port;
    this.ssl = config.socketType;
    this._verifyAccountSettings();
  },

  _verifyAccountSettings : function()
  {
    sanitize.nonemptystring(this.accountID);
    sanitize.nonemptystring(this.emailAddress);
    Account.getDomainForEmailAddress(this.emailAddress); // checks
    sanitize.hostname(this.hostname);
    sanitize.integerRange(this.port, 0, 65535);
    sanitize.nonemptystring(this.username);
    sanitize.enum(this.ssl, [ 1, 2, 3 ]);
    sanitize.integer(this._peekMails);
    sanitize.integer(this._interval);
    assert(this._interval > 0, "check interval is not set");
    sanitize.boolean(this._wantStoredLogin);
  },

  _readFromPrefs : function()
  {
    this._pref = ourPref.branch("account." + this.accountID + ".");
    assert(this._pref.get("type") == this.kType);

    this.emailAddress = this._pref.get("emailAddress").toLowerCase();
    this.hostname = this._pref.get("hostname");
    this.port = this._pref.get("port");
    this.ssl = this._pref.get("socketType");
    this.username = this._pref.get("username");
    this._peekMails = this._pref.get("peekMails", this._peekMails);
    this._interval = this._pref.get("interval", this._interval);
    this._wantStoredLogin = this._pref.get("storeLogin", this._wantStoredLogin);

    this._verifyAccountSettings();
  },

  saveToPrefs : function()
  {
    this._verifyAccountSettings();

    this._pref = ourPref.branch("account." + this.accountID + ".");
    this._pref.set("type", this.kType);
    this._pref.set("emailAddress", this.emailAddress);
    this._pref.set("hostname", this.hostname);
    this._pref.set("port", this.port);
    this._pref.set("socketType", this.ssl);
    this._pref.set("username", this.username);
    //this._pref.set("peekMails", this._peekMails);
    this._pref.set("interval", this._interval);
    this._pref.set("storeLogin", this._wantStoredLogin);

    // add to accounts list pref
    var accounts = ourPref.get("accountsList", "").split(",");
    if ( !arrayContains(accounts, this.accountID))
    {
      accounts.push(this.accountID);
      ourPref.set("accountsList", accounts.join(","));
    }
  },

  logout : function()
  {
    this._deleteStoredPassword();

    // Subclasses still need to implement the actual logout,
    // and copy the above code.
    throw new NotReached("implement");
  },

  deleteAccount : function()
  {
    this._deleteStoredPassword(); // should be done by logout(), but be sure.

    Account.prototype.deleteAccount.apply(this, arguments);
  },
}
extend(MailAccount, Account);

const LoginInfo = new Components.Constructor(
    "@mozilla.org/login-manager/loginInfo;1", Ci.nsILoginInfo, "init");
