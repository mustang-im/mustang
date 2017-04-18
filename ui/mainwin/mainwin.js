require("app-module-path").addPath(require("electron").remote.getGlobal("__base"));
var util = require("util/util");
util.importAll(util, global);
var getAllAccounts = require("logic/account/account-list").getAllAccounts;
var gAccountListE;
var gFolderListE;
var gMessageListE;

function start() {
  try {
    gAccountListE = new Fastlist(E("account-list"));
    gFolderListE = new Fastlist(E("folder-list"));
    gMessageListE = new Fastlist(E("message-list"));

    gAccountSelectionObserver.selectedItem(null);
    gFolderSelectionObserver.selectedItem(null);
    gAccountListE.showCollection(getAllAccounts());
    gAccountListE.selectedCollection.registerObserver(gAccountSelectionObserver);
    gFolderListE.selectedCollection.registerObserver(gFolderSelectionObserver);
    gMessageListE.selectedCollection.registerObserver(gMessageSelectionObserver);
  } catch (e) { console.error(e); alert(e.message); }
}
window.addEventListener("load", start, false);

var gAccountSelectionObserver = new SingleSelectionObserver();
gAccountSelectionObserver.selectedItem = function(account) {
  gFolderListE.showCollection(account ? account.folders : new ArrayColl());
};

var gFolderSelectionObserver = new SingleSelectionObserver();
gFolderSelectionObserver.selectedItem = function(folder) {
  gMessageListE.showCollection(folder ? folder.messages : new ArrayColl());
};

var gMessageSelectionObserver = new SingleSelectionObserver();
gMessageSelectionObserver.selectedItem = function(message) {
  if (message) {
    showMessage(message);
  } else {
    // show start page
  }
};

function addAccount() {
  openWindow("../setup/mail-account-setup.html");
}

/**
 * This is an overly simplistic function to show the basic contents of
 * an email.
 * @param message {RFC822Mail} @see MIME.js
 */
function showMessage(message) {
  E("msg-from").textContent = message.authorRealname;
  E("msg-subject").textContent = message.subject;

  var dateStr = message.date.toLocaleTimeString();
  if (message.date < Date.now().setHours(0, 0, 0, 0)) { // doesn't consider wrong dates in future, but this is a prototype, so...
    dateStr = message.date.toLocaleDateString(); + " " + dateStr;
  }
  E("msg-date").textContent = dateStr;
}
