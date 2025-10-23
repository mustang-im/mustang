#!/usr/bin/env bash

if [ -f "./android/app/libnode/bin/arm64-v8a/libnode.so" ]; then
  echo "Libnode already exists, skipping download."
  exit 0
fi

source ./hooks/common/variables.sh

mkdir -p ./android/app/libnode
cd ./android/app/libnode

DOWNLOAD_URL="$ANDROID_LIBNODE"
TMP_ZIP_FILE="tmp.zip"

# Download the file
echo "Downloading $DOWNLOAD_URL"
curl -L -o $TMP_ZIP_FILE "$DOWNLOAD_URL"

unzip -o $TMP_ZIP_FILE -d ./

echo "Download and extraction complete."
