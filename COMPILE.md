# How to set up your development environment

## Install
1. `yarn install`
2. `$(npm bin)/electron-rebuild`

## Run
1. `cd react-electron`
2. `npm start`
or from main dir:
1. `npm run react-electron`

## Gotchas
1. We're using yarn workspaces. The top-level package.json file contains the common dependencies, and each sub-project like react-electron has its own package.json file.
