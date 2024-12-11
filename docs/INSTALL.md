<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

# Development setup

1. Install
```
(cd app; yarn); (cd e2; yarn); (cd backend/; yarn); (cd lib/jpc-ws/; yarn)
```

2. In terminal 1:
```
cd app/
yarn run dev
```

3. In terminal 2:
```
cd e2/
yarn run dev
```

# Build release

1. Install: See as dev Install above
2. Build
```
(cd app; yarn build)
(cd e2; yarn build:win)
(cd e2; yarn build:linux)
(cd e2; yarn build:mac)
```

# Problems

#### sqlite3 not found

1. `rm -rf */node_modules/`
2. Repeat install

* [StackOverflow: Can't load sqlite3](https://stackoverflow.com/questions/20221825/node-js-says-it-cant-load-sqlite3-module-but-does-anyway)
* [electron-builder described on StackOverflow](https://stackoverflow.com/a/41230765)
