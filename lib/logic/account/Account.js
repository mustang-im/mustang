import { ourPref } from "../../util/preferences";
import { getAllAccounts } from "./account-list"; // for delete account
import { sanitize } from "../../util/sanitizeDatatypes";
import { ImplementThis } from "../../util/util";

/**
 * API for all accounts
 *
 * @param accountID {String}   unique ID for this account
 *      used as pref branch name
 */
export default class Account {
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

  /**
   * Call after constructor
   * @param isNew {Boolean}
   */
  async init(isNew) {
  }

  get name() {
    return "Generic account";
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
    throw new ImplementThis();
  }

  /**
   * user says he wants to stay logged in / "remember me"
   * @returns {Boolean}
   */
  get wantStoredLogin() {
    throw new ImplementThis();
  }

  /**
   * Setter also saves to prefs.
   */
  set wantStoredLogin(val) {
    throw new ImplementThis();
  }

  /**
   * Store password to use in lext login attempt.
   * If wantStoredLogin is true, it may be saved, too,
   * otherwise not.
   */
  setPassword(password) {
    throw new ImplementThis();
  }

  /**
   * We are currently logged into the account,
   * or (in the case of POP3) doing periodical mail checks.
   */
  get isLoggedIn() {
    throw new ImplementThis();
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
    throw new ImplementThis();
  }

  /**
   * Closes open connections with the server,
   * and stops any possible ongoing periodic checks.
   */
  async logout() {
    throw new ImplementThis();
  }

  /**
   * remove this account from prefs and here in backend
   */
  async deleteAccount() {
    if (this.isLoggedIn) {
      this.logout().catch(errorInBackend);
    }

    ourPref.resetBranch("account." + this.accountID + ".");
    // delete from accounts list pref
    var accounts = ourPref.get("accountsList", "").split(",");
    accounts = accounts.filter(id => id != this.accountID);
    ourPref.set("accountsList", accounts.join(","));

    getAllAccounts.remove(this); // update account-list.js
  }
}
