/**
 * This keeps the list of all account objects created.
 */

import IMAPAccount from "../mail/imap/IMAPAccount";
import IMAPFolder from "../mail/imap/IMAPFolder";
import IMAPMessage from "../mail/imap/IMAPMessage";
import CachedMailAccount from "../storage/CachedMailAccount";
import CachedFolder from "../storage/CachedFolder";
import SQLAccount from "../storage/SQLAccount";
import SQLFolder from "../storage/SQLFolder";
import * as util from "../../util/util";
util.importAll(util, global);
import * as collection from "../../util/collection";
util.importAll(collection, global);
import preferences from "../../util/preferences";
const ourPref = preferences.myPrefs;
import { sanitize } from "../../util/sanitizeDatatypes";

/**
 * Contains all Account objected created.
 * {Map accountID -> Account}
 */
var gAccounts = new MapColl();

var gHaveReadAll = false;

/**
 * Returns all configured accounts
 * @returns |Map|
 */
export function getAllAccounts() {
  if ( !gHaveReadAll) {
    throw new Error("Call await readAccounts() first");
  }
  return gAccounts;
}

/**
 * Reads all accounts from prefs and initializes them.
 */
export async function readAccounts() {
  if ( !gHaveReadAll) {
    for (let accountID of ourPref.get("accountsList", "").split(",")) {
      if ( !accountID || gAccounts.get(accountID)) {
        return;
      }
      try {
        let account = await _readExistingAccountFromPrefs(accountID);
        gAccounts.set(accountID, account);
      } catch (e) { errorInBackend(e); }
    }
    gHaveReadAll = true;
  }
  return gAccounts;
}

async function _readExistingAccountFromPrefs(accountID) {
  sanitize.nonemptystring(accountID);
  var type = ourPref.get("account." + accountID + ".type", null);
  assert(type, "account does not exist in prefs");
  return await _newAccountOfType(type, accountID, false);
}

/**
 * Create a new |Account| object for |config.emailAddress| with |config|.
 * @param config {AccountConfig}
 * @returns {Account}
 */
export async function addNewAccountFromConfig(config) {
  assert(typeof(config.emailAddress) == "string" && !config.emailAddress.includes("%"), "need email address in config");
  assert( !getExistingAccountForEmailAddress(config.emailAddress), "account already exists");
  var accountID = generateNewAccountID();
  let account = await _newAccountOfType(config.subtype || config.type, accountID, true);
  account.emailAddress = emailAddress;
  account.setServerConfig(config);
  account.saveToPrefs();
  gAccounts.set(accountID,  account);
  //notifyGlobalObservers("account-added", { account : account });
  return account;
}

function generateNewAccountID() {
  var existingAccountIDs = gAccounts.map(account => account.accountID);
  var newAccountID;
  var i = 1;
  do {
    newAccountID = "account" + i++;
  } while (existingAccountIDs.contains(newAccountID) ||
      ourPref.get("account." + newAccountID + ".type", null))
  return newAccountID;
}

// exported only for account-setup.js
export async function _newAccountOfType(type, accountID, isNew) {
  let baseAccount;
  let baseFolderClass;
  let baseEMailClass;
  if (type == "imap") {
    baseAccount = new IMAPAccount(accountID);
    baseFolderClass = IMAPFolder;
    baseEMailClass = IMAPMessage;
  //} else if (type == "pop3") {
  //  baseAccount = new POP3Account(accountID);
  } else {
    throw new NotReached("unknown account type requested to be created: " + type);
  }

  // Wire base account with local caches
  let newEmail = folder => {
    return new baseEMailClass(folder);
  }
  let newFolder = (name, fullPath, account, parentFolder) => {
    let baseFolder = new baseFolderClass(name, fullPath, account, parentFolder);
    let cacheFolder = new SQLFolder(baseFolder, newEmail);
    return new CachedFolder(baseFolder, cacheFolder);
  }
  let cacheAccount = new SQLAccount(baseAccount, newFolder);
  let account = new CachedMailAccount(baseAccount, cacheAccount);
  await account.init(isNew);
  return account;
}

/**
 * Returns the |Account| object for |emailAddress|.
 * If the account does not exist yet, returns null;
 */
export function getExistingAccountForEmailAddress(emailAddress) {
  sanitize.nonemptystring(emailAddress);
  return getAllAccounts().find(acc => acc.emailAddress == emailAddress);
}

/**
 * Returns a fake |Account| object with a summary of all accounts.
 * @returns {
 *   isLoggedIn {Boolean}   any of the accounts is logged in
 *   newMailCount {Integer}   total of new mails in all accounts
 *   accountCount {Integer}   number of accounts
 * }
 */
export function accountsSummary() {
  var result = {
    isLoggedIn : false,
    newMailCount : 0,
    accountCount : 0,
  };
  getAllAccounts().forEach(acc => {
    result.accountCount += 1;
    if (acc.newMailCount > 0) {
      result.newMailCount += acc.newMailCount;
    }
    if (acc.isLoggedIn) {
      result.isLoggedIn = true;
    }
  });
  return result;
}

/**
 * Our IMAP connection is persistent.
 *
 * This means that when we shutdown, we need to kill the connection.
 *
 * The profile-change-net-teardown notification happens before the network
 * connection is dropped, so it is the correct time to do this.
 */
var netTeardownListener = {
  observe : function() {
    getAllAccounts().forEach(account => account.logout());
  }
}
// TODO Port
//Services.obs.addObserver(netTeardownListener, "profile-change-net-teardown", false);
