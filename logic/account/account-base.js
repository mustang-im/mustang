/**
 * This contains
 * - the |Account| class API, which all account types implement
 * - the |MailAccount| class, from which IMAP and POP3 inherit
 */

import util from "../../util/util";
util.importAll(util, global);
import preferences from "../../util/preferences";
const ourPref = preferences.myPrefs;
import { getAllAccounts } from "./account-list"; // for delete account
import RFC822Mail from "../mail/MIME";
import { sanitize } from "../../util/sanitizeDatatypes";
import passwordEncryption from "../../util/password";
import { StringBundle } from "../../trex/stringbundle";
const gStringBundle = new StringBundle("mail");


/**
 * API for all accounts
 *
 * @param accountID {String}   unique ID for this account
 *      used as pref branch name
 */
export class Account {
  constructor(accountID) {
    /**
     * {String}
     */
    this.accountID = sanitize.nonemptystring(accountID);

    /**
     * for prefs .type and password manager
     * {String-enum}
     */
    this.kType = "overwriteme";

    /**
     * prefs branch for this account. null, if not saved yet.
     * {Preferences}
     */
    this._pref = null;

    /**
     * Poll frequency
     * {Integer} in s
     */
    this._interval = 300;
  }

  get prefs() {
    return this._pref;
  }

  get interval() {
    return this._interval;
  }

  set interval(val) {
    this._interval = val;
    if (this._pref) {
      this._pref.set("interval", this._interval);
    }
  }

  get type() {
    return this.kType;
  }

  /**
   * We have credentials that we can probably use for login
   * without having to query the user for password or similar.
   * @returns {Boolean}
   */
  async haveStoredLogin() {
    throw new implementThis();
  }

  /**
   * user says he wants to stay logged in / "remember me"
   * @returns {Boolean}
   */
  get wantStoredLogin() {
    throw new implementThis();
  }

  /**
   * Setter also saves to prefs.
   */
  set wantStoredLogin(val) {
    throw new implementThis();
  }

  /**
   * Store password to use in lext login attempt.
   * If wantStoredLogin is true, it may be saved, too,
   * otherwise not.
   */
  setPassword(password) {
    throw new implementThis();
  }

  /**
   * We are currently logged into the account,
   * or (in the case of POP3) doing periodical mail checks.
   */
  get isLoggedIn() {
    throw new implementThis();
  }

  /**
   * @param continuously {Boolean}
   *    if false, check only once. Logs out afterward.
   *    if true, keeps the connection open via IDLE and waits for the server
   *        to tell us about new mail arrivals.
   * @param successCallback {Function()}
   *    Will be called only once, even if the checks continue.
   */
  async login(continuously) {
    throw new implementThis();
  }

  /**
   * Closes open connections with the server,
   * and stops any possible ongoing periodic checks.
   */
  async logout() {
    throw new implementThis();
  }

  /**
   * remove this account from prefs and here in backend
   */
  deleteAccount() {
    if (this.isLoggedIn) {
      this.logout().catch(errorInBackend);
    }

    ourPref.resetBranch("account." + this.accountID + ".");
    // delete from accounts list pref
    var accounts = ourPref.get("accountsList", "").split(",");
    arrayRemove(accounts, this.accountID, true);
    ourPref.set("accountsList", accounts.join(","));

    getAllAccounts.remove(this); // update account-list.js
  }
}

export function getDomainForEmailAddress(emailAddress) {
  var spl = emailAddress.split("@");
  assert(spl.length == 2, gStringBundle.get("error.syntax"));
  return sanitize.hostname(spl[1]);
}

/**
 * Base class for IMAPAccount and POP3Account
 */
export class MailAccount extends Account {
  constructor(accountID) {
    super(accountID);

    /**
     * {String}
     */
    this.emailAddress = null;

    /**
     * {String}
     */
    this._password = null;

    /**
     * pref says "remember me"
     * {Boolean}
     */
    this._wantStoredLogin = true;

    /**
     * number of mail headers to fetch. Compare email-panel.js kShowNumberOfMails
     * {Integer}
     */
    this._peekMails = 10;

    /**
     * {MapColl of foldername -> MsgFolder}
     */
    this._folders = new MapColl();
  }

