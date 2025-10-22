$(which node) ../build/ios-create-plists-and-dlopen-override.js ../App/App/nodejs-project

# Embed every resulting .framework in the application and delete them afterwards.
embed_framework()
{
    FRAMEWORK_NAME="$(basename "$1")"
    mkdir -p "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH/"
    cp -r "$1" "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH/"
    /usr/bin/codesign --force --sign $EXPANDED_CODE_SIGN_IDENTITY --preserve-metadata=identifier,entitlements,flags --timestamp=none "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH/$FRAMEWORK_NAME"
}
find "$CODESIGNING_FOLDER_PATH/nodejs-project/" -name "*.framework" -type d | while read frmwrk_path; do embed_framework "$frmwrk_path"; done
