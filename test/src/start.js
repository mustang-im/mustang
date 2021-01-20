/**
 * This is the Electron main process.
 */

import electron from "electron";
import url from "url";
import path from "path";

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

async function start() {
  try {
    createWindow();
  } catch (ex) {
    console.error(ex);
  }
}
app.on("ready", start);

// Window will be closed once this object is garbage collected, so keep it
var mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 800, height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }});

  mainWindow.loadURL(url.format({
    pathname : path.join(__dirname, "public/index.html"),
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
