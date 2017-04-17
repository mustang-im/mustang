require("app-module-path").addPath(require("electron").remote.getGlobal("__base"));
var util = require("util/util");
util.importAll(util, global);
var getAllAccounts = ("logic/mail/account-list").getAllAccounts;
var gAccountListE;
var gFolderListE;
var gMessageListE;

function start() {
  var gAccountListE = new Fastlist(E("account-list"));
  var gFolderListE = new Fastlist(E("folder-list"));
  var gMessageListE = new Fastlist(E("message-list"));

  gAccountSelectionObserver.selectedItem(null);
  gFolderSelectionObserver.selectedItem(null);
  gAccountListE.showCollection(getAllAccounts());
  gAccountListE.selectedCollection.registerObserver(gAccountSelectionObserver);
  gFolderListE.selectedCollection.registerObserver(gFolderSelectionObserver);
}

var gAccountSelectionObserver = new SingleSelectionObserver();
gAccountSelectionObserver.selectedItem = function(folder) {
  gFolderListE.showCollection(account ? account.folders : new ArrayColl());
};

var gFolderSelectionObserver = new SingleSelectionObserver();
gFolderSelectionObserver.selectedItem = function(folder) {
  gMessageListE.showCollection(folder ? folder.messages : new ArrayColl());
};

function addAccount() {
  openWindow("../setup/mail-account-setup.html");
}
