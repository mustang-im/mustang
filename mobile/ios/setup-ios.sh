#!/usr/bin/env bash

mkdir -p ../resources
cd ../resources

# Variables: set your repo owner and repo name here
OWNER="nodejs-mobile"
REPO="nodejs-mobile"

DOWNLOAD_URL=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/releases/latest" \
  | jq -r '.assets[] | select(.name | test("ios.*\\.zip")) | .browser_download_url')

# Check if URL was found
if [[ -z "$DOWNLOAD_URL" ]]; then
  echo "No matching asset found in latest release."
  exit 1
fi

# Download the file
echo "Downloading $DOWNLOAD_URL"
curl -L -o latest_release.zip "$DOWNLOAD_URL"

unzip -o latest_release.zip -d ./
rm -r latest_release.zip ./include

echo "Download and extraction complete."
