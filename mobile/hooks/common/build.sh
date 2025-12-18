#!/usr/bin/env bash

export NODE_OPTIONS="--max-old-space-size=32768"

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

npx @capacitor/assets generate --ios

unset NODE_OPTIONS
