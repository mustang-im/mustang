/*
import { remote } from "electron";
import appModulePath from "app-module-path";
appModulePath.addPath(remote.getGlobal("__base"));
import util from "../../util/util";
util.importAll(util, global);
import collection from "../../util/collection";
util.importAll(collection, global);
*/
var remote = require("electron").remote;
require("app-module-path").addPath(remote.getGlobal("__base"));
var util = require("util/util");
util.importAll(util, global);
util.importAll(require("util/collection"), global);

var gAccountListE;
var gFolderListE;
var gMessageListE;

async function start() {
  try {
    gAccountListE = new Fastlist(E("account-list"));
    gFolderListE = new Fastlist(E("folder-list"));
    gMessageListE = new Fastlist(E("message-list"));

    gAccountSelectionObserver.onSelectedItem(null);
    gFolderSelectionObserver.onSelectedItem(null);
    var gAccounts = remote.getGlobal("accounts");
    gAccountListE.showCollection(gAccounts);
    gAccountListE.selectedCollection.registerObserver(gAccountSelectionObserver);
    gFolderListE.selectedCollection.registerObserver(gFolderSelectionObserver);
    gMessageListE.selectedCollection.registerObserver(gMessageSelectionObserver);

    gMessageListE.filldate = getDateString;

    for (let account of gAccounts.contents) {
      if (await account.haveStoredLogin()) {
        try {
          await account.login();
        } catch (e) { pollError(e); }
      }
    }
  } catch (e) { showError(e); }
}
window.addEventListener("load", start, false);

var gAccountSelectionObserver = new SingleSelectionObserver();
gAccountSelectionObserver.onSelectedItem = function(account) {
  gFolderListE.showCollection(account ? account.folders : new ArrayColl());
};

var gFolderSelectionObserver = new SingleSelectionObserver();
gFolderSelectionObserver.onSelectedItem = function(folder) {
  gMessageListE.showCollection(folder ? folder.messages : new ArrayColl());
};

var gMessageSelectionObserver = new SingleSelectionObserver();
gMessageSelectionObserver.onSelectedItem = function(message) {
  if (message) {
    showMessage(message);
  } else {
    // show start page
  }
};

function addAccount() {
  try {
    openWindow("../setup/mail-account-setup.html");
  } catch (e) { showError(e); }
}

function showError(e) {
  console.error(e);
  alert(e.message);
}

function pollError(e) {
  console.error(e);
}

/**
 * This is an overly simplistic function to show the basic contents of
 * an email.
 * @param message {RFC822Mail} @see MIME.js
 */
function showMessage(message) {
  E("msg-from").textContent = message.authorRealname;
  E("msg-subject").textContent = message.subject;
  E("msg-date").textContent = getDateString(message.date);
}

function getDateString(date) {
  var dateDetails = { weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };
  if (date.toDateString() == new Date().toDateString()) { // today
    dateDetails = { hour: "numeric", minute: "numeric" };
  }
  return date.toLocaleString(navigator.language, dateDetails);
}
