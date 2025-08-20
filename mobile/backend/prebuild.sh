#!/usr/bin/env bash

export ANDROID_LIBNODE="https://github.com/mustang-im/nodejs-mobile/releases/download/v22.9.0/nodejs-mobile-v22.9.0-android.zip"

cd node_modules;
(cd better-sqlite3 && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK) &&
(cd bufferutil && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK)
