import { remote } from "electron";
import appModulePath from "app-module-path";
appModulePath.addPath(remote.getGlobal("__base"));

import util from "../../../util/util";
util.importAll(util, global);
import collection from "../../../util/collection";
util.importAll(collection, global);

import AccountPane from "./AccountPane";
import FolderPane from "./FolderPane";
import ThreadPane from "./ThreadPane";
import MessagePane from "./MessagePane";

import React, { Component } from "react";
import ReactDOM from "react-dom";
/*
const remote = require("electron").remote;
require("app-module-path").addPath(remote.getGlobal("__base"));

const util = require("util/util");
util.importAll(util, global);
util.importAll(require("util/collection"), global);

const React = require("react");
const Component = React.Component;
const ReactDOM = require("react-dom");
*/

class MainWindow extends Component {
  render() {
    return (
      <MenuBar />
      <Toolbar>
        <button onclick={ () => this.addAccount() }>Add account</button>
        <button onclick={ () => this.newEmail() }>Write</button>
        <button onclick={ () => this.openAddressBook() }>Address book</button>
      </Toolbar>
      <hbox id="window-content-pane" flex="1">
        <vbox id="left-pane" flex="1">
          <AccountPane />
          <FolderPane />
        </vbox>
        <vbox id="right-pane" flex="4">
          <ThreadPane />
        </vbox>
      </hbox>
      <StatusBar />
    );
  }

  addAccount() {
    try {
      openWindow("../setup/mail-account-setup.html");
    } catch (e) { showError(e); }
  }

  newEmail() {
    try {
      throw "Not implemented";
    } catch (e) { showError(e); }
  }

  openAddressBook() {
    try {
      throw "Not implemented";
    } catch (e) { showError(e); }
  }
}

ReactDOM.render(<MainWindow />, document.body);

function MenuBar(props) {
  return null;
}

function StatusBar(props) {
  return null;
}

function Toolbar(props) {
  return (
    <hbox className="toolbar">
      { props.children }
    </hbox>
  );
}

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
          //await account.inbox.fetch();
        } catch (e) { pollError(e); }
        break; // TODO
      }
    }
  } catch (e) { showError(e); }
}
//window.addEventListener("load", start, false);

var gAccountSelectionObserver = new SingleSelectionObserver();
gAccountSelectionObserver.onSelectedItem = function(account) {
  gFolderListE.showCollection(account ? account.folders : new ArrayColl());
};

var gFolderSelectionObserver = new SingleSelectionObserver();
gFolderSelectionObserver.onSelectedItem = async function(folder) {
  gMessageListE.showCollection(folder ? folder.messages : new ArrayColl());
  if (folder) {
    await folder.fetch();
  }
};

var gMessageSelectionObserver = new SingleSelectionObserver();
gMessageSelectionObserver.onSelectedItem = function(message) {
  if (message) {
    showMessage(message);
  } else {
    // show start page
  }
};

function showError(e) {
  console.error(e);
  alert(e.message);
}

function pollError(e) {
  console.error(e);
}

function backgroundError(e) {
  console.error(e);
}