  /**
   * Call after constructor
   *
   * @param isNew {Boolean}
   *     if false, read the settings for this account from the prefs
   *     if true, this account is not configured yet.
   *       You must set the required properties (depending on account type),
   *       and then call saveToPrefs().
   */
  init(isNew) {
    if ( !isNew) {
      this._readFromPrefs();
    }
  }

  /**
   * Amount of new mails in all known folders.
   * New here means mails not seen by any IMAP client (called "RECENT" in IMAP).
   * It's NOT the unread mails (called "UNSEEN" in IMAP).
   * {Integer}
   * -1 = not checked
   */
  get newMessageCount() {
    throw new ImplementThis();
  }

  /**
   * Top-level folders, including INBOX
   * {Collection of MsgFolder}
   * may be an empty array when this is not implemented.
   */
  get folders() {
    this._folders;
  }

  /**
   * The primary, default folder to open when the user opens the account
   * {MsgFolder}
   * -1 = not checked
   */
  get inbox() {
    throw new implementThis();
  }

  /**
   * @param email {RFC822Mail}
   */
  markAsRead(email) {
    //throw new NotReached("implement");
  }

  get peekMails() {
    return this._peekMails;
  }

  set peekMails(val) {
    this._peekMails = val;
    //if (this._pref)
      //this._pref.set("peekMails", this._peekMails);
  }

  /**
   * We have a loginToken that we can probably use.
   * A LoginToken is a form of password-less credentials
   * with long or short expiry.
   * @returns {Boolean}
   */
  async haveStoredLogin() {
    if (!!this._password) {
      return true;
    }
    await this._getPasswordFromStore();
    return !!this._password;
  }

  /**
   * user says he wants to stay logged in / "remember me"
   * @returns {Boolean}
   */
  get wantStoredLogin() {
    return this._wantStoredLogin;
  }

  set wantStoredLogin(val) {
    this._wantStoredLogin = sanitize.boolean(val);
    if ( !val) {
      this._deleteStoredPassword();
    }
    if (this._pref) {
      this._pref.set("storeLogin", this._wantStoredLogin);
    }
  }

  /**
   * Use this password for login().
   *
   * If wantStoredLogin is true, stores it persistently in password manager, too,
   * otherwise not.
   *
   * @param password {String}
   */
  async setPassword(password) {
    this._deleteStoredPassword(); // otherwise loginManager throws when already exists
    this._password = sanitize.string(password);
    if ( !this._wantStoredLogin) {
      return;
    }
    var encrypted = await passwordEncryption.encryptPassword(this._password);
    this._pref.set("encryptedPassword", encrypted);
    preferences.savePrefs();
  }

  async _getPasswordFromStore() {
    let encrypted = this._pref.get("encryptedPassword", null);
    if (!encrypted) {
      return false;
    }
    this._password = await passwordEncryption.decryptPassword(encrypted);
    return !!this._password;
  }

  _deleteStoredPassword() {
    this._password = null;
    this._pref.reset("encryptedPassword");
  }

  get domain() {
    return getDomainForEmailAddress(this.emailAddress);
  }

  setServerConfig(config) {
    this.config = config;
    // Interval defaults, protocol-specific
    // We can't set them in the constructor
    // due to the order of calling the base class and readFromPrefs.
    if (config.interval) {
      this._interval = config.interval;
    } else if (config.type == "imap") {
      // If this is too long, the server closes the connection.
      this._interval = 30; // Just for NOOP, not IDLE
    } else if (config.type == "pop3") {
      this._interval = 300;
    }

    this.username = config.username || this.emailAddress;
    this.hostname = config.hostname;
    this.port = config.port;
    this.socketType = config.socketType;
    this._verifyAccountSettings();
  }

