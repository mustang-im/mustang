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
