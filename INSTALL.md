# Install

```
$ yarn install
$ (cd react-electron && yarn run build)
```
(not `yarn build`)

Please use yarn, due to the workspaces that we use in this project.

Do *not* run `yarn install` in the subdirs.

# Run

```
$ yarn run simple-electron
$ yarn run react-electron
```

# Problems

#### sqlite3 not found

  * [StackOverflow: Can't load sqlite3](https://stackoverflow.com/questions/20221825/node-js-says-it-cant-load-sqlite3-module-but-does-anyway)
  * [electron-builder described on StackOverflow](https://stackoverflow.com/a/41230765)
