require("app-module-path").addPath(require("electron").remote.getGlobal("__base"));
var util = require("util/util");
util.importAll(util, global);
util.importAll(require("util/collection"), global);
var remote = require('electron').remote;
var makeNewAccount = remote.require("logic/account/account-setup").makeNewAccount;
var gAccounts = remote.getGlobal("accounts");

function onLoad() {
  try {
    hookupReturnKey(E("realName"), function() {
      E("emailAddress").focus();
    });
    hookupReturnKey(E("emailAddress"), function() {
      E("password").focus();
    });
    hookupReturnKey(E("password"), function() {
      ok();
    });

    assert(gAccounts);
    var accountListE = new Fastlist(E("account-list"));
    accountListE.showCollection(gAccounts);
    gAccounts.registerObserver({
      added : function(items) {
        //alert(items.map(account => account.emailAddress).join(", "));
        alert(gAccounts.map(account => account.emailAddress).contents.join(", "));
      },
      removed : function(items) {
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
    makeNewAccount(emailAddress, function(account) {
      account.setPassword(password);
      account.login(true, function() {
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
