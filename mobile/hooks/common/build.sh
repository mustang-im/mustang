#!/usr/bin/env bash

export NODE_OPTIONS="--max-old-space-size=32768"

# Update Android settings
node --experimental-strip-types ./hooks/android/update-project.ts

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

# Add organize build phase to iOS project (after cap copy adds its scripts)
node --experimental-strip-types ./hooks/ios/add-organize-build-phase.ts
# Remove duplicate code sign phase (plugin now handles framework creation)
node --experimental-strip-types ./hooks/ios/remove-duplicate-codesign-phase.ts
# Patch bundled index.mjs if needed (optional, dlopen override should handle most cases)
node --experimental-strip-types ./hooks/ios/patch-index-mjs.ts || true

npx @capacitor/assets generate --android
npx @capacitor/assets generate --ios

unset NODE_OPTIONS
