import util from "../../util/util";
util.importAll(util, global);
import Account from "../account/Account";


/**
 * @see compare CachedFolder
 * Currently unused. CachedMailAccount is used instead.
 */
export default class CachedAccount extends Account {
  constructor(baseAccount, cacheAccount) {
    super(baseAccount.accountID);
    assert(baseAccount instanceof Account);
    assert(cacheAccount instanceof Account);
    this.baseAccount = baseAccount;
    this.cacheAccount = cacheAccount;
  }

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
