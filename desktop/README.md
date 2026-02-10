# e2

An Electron application with Svelte and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

## Project Setup

### Install

```bash
$ yarn install
$ cd ../app/
$ yarn install
```

### Development

1. Start dev server on http://localhost:5454

```bash
$ cd ../app/
$ yarn run dev
```

2. Start Electron app
2.1. Starts node.js with JPC WebSocket on ws://locahost:5455
(see src/main/index.ts `startupLogic()`)
2.2. Also starts Electron main window with http://localhost:5454
(see src/main/index.ts `mainWindow.loadURL()`)

```bash
$ cd desktop/
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```
