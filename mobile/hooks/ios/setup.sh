#!/usr/bin/env bash

# Run from /mobile

source ./hooks/ios/variables.sh

# Check if libnode already exists
if [ -f "./ios/App/resources/NodeMobile.xcframework" ]; then
    echo "libnode already exists, skipping download."
    exit 0
fi

mkdir -p ./ios/App/resources
cd ./ios/App/resources

# Gets the latest release download URL from GitHub API
# DOWNLOAD_URL=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/releases/latest" \
#   | jq -r '.assets[] | select(.name | test("ios.*\\.zip")) | .browser_download_url')

DOWNLOAD_URL="$IOS_LIBNODE"
TMP_ZIP_FILE="libnode-download.zip"

# Download the file
echo "Downloading $DOWNLOAD_URL"
curl -L -o $TMP_ZIP_FILE "$DOWNLOAD_URL"

unzip -o $TMP_ZIP_FILE -d ./
rm -r $TMP_ZIP_FILE ./include

echo "Download and extraction complete."
