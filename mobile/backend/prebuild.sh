#!/usr/bin/env bash

cd node_modules;
(cd better-sqlite3 && npx prebuild-for-nodejs-mobile $MOBILE_ARCH)
(cd bufferutil && npx prebuild-for-nodejs-mobile $MOBILE_ARCH)
