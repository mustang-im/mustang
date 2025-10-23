#!/usr/bin/env bash
NODEJS_PROJECT_DIR="$( cd "$CODESIGNING_FOLDER_PATH" && cd nodejs-project && pwd )"

node ../build/ios-create-plists-and-dlopen-override.js "$NODEJS_PROJECT_DIR"

# Embed every resulting .framework in the application and delete them afterwards.
embed_framework()
{
    FRAMEWORK_NAME="$(basename "$1")"
    mkdir -p "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH/"
    cp -r "$1" "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH/"
    /usr/bin/codesign --force --sign $EXPANDED_CODE_SIGN_IDENTITY --preserve-metadata=identifier,entitlements,flags --timestamp=none "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH/$FRAMEWORK_NAME"
}
find "$CODESIGNING_FOLDER_PATH/nodejs-project/" -name "*.framework" -type d | while read frmwrk_path; do embed_framework "$frmwrk_path"; done

#Delete frameworks from their build paths
find "$CODESIGNING_FOLDER_PATH/nodejs-project/" -path "*/*.framework/*" -delete
find "$CODESIGNING_FOLDER_PATH/nodejs-project/" -name "*.framework" -type d -delete
