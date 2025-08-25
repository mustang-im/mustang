#!/usr/bin/env bash

mkdir -p ../mobile/dist

export NODE_OPTIONS="--max-old-space-size=32768"

# Clear LIBNODE cache for release build
is_release=false

for arg in "$@"; do
  if [[ "$arg" == "--release" ]]; then
    is_release=true
    break
  fi
done

if "$is_release"; then
  rm -rf backend/node_modules/prebuild-for-nodejs-mobile/android/libnode
  rm -rf node_modules/capacitor-nodejs/android/libnode
fi

# Setup mobile UI
perl -p -i \
  -e "s|isMobile = false;$|isMobile = true;|;" \
  ../app/logic/build.ts

# Build and copy assets
(cd ../app && npm run build) &&
(cd ./dist && rm -rf * .[!.]* ..?*) &&
(cd ../app && cp -R ./dist/* ../mobile/dist) &&
(cd backend && npm run build) &&
npx cap copy

unset NODE_OPTIONS
