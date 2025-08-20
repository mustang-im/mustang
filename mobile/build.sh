#!/usr/bin/env bash

mkdir -p ../mobile/dist

export NODE_OPTIONS="--max-old-space-size=32768"

(cd ../app && npm run build && cp -R ./dist/* ../mobile/dist) &&
(cd backend && npm run build) &&
npx cap copy

unset NODE_OPTIONS
