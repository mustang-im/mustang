export IOS_PROVISION_PROFILE_NAME="Mustang Mail"
export IOS_CERTIFICATE_OWNER_NAME="im.mustang.mail"

# Replace all appID in /mobile/backend
perl -p -i \
  -e "s|im.mustang.capa|im.mustang.mail|;" \
  ./backend/backend.ts

# Replace all appID in iOS project
perl -p -i \
  -e "s|im.mustang.capa|im.mustang.mail|;" \
  ./ios/App/App.xcodeproj/project.pbxproj

# Install iOS provisioning profile
if [ -f "ios/build/apple-dist.mobileprovision" ]; then
    mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
    cp ios/build/apple-dist.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
    echo "Installed Mustang provisioning profile"
else
    echo "Warning: apple-dist.mobileprovision not found in ios/build/"
fi