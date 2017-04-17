require("app-module-path").addPath(require("electron").remote.getGlobal("__base"));
var util = require("util/util");
util.importAll(util, global);
var getAllAccounts = ("logic/mail/account-list").getAllAccounts;
var gFolderListE;
var gMessageListE;

function start() {
  var accountListE = new Fastlist(E("account-list"));
  var gFolderListE = new Fastlist(E("folder-list"));
  var gMessageListE = new Fastlist(E("message-list"));

  accountSelectionObserver.noAccount();
  accountListE.showCollection(getAllAccounts());
  accountListE.selectedCollection.registerObserver(accountSelectionObserver);
}

function addAccount() {
  openWindow("../setup/mail-account-setup.html");
}

var accountSelectionObserver = {
  added : function(accounts, selectedAccounts) {
    this.showAccount(selectedAccounts.first);
  },
  removed : function(accounts, selectedAccounts) {
    if (selectedAccounts.isEmpty) {
      this.noAccount();
    } else {
      this.showAccount(selectedAccounts.first);
    }
  },
  showAccount : function(account) {
    gFolderListE.showCollection(account.folders);
    gMessageListE.showCollection(account.inbox);
  },
  noAccount : function() {
    gFolderListE.showCollection(new ArrayColl());
    gMessageListE.showCollection(new ArrayColl());
  },
};
