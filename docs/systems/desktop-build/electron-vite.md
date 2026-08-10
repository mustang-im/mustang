# [Electron Vite](https://electron-vite.org/)

Electron Vite is a build tool that uses Vite to build the HTML, CSS, and JavaScript for Electron.

## Why did we choose this?

- It has Vite configurations that work for the main, preload and renderer processes. See [Built-in Config](https://electron-vite.org/config/#built-in-config) documentation for more details.
- It is a single command during build. `electron-vite build`
- It includes `@electron-toolkit/preload` for easily exposing Electron APIs to the renderer process.

## How does it work?

### Main Process

1. Looks for the `index.ts` in `src/main`
2. Compiles the main process code using Vite and the Vite configuration listed in `electron.vite.config.ts`. It looks for the `main` entry point in the configuration.
3. There are preconfigured Vite configurations by electron-vite that work well for Electron. E.g. externalizing dependencies.

### Preload Process

1. Looks for the `index.ts` in `src/preload`
2. Compiles the preload process code using Vite and the Vite configuration listed in `electron.vite.config.ts`. It looks for the `preload` entry point in the configuration.
3. There are preconfigured Vite configurations by electron-vite that work well for Electron. E.g. externalizing dependencies.

### Renderer Process

1. Looks for the `index.html` in `src/renderer`
2. Compiles the renderer process code using Vite and the Vite configuration listed in `electron.vite.config.ts`. It looks for the `renderer` entry point in the configuration. Always make sure that the configuration is the same as `app/frontend/vite.config.ts`. There might be a parse error if there's a missing plugin.
3. There are preconfigured Vite configurations by electron-vite that work well for Electron.
4. Builds the JS bundle from `app/frontend/main.ts`.

### Node Native Modules

The node dependencies are externalized because they contain Node Native Modules which cannot be minified and bundled. Rebuilding the Node Native Modules is done by Electron Builder.

## Dependencies

### Vite

Vite is used to build the individual processes (main, preload, renderer) in the Electron application.

## Debugging

### Frontend/Renderer parse error

1. Verify that the `renderer` configuration in `desktop/electron.vite.config.ts` is the same or similar to `app/frontend/vite.config.ts`.
