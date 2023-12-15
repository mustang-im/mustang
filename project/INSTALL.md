# Install

```
(cd lib/ && yarn install)
(cd svelte-electron/ && yarn install)
```

# Run

```
cd svelte-electron/
yarn run dev
```

# Development setup

```
(cd lib/ && yarn link)
cd svelte-electron/
yarn link mustang-lib
yarn install
yarn run dev
```

# Problems

#### sqlite3 not found

1. `rm -rf */node_modules/`
2. Repeat install

* [StackOverflow: Can't load sqlite3](https://stackoverflow.com/questions/20221825/node-js-says-it-cant-load-sqlite3-module-but-does-anyway)
* [electron-builder described on StackOverflow](https://stackoverflow.com/a/41230765)
