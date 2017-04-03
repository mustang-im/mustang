Components.utils.import("resource://corvette/util/util.js");
importJSM("logic/account/account-list.js", this);

function start() {
  var folderList = new Fastlist(E("folder-list"));
  var messageList = new Fastlist(E("message-list"));

  folderList.showCollection(getAllAccounts());
}

function addAccount() {
  openWindow("../setup/mail-account-setup.html");
}
