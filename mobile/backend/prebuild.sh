#!/usr/bin/env bash

# Only prebuild for Android, not iOS
if [[ "$MOBILE_ARCH" != android* ]]; then
  echo "Skipping prebuild (only runs for Android, MOBILE_ARCH=$MOBILE_ARCH)"
  exit 0
fi

export ANDROID_LIBNODE="https://github.com/mustang-im/nodejs-mobile/releases/download/v22.9.0/nodejs-mobile-v22.9.0-android.zip"
export ANDROID_SDK="--sdk35"

cd node_modules;
(cd better-sqlite3 && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK) &&
(cd bufferutil && npx prebuild-for-nodejs-mobile $MOBILE_ARCH $ANDROID_SDK)

unset ANDROID_LIBNODE
unset ANDROID_SDK
