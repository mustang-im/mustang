import Account from "../account/Account";
import passwordEncryption from "../../util/password";
import util from "../../util/util";
util.importAll(util, global);
import { sanitize } from "../../util/sanitizeDatatypes";
import preferences from "../../util/preferences";
const ourPref = preferences.myPrefs;
import { StringBundle } from "../../trex/stringbundle";
const gStringBundle = new StringBundle("mail");


/**
 * Base class for IMAPAccount and POP3Account
 */
export default class MailAccount extends Account {
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
    throw new ImplementThis();
  }

  /**
   * @param email {EMail}
   */
  markAsRead(email) {
    //throw new ImplementThis();
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

export function getDomainForEmailAddress(emailAddress) {
  var spl = emailAddress.split("@");
  assert(spl.length == 2, gStringBundle.get("error.syntax"));
  return sanitize.hostname(spl[1]);
}
