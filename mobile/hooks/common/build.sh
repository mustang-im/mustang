#!/usr/bin/env bash

export NODE_OPTIONS="--max-old-space-size=32768"

# Determine platform from MOBILE_ARCH environment variable
PLATFORM="all"
if [ -n "$MOBILE_ARCH" ]; then
  if [[ "$MOBILE_ARCH" == android* ]]; then
    PLATFORM="android"
  elif [[ "$MOBILE_ARCH" == ios* ]]; then
    PLATFORM="ios"
  fi
fi

echo "Building for platform: $PLATFORM (MOBILE_ARCH: ${MOBILE_ARCH:-not set})"

# Update Android settings (only for Android or all)
if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
  node --experimental-strip-types ./hooks/android/update-project.ts
  npx @capacitor/assets generate --android
fi

# Setup mobile UI
perl -p -i \
  -e "s|isMobile = false;$|isMobile = true;|;" \
  ../app/logic/build.ts

# Build and copy assets
(cd ../app && npm run build) &&
(rm -rf ./dist; mkdir -p ./dist) &&
(cd ../app && cp -R ./dist/* ../mobile/dist) &&
(cd backend && npm run build) &&
npx cap copy

unset NODE_OPTIONS
