#!/usr/bin/env bash

source ../hooks/ios/variables.sh
export IOS_LIBNODE
source ../hooks/common/variables.sh # TODO move to ../hooks/android/variables.sh
export ANDROID_LIBNODE
export ANDROID_SDK="--sdk$ANDROID_SDK"

cd node_modules;
(cd better-sqlite3 && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK) &&
(cd bufferutil && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK)

unset ANDROID_LIBNODE
unset ANDROID_SDK
unset IOS_LIBNODE
