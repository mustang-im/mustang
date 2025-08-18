#!/usr/bin/env bash

mkdir -p ../mobile/dist

(cd ../app && npm run build && cp -R ./dist/* ../mobile/dist) &&
(cd backend && npm run build) &&
npx cap sync
