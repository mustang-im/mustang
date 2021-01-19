import MailAccount from "../mail/MailAccount";
import util from "../../util/util";
util.importAll(util, global);


/**
 * @see CachedFolder
 */
export default class CachedMailAccount extends MailAccount {
  constructor(baseAccount, cacheAccount) {
    assert(baseAccount instanceof MailAccount);
    assert(cacheAccount instanceof MailAccount);
    super(baseAccount.accountID);
    /**
     * The server protocol implementation, e.g. IMAPAccount
     */
    this.baseAccount = baseAccount;
    /**
     * The cache implementation, e.g. SQLAccount
     */
    this.cacheAccount = cacheAccount;

    this.kType = "cached";

    /**
    * Listen to changes in base account and write them to the local cache.
    *
    * Note that cacheAccount holds a superset of baseAccount, when the
    * baseAccount has not logged in yet, but the cached account knows
    * the folders from previous logins.
    */
    this.baseAccount.folders.registerObserver({
      added: async folders => this.cacheAccount.addFolders(folders),
      removed: async folders => this.cacheAccount.removeFolders(folders),
    });
  }

  // MailAccount API

  async init(isNew) {
    await this.cacheAccount.init(isNew);
    await this.baseAccount.init(isNew);
  }

  get emailAddress() {
    return this.baseAccount.emailAddress;
  }

  /**
   * If you want the most current count from the server,
   * you need to call `fetch()`.
   */
  get newMessageCount() {
    return this.cacheAccount.newMessageCount;
  }

  get folders() {
    return this.cacheAccount.folders;
  }

  /**
   * The primary, default folder to open when the user opens the account
   * {MsgFolder}
   * -1 = not checked
   */
  get inbox() {
    return this.cacheAccount.inbox;
  }

  get domain() {
    return this.baseAccount.domain;
  }

  setServerConfig(config) {
    return this.baseAccount.setServerConfig(config);
  }

  saveToPrefs() {
    this.baseAccount.saveToPrefs();
  }

  /**
   * @param parent {MsgFolder or null} The parent folder.
   *     null means root folder
   * @param name {string}   The user-visible name of the folder.
   *     Note: The fullPath will be created by implicitly.
   * @returns {MsgFolder}
   */
  async createFolder(parent, name) {
    assert(!parent || parent instanceof MsgFolder);
    assert(typeof(name) == "string");
    throw new ImplementThis();
  }

  // Account API

  async haveStoredLogin() {
    return this.baseAccount.haveStoredLogin();
  }

  get wantStoredLogin() {
    return this.baseAccount.wantStoredLogin;
  }

  set wantStoredLogin(val) {
    this.baseAccount.wantStoredLogin(val);
  }

  setPassword(password) {
    this.baseAccount.setPassword(password);
  }

  get isLoggedIn() {
    return this.baseAccount.isLoggedIn();
  }

  async login(continuously) {
    await this.baseAccount.login(continuously);
  }

  async logout() {
    await this.baseAccount.logout();
  }

  async deleteAccount() {
    await this.baseAccount.deleteAccount();
    await this.cacheAccount.deleteAccount();
  }
}
