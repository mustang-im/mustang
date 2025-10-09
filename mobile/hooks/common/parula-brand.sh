#!/usr/bin/env bash

# Run from /mobile

# Replace name in all apps
(cd ../app/build && ./parula-brand.sh)

# Replace Android icons
cp -R parula/android/* android/app/src/main/res

# Relace all appName in /mobile
perl -p -i \
  -e "s|im.mustang.capa|com.beonex.parula|;" \
  -e "s|"Mustang"|"Parula"|;" \
  ./capacitor.config.ts

# Relace all appID in /mobile/backend
perl -p -i \
  -e "s|im.mustang.capa|com.beonex.parula|;" \
  ./backend/backend.ts

export IOS_PROVISION_PROFILE_NAME="Parula"
export IOS_CERTIFICATE_OWNER_NAME="app.parula.mail"

# Install iOS provisioning profile
if [ -f "ios/build/apple-dist.mobileprovision" ]; then
    mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
    cp ios/build/apple-dist-parula.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
    echo "Installed Parula provisioning profile"
else
    echo "Warning: apple-dist.mobileprovision not found in ios/build/"
fi