#!/usr/bin/env bash

source ../hooks/common/variables.sh
export ANDROID_LIBNODE="https://github.com/mustang-im/nodejs-mobile/releases/download/v22.9.0/nodejs-mobile-v22.9.0-android.zip"
export ANDROID_SDK="--sdk35"
export IOS_LIBNODE

cd node_modules;
(cd better-sqlite3 && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK) &&
(cd bufferutil && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK)

unset ANDROID_LIBNODE
unset ANDROID_SDK
unset IOS_LIBNODE
