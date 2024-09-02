import { setMainWindow, startupBackend } from '../../../backend/backend';
import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater';
import contextMenu from 'electron-context-menu';
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Set app data directory name to capitalized 'Mustang' on Mac OS instead of 'mustang'
if (process.platform == 'darwin') {
  app.setName('Mustang');
}

function createWindow(): void {
  try {
    startupBackend();

    contextMenu({
      showSelectAll: true,
      showSaveImageAs: true,
      showServices: true,
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 1700,
      height: 950,
      show: false,
      autoHideMenuBar: true,
      titleBarStyle: 'customButtonsOnHover',
      titleBarOverlay: true,
      frame: false,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        webviewTag: true,
      }
    })
    setMainWindow(mainWindow);

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
    })

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  try {
    await autoUpdater.checkForUpdatesAndNotify();
  } catch (ex) {
    console.error(ex);
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
