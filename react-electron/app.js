/**
 * This is the Electron main process.
 */

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
require("app-module-path").addPath(__dirname + "/../");
global.__base = __dirname + "/../";

global.accounts = require("../logic/account/account-list").getAllAccounts();
global.makeNewAccount = require("../logic/account/account-setup").makeNewAccount;

// Window will be closed once this object is garbage collected, so keep it
var mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600,
      webPreferences: { nodeIntegration: true }});

  mainWindow.loadURL(url.format({
    pathname : path.join(__dirname, "mainwin/MainWindow.html"),
    protocol : 'file:',
    slashes : true,
  }));

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

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
