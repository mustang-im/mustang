/**
 * This is the Electron main process.
 */

import electron from "electron";
import path from "path";
import url from "url";
import appModulePath from "app-module-path";
import { getAllAccounts } from "../logic/account/account-list";
import { makeNewAccount } from "../logic/account/account-setup";
appModulePath.addPath(__dirname + "/../");
global.__base = __dirname + "/../";

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
global.makeNewAccount = makeNewAccount;

async function start() {
  try {
    global.accounts = getAllAccounts();
    createWindow();
  } catch (ex) {
    console.error(ex);
  }
}

// Window will be closed once this object is garbage collected, so keep it
var mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }});

  mainWindow.loadURL(url.format({
    pathname : path.join(__dirname, "mainwin/mainwin.html"),
    protocol : 'file:',
    slashes : true,
  }));

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", start);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
