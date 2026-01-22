import { setMainWindow, startupBackend, shutdownBackend, startupArgs } from '../../../backend/backend';
import { app, shell, BrowserWindow, session } from 'electron'
import { ipcMain } from 'electron/main';
import { join } from 'path'
import electronUpdater, { type UpdateCheckResult } from 'electron-updater';
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../build/icon.png?asset'
const { autoUpdater } = electronUpdater;

function createWindow(): void {
  try {
    startupBackend();

    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 1700,
      height: 950,
      show: false,
      autoHideMenuBar: true,
      titleBarStyle: process.platform == 'darwin' ? 'hiddenInset' : 'customButtonsOnHover',
      titleBarOverlay: true,
      frame: false,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(import.meta.dirname, '../preload/index.mjs'),
        sandbox: false,
        webviewTag: true,
        backgroundThrottling: false,
      }
    })
    setMainWindow(mainWindow);

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.on('closed', shutdownBackend);

    /** Ensure that new web windows are opened in the browser, not inside our app.
     *
     * Attention: This does *not* catch normal `<a href="">` links.
     * Thus, sanitizeHTML() adds a `target="_blank"` to such links,
     * which is considered a new web window and forces them to end up here. */
    mainWindow.webContents.setWindowOpenHandler((details): any => {
      // Chrome special-cases "about:blank". Make *sure* that we don't get this here.
      if (!details.url?.startsWith("https://")) {
        return { action: 'deny' };
      }
      // Allow windows opened by us for OAuth2
      // Must match OAuth2Window.ts login()
      if (details?.features?.includes("oauth2popup")) {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: "center,noopener,noreferrer,sandbox=true",
        };
      }
      // Open the URL in the system web browser
      shell.openExternal(details.url)
      // ... and do not open a new Electron window
      return { action: 'deny' }
    })

    mainWindow.webContents.on('did-create-window', (child, _details) => {
      child.on('closed', () => {
        mainWindow.webContents.send('oauth2-close');
      });
      child.webContents.on('did-navigate', (_event, url) => {
        mainWindow.webContents.send('oauth2-navigate', url);
      });
      // Workaround for window.close() not closing in some cases
      ipcMain.on('oauth2-close', () => {
        child.close();
      });
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && true) {
      mainWindow.loadURL('http://localhost:5454');
    } else if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  } catch (ex) {
    console.error(ex);
  }
}

const gotLock = app.requestSingleInstanceLock();
if (gotLock) {
  app.whenReady()
    .then(whenReady);
} else {
  // This is a second instance
  app.quit();
  // Event 'second-instance' will be called within the primary instance
}

let update: UpdateCheckResult | null = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
async function whenReady() {
  // Set app user model id for MS Windows
  // <https://learn.microsoft.com/en-us/windows/win32/shell/appids>
  electronApp.setAppUserModelId('im.mustang');

  // Remove exec path
  handleCommandline(process.argv.splice(1));

  allowCrossDomainRequestsFromFrontend();

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  try {
    update = await autoUpdater.checkForUpdatesAndNotify();
    setInterval(async () => {
      try {
        if (update?.updateInfo.version) {
          console.log(`Already have update waiting.`);
          return; // `checkForUpdates()` downloads the update on every call
        }
        console.log("Routinely checking for app updates...");
        update = await autoUpdater.checkForUpdatesAndNotify();
      } catch (ex) {
        console.error(ex);
      }
    }, 60 * 60 * 1000); // once per hour - TODO Change to once per day, when we make less frequent releases
  } catch (ex) {
    console.error(ex);
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform == 'darwin') {
    updateAndRestartNowIfNeeded();
  } else {
    app.quit();
  }
});

async function updateAndRestartNowIfNeeded() {
  await update?.downloadPromise;
  if (update?.updateInfo.version) {
    autoUpdater.autoRunAppAfterInstall = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.quitAndInstall();
    // TODO restart after install, but open only a background window
  } // else do nothing
}

// macOS: Capture URL during launch
app.on("open-url", (_event, url) => {
  startupArgs.url = url;
  startupArgs.notifyObservers();

  if (BrowserWindow.getAllWindows().length == 0 && app.isReady()) {
    createWindow();
  }
});

/** Called within the primary instance when a second instance of our app was called. */
app.on("second-instance", (_, argv) => {
  // Remove executable path and "--allow-file-access-from-files"
  handleCommandline(argv.splice(2));
});

function handleCommandline(args: string[]) {
  try {
    console.log("commandline arguments", args);
    startupArgs.commandline = args;
    let lastArg = args[args.length - 1];
    if (lastArg?.includes(":")) {
      let urlObj = new URL(lastArg); // Check syntax
      startupArgs.url = urlObj.href;
    }
    startupArgs.notifyObservers();
  } catch (ex) {
    console.error(ex);
  }
}

function allowCrossDomainRequestsFromFrontend() {
  const filter = { urls: ["https://*/*", "http://*/*"] };
  session.defaultSession.webRequest.onBeforeSendHeaders(
    filter,
    (details, callback) => {
      let requestHeaders = details.requestHeaders ?? {};
      for (let name in requestHeaders) {
        switch (name.toLowerCase()) {
        case "origin":
        case "referer":
          delete requestHeaders[name];
        }
      }
      callback({ requestHeaders: requestHeaders });
    }
  );
  session.defaultSession.webRequest.onHeadersReceived(
    filter,
    (details, callback) => {
      let responseHeaders = details.responseHeaders ?? {};
      // Remove server response
      for (let name in responseHeaders) {
        let lowercase = name.toLowerCase();
        if (lowercase.startsWith("access-control-allow-")) {
          delete responseHeaders[lowercase];
        }
      }
      // Allow frontend to access other servers
      responseHeaders["Access-Control-Allow-Origin"] = ["*"];
      responseHeaders["Access-Control-Allow-Methods"] = ["*"];
      responseHeaders["Access-Control-Allow-Headers"] = ["*"];
      // Pretend that all CORS preflight requests succeed
      let statusLine = details.method == "OPTIONS" ? "HTTP/1.1 200 OK" : details.statusLine;
      // console.log("Response", details.url, responseHeaders);
      callback({ responseHeaders, statusLine });
    }
  );
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
