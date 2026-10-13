# Linux Flathub

## Flatpak

- Electron Builder does not support building a Flatpak package for publishing to Flathub.

To build a Flatpak package for Flathub:

1. Install `flatpak` and `flatpak-builder`.
2. Install [`Freedesktop`](https://gitlab.com/freedesktop-sdk/freedesktop-sdk) runtime, the Electron BaseApp, and the Node.js SDK extension. Make sure the latest stable version is installed because Flathub requires it.
3. Create a `[appID].yml` manifest file in `desktop/` which is used for building the Flatpak package.
4. Set `runtime` to `org.freedesktop.Platform` and `runtime-version` to the version you installed in step 2.
5. Set `sdk` to `org.freedesktop.Sdk`.
6. Set `base` to `org.electronjs.Electron2.BaseApp` and `base-version` to the version you installed in step 2.
7. Add `org.freedesktop.Sdk.Extension.node[version]` to the `sdk-extensions` list. The version should be the version you installed in step 2.
8. Under `build-options.append-path` set `/usr/lib/sdk/node[version]/bin`. The version should be the version you installed in step 2.
9. Specify permissions because the Flatpak runs in a sandbox.
10. Generate a `generated-source.json` file which is a `package-lock.json` of all the dependencies that will be needed. Because when the Flatpak is building it has no access to internet to fetch the more current versions.

See [Flatpak Electron Guide](https://docs.flatpak.org/en/latest/electron.html) for more information and updated instructions.

See [Electron Sample App](https://github.com/flathub/org.flathub.electron-sample-app) for a sample Electron Flatpak package.

## Flathub

1. Fork the [Flathub repository](https://github.com/flathub/flathub).
2. Add the `[appID].yml` manifest file of your application to the repository.
3. Create a pull request to the Flathub repository.

Flathub requires the application to be built on their servers.