  _verifyAccountSettings() {
    sanitize.nonemptystring(this.accountID);
    sanitize.nonemptystring(this.emailAddress);
    getDomainForEmailAddress(this.emailAddress); // checks
    sanitize.hostname(this.hostname);
    sanitize.integerRange(this.port, 0, 65535);
    sanitize.nonemptystring(this.username);
    sanitize.enum(this.socketType, [ 1, 2, 3 ]); // 1 = plain, 2 = SSL, 3 = STARTTLS
    sanitize.integer(this._peekMails);
    sanitize.integer(this._interval);
    assert(this._interval > 0, "check interval is not set");
    sanitize.boolean(this._wantStoredLogin);
  }

  _readFromPrefs() {
    this._pref = ourPref.branch("account." + this.accountID + ".");
    assert(this._pref.get("type") == this.kType);

    this.emailAddress = this._pref.get("emailAddress").toLowerCase();
    this.hostname = this._pref.get("hostname");
    this.port = this._pref.get("port");
    this.socketType = this._pref.get("socketType");
    this.username = this._pref.get("username");
    this._peekMails = this._pref.get("peekMails", this._peekMails);
    this._interval = this._pref.get("interval", this._interval);
    this._wantStoredLogin = this._pref.get("storeLogin", this._wantStoredLogin);

    this._verifyAccountSettings();

    this._getPasswordFromStore();
  }

  saveToPrefs() {
    this._verifyAccountSettings();

    this._pref = ourPref.branch("account." + this.accountID + ".");
    this._pref.set("type", this.kType);
    this._pref.set("emailAddress", this.emailAddress);
    this._pref.set("hostname", this.hostname);
    this._pref.set("port", this.port);
    this._pref.set("socketType", this.socketType);
    this._pref.set("username", this.username);
    //this._pref.set("peekMails", this._peekMails);
    this._pref.set("interval", this._interval);
    this._pref.set("storeLogin", this._wantStoredLogin);

    // add to accounts list pref
    var accounts = ourPref.get("accountsList", "").split(",");
    if ( !arrayContains(accounts, this.accountID)) {
      accounts.push(this.accountID);
      ourPref.set("accountsList", accounts.join(","));
    }

    preferences.savePrefs();
  }

  async logout() {
    this._deleteStoredPassword();

    // Subclasses still need to implement the actual logout,
    // and copy the above code.
    throw new implementThis();
  }

  deleteAccount() {
    this._deleteStoredPassword(); // should be done by logout(), but be sure.

    Account.prototype.deleteAccount.apply(this, arguments);
  }
}


/**
 * This contains a list of messages.
 * It represents e.g.
 * - IMAP folder
 * - POP3 inbox
 * - local mbox
 * - NNTP newsgroup
 * - RSS news feed
 *
 * @param name {String}   Folder name
 *     This is not the full path, but just the name of this one folder.
 * @param fullPath {String}   folder name within the account
 *     This is the full path, including delimiters.
 *     The delimiter depends on the account and server, it may be "/" or "."
 *     or backslash or something else.
 *     Not including the account.
 * @param account {Account}
 */
export class MsgFolder {
  constructor(name, fullPath, account) {
    assert(account instanceof Account);
    this.account = account;

    /**
     * @see ctor
     * {String}
     */
    this.name = sanitize.label(sanitize.nonemptystring(name));

    /**
     * @see ctor
     * {String}
     */
    this.fullPath = sanitize.nonemptystring(fullPath);

    /**
     * {MapColl of MessageID -> RFC822Mail}
     */
    this._messages = new MapColl();

    /**
     * {MapColl of name -> MsgFolder}
     */
    this._subfolders = new MapColl();

    /**
    * Total number of messages in this folder
     * {Integer}
     */
    this.messageCount = 0;

    /**
     * Number of new (unseen) messages in this folder
     * {Integer}
     */
    this.newMessageCount = 0;
  }

  /**
   * The messages in this folder.
   *
   * To sync the locally cached list with the server,
   * call sync(). The collection here will then be
   * updated using the listeners.
   *
   * {Collection of RFC822Mail}
   */
  get messages() {
    return this._messages;
  }

  /**
   * Subfolders folders of this folder.
   * {Collection of MsgFolder}
   * Empty list, if there are no subfolders.
   */
  get folders() {
    return this._subfolders;
  }

  /**
   * Checks for new mail on the server,
   * and downloads the mails.
   */
  async fetch() {
    throw new ImplementThis();
  }
}
