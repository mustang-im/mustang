/**
 * This keeps the list of all account objects created.
 */

import * as util from "../../util/util";
util.importAll(util, global);
import * as collection from "../../util/collection";
util.importAll(collection, global);
import preferences from "../../util/preferences";
const ourPref = preferences.myPrefs;
import { sanitize } from "../../util/sanitizeDatatypes";
import { IMAPAccount } from "../mail/imap";

/**
 * Contains all Account objected created.
 * {Map accountID -> Account}
 */
var gAccounts = new MapColl();

var gHaveReadAll = false;

/**
 * Returns all accounts from prefs and local objects
 * @returns |Map|
 */
function getAllAccounts()
{
  if ( !gHaveReadAll)
  {
    ourPref.get("accountsList", "").split(",").forEach(function(accountID)
    {
      if ( !accountID)
        return;
      if (gAccounts.get(accountID))
        return;
      try {
        _readExistingAccountFromPrefs(accountID); // adds to gAccounts
      } catch (e) { errorInBackend(e); }
    }, this);
    gHaveReadAll = true;
  }

  return gAccounts;
}

function _readExistingAccountFromPrefs(accountID)
{
  sanitize.nonemptystring(accountID);
  var type = ourPref.get("account." + accountID + ".type", null);
  assert(type, "account does not exist in prefs");
  gAccounts.set(accountID, _newAccountOfType(type, accountID, false));
  return gAccounts.get(accountID);
}

// exported only for account-setup.js
function _newAccountOfType(type, accountID, isNew)
{
  let account;
  if (type == "imap") {
    account = new IMAPAccount(accountID);
  //} else if (type == "pop3") {
  //  account = new POP3Account(accountID);
  } else {
    throw new NotReached("unknown account type requested to be created: " + type);
  }
  account.init(isNew);
  return account;
}

/**
 * Returns the |Account| object for |emailAddress|.
 * If the account does not exist yet, returns null;
 */
function getExistingAccountForEmailAddress(emailAddress) {
  sanitize.nonemptystring(emailAddress);
  return getAllAccounts().filter(function(acc) {
    return acc.emailAddress == emailAddress;
  })[0];
}

/**
 * Returns a fake |Account| object with a summary of all accounts.
 * @returns {
 *   isLoggedIn {Boolean}   any of the accounts is logged in
 *   newMailCount {Integer}   total of new mails in all accounts
 *   accountCount {Integer}   number of accounts
 * }
 */
function accountsSummary() {
  var result = {
    isLoggedIn : false,
    newMailCount : 0,
    accountCount : 0,
  };
  getAllAccounts().forEach(function(acc)
  {
    result.accountCount += 1;
    if (acc.newMailCount > 0)
      result.newMailCount += acc.newMailCount;
    if (acc.isLoggedIn)
      result.isLoggedIn = true;
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
var netTeardownListener =
{
  observe : function() {
    getAllAccounts().forEach(account => account.logout());
  }
}
// TODO Port
//Services.obs.addObserver(netTeardownListener, "profile-change-net-teardown", false);


exports.getAllAccounts = getAllAccounts;
exports.accountsSummary = accountsSummary;
exports.getExistingAccountForEmailAddress = getExistingAccountForEmailAddress;
exports._newAccountOfType = _newAccountOfType; // for account-setup.js only
