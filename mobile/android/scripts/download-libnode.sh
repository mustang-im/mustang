# Check if libnode already exists
if [ -f "./app/main/cpp/libnode/bin/arm64-v8a/libnode.so" ]; then
    echo "libnode already exists, skipping download."
    exit 0
fi

DOWNLOAD_URL="https://github.com/mustang-im/nodejs-mobile/releases/download/v22.9.0/nodejs-mobile-v22.9.0-android.zip"
TMP_ZIP_FILE="libnode-download.zip"

# Download the file
echo "Downloading $DOWNLOAD_URL"
curl -L -o $TMP_ZIP_FILE "$DOWNLOAD_URL"

unzip -o $TMP_ZIP_FILE -d ./app/main/cpp/

echo "Download and extraction complete."
