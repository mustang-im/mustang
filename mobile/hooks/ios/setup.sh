#!/usr/bin/env bash

mkdir -p ./resources
cd ./resources

DOWNLOAD_URL="https://github.com/mustang-im/nodejs-mobile/releases/download/v24.5.0/nodejs-mobile-v24.5.0-ios.zip"

# Download the file
echo "Downloading $DOWNLOAD_URL"
curl -L -o latest_release.zip "$DOWNLOAD_URL"

unzip -o latest_release.zip -d ./
rm -r latest_release.zip ./*/include
mv ./*/NodeMobile.xcframework ./

echo "Download and extraction complete."
