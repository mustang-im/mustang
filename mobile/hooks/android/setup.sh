#!/usr/bin/env bash

source ./hooks/common/variables.sh

mkdir -p ./android/app/src/main/cpp/libnode
cd ./android/app/src/main/cpp/libnode

DOWNLOAD_URL="$IOS_LIBNODE"
TMP_ZIP_FILE="tmp.zip"

# Download the file
echo "Downloading $DOWNLOAD_URL"
curl -L -o $TMP_ZIP_FILE "$DOWNLOAD_URL"
Expand commentComment on line R17Resolved

unzip -o $TMP_ZIP_FILE -d ./
rm -r $TMP_ZIP_FILE ./include

echo "Download and extraction complete."
