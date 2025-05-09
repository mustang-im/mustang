#!/usr/bin/env bash

(cd ../app && npm run build && cp -R ./dist ../mobile/dist) &&
(cd backend && npm run build) &&
npx cap sync
