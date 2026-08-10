# [Electron Builder](https://www.electron.build/)

Electron Builder is a tool that builds and packages your Electron app for distribution.

## Why did we choose this?

- It includes an easy to use auto-update.
- It packages the app for distribution, on all OSes and various installers per OS, with a single command `electron-builder build`.
- It publishes the app to GitHub releases.
- It does code signing for Windows and macOS, and notarization for macOS.

## How does it work?

1. `electron-vite` builds the HTML, CSS and JS bundles
2. Electron Builder packages the app for distribution.

## Auto-update

1. It checks the repository's GitHub Releases.
2. It looks for the latest release.
3. Under the latest release, it looks for the `[channel]-[os]-[arch].yml` file.

See [Auto-update](https://www.electron.build/docs/features/auto-update) in the Electron Builder documentation.

## Dependencies

### Electron

Electron provides the runtime environment for the app. Electron Builder packages the HTML, CSS and JS bundles to run in the Electron runtime.
