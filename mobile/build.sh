#!/usr/bin/env bash

mkdir -p ../mobile/dist

export NODE_OPTIONS="--max-old-space-size=32768"

bash ./hooks/common/mobile-ui.sh &&
(cd ../app && npm run build && cp -R ./dist/* ../mobile/dist) &&
(cd backend && npm run build) &&
npx cap copy

unset NODE_OPTIONS
