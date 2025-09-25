#!/usr/bin/env bash

source ../hooks/common/variables.sh
export ANDROID_LIBNODE
export ANDROID_SDK="--sdk$ANDROID_SDK"

cd node_modules;
(cd better-sqlite3 && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK) &&
(cd bufferutil && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK)

unset ANDROID_LIBNODE
unset ANDROID_SDK
