#!/usr/bin/env bash

mkdir -p ../mobile/dist

export NODE_OPTIONS="--max-old-space-size=32768"

# Setup mobile UI
perl -p -i \
  -e "s|isMobile = false;$|isMobile = true;|;" \
  ../app/logic/build.ts

(cd ../app && npm run build && cp -R ./dist/* ../mobile/dist) &&
(cd backend && npm run build) &&
npx cap copy

unset NODE_OPTIONS
