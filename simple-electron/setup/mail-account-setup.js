/*
import { remote } from "electron";
import util from "mustang-lib/util/util";
util.importAll(util, global);
const gAccounts = remote.getGlobal("accounts");
*/
var remote = require("electron").remote;
var util = require("mustang-lib/util/util");
util.importAll(util, global);
var gAccounts = remote.getGlobal("accounts");
const addNewAccountFromConfig = remote.getGlobal("addNewAccountFromConfig");
const findAccountConfig = remote.getGlobal("findAccountConfig");


function onLoad() {
  try {
    hookupReturnKey(E("realName"), () => {
      E("emailAddress").focus();
    });
    hookupReturnKey(E("emailAddress"), () => {
      E("password").focus();
    });
    hookupReturnKey(E("password"), () => {
      ok();
    });

    assert(gAccounts);
    var accountListE = new Fastlist(E("account-list"));
    accountListE.showCollection(gAccounts);
    gAccounts.registerObserver({
      added: items => {
        alert("Added " + items.map(account => account.emailAddress).join(", "));
      },
      removed: items => {
      },
    });
  } catch(e) { errorShow(e); }
}
window.addEventListener("load", onLoad, false);

function ok() {
  try {
    errorShow(false);
    var checkingE = E("checking");
    checkingE.removeAttribute("hidden");
    resizeWindow();
    var emailAddress = E("emailAddress").value;
    var password = E("password").value;

    assert(gAccounts);
    findAccountConfig(emailAddress, gAccounts, async config => {
      let account = await addNewAccountFromConfig(config);
      account.setPassword(password);
      account.login(true, () => {
        window.close();
      }, errorShow);
    }, errorShow);
  } catch (e) { errorShow(e); }
}

function errorShow(ex) {
  var errorE = E("error");
  if (ex) {
    errorE.removeAttribute("hidden");
    errorE.textContent = ex + "\n";
    console.error(ex);
  } else {
    errorE.setAttribute("hidden", "true");
  }
  resizeWindow();
}
