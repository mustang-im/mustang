#!/usr/bin/env bash

# Run from /mobile/ios

# Install iOS provisioning profile
if [ -f "./apple-dist.mobileprovision" ]; then
    mkdir -p ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles
    cp ./apple-dist.mobileprovision ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles/
    echo "Installed provisioning profile"
else
    echo "Warning: apple-dist.mobileprovision not found in mobile/ios"
fi

cd ../ && bash ./hooks/ios/setup.sh && bash ./hooks/common/build.sh

npx cap sync ios

# Build the project
xcodebuild -workspace './ios/App/App.xcworkspace' -scheme App -destination generic/platform=iOS -archivePath App.xcarchive archive

# Export the archive
xcodebuild archive -archivePath App.xcarchive -exportArchive -exportOptionsPlist ./ios/archive.plist -exportPath output -allowProvisioningUpdates

cd mobile
APP_NAME=$(node -p "require('./capacitor.config.ts').default.appName")
VERSION=$(node -p "require('./package.json').version")
mv output/${APP_NAME}.ipa output/${APP_NAME}-${VERSION}.ipa
