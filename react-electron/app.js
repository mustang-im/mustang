/**
 * This is the Electron main process.
 */

import electron from "electron";
import path from "path";
import url from "url";
import appModulePath from "app-module-path";
import { readAccounts } from "../logic/account/account-list";
import { makeNewAccount } from "../logic/account/setup/setup";
appModulePath.addPath(__dirname + "/../");
global.__base = __dirname + "/../";

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
global.makeNewAccount = makeNewAccount;

// Window will be closed once this object is garbage collected, so keep it
var mainWindow;

async function start() {
  try {
    global.accounts = await readAccounts();
    createWindow();
  } catch (ex) {
    console.error(ex);
  }
}
app.on("ready", start);

function createWindow() {
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
