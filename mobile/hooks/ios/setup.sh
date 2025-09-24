#!/usr/bin/env bash

mkdir -p ./resources
cd ./resources

# Gets the latest release download URL from GitHub API
# DOWNLOAD_URL=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/releases/latest" \
#   | jq -r '.assets[] | select(.name | test("ios.*\\.zip")) | .browser_download_url')

DOWNLOAD_URL="https://github.com/mustang-im/nodejs-mobile/releases/download/v24.5.0/nodejs-mobile-v24.5.0-ios.zip"
TMP_ZIP_FILE="tmp.zip"

# Download the file
echo "Downloading $DOWNLOAD_URL"
curl -L -o $TMP_ZIP_FILE "$DOWNLOAD_URL"

unzip -o $TMP_ZIP_FILE -d ./
rm -r $TMP_ZIP_FILE ./include

echo "Download and extraction complete."
