# Overview

## How does it work?

1. `electron-vite` builds the HTML, CSS, and JavaScript for the application.
2. `electron-builder` packages the application into a distributable format.

## Dependencies

### Electron

The compatible versions of the following all depend on the Electron version.

### Electron Builder

When updating Electron Builder, make sure the Electron version is compatible with the updated Electron Builder version.

### Vite

When updating Vite, make sure the Electron Vite version is compatible with the updated Vite version. For example, the current version of Electron Vite doesn't support Vite 8.

### Electron Vite

When updating Electron Vite, make sure the Electron Builder version is compatible with the updated Electron Vite version.

## Debugging

### Debugging the frontend bundle

1. Go to `app/`
2. Run `yarn dev`
3. Go to `desktop/`
4. Run `yarn dev`

### Debugging the compiled backend JS without a full distribution build

1. Go to `desktop/src/main/index.ts`
2. Remove all `mainWindow.loadURL` conditions in the if-else condition and only keep the `mainWindow.loadFile` that loads the `renderer/index.html` file.
3. Run `yarn start`.

### Debugging a full distribution build

1. Go to `desktop/`
2. Run `yarn build:[os]`, [os] can be `win`, `mac`, or `linux`. Don't add the `release` flag because that uploads the build to GitHub releases.

### macOS

See `macos.md` for debug build without code signing and notarization.
