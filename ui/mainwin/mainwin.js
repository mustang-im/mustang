require("app-module-path").addPath(require("electron").remote.getGlobal("__base"));
var util = require("util/util");
util.importAll(util, global);
var getAllAccounts = ("logic/mail/account-list").getAllAccounts;

function start() {
  var folderList = new Fastlist(E("folder-list"));
  var messageList = new Fastlist(E("message-list"));

  folderList.showCollection(getAllAccounts());
}

function addAccount() {
  openWindow("../setup/mail-account-setup.html");
}
