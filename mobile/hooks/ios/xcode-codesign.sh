# !/usr/bin/env bash
# This script is used to codesign all .node files in the built app bundle.
# It should be used by the "Code Sign Node Native Modules" build phase in Xcode.
find "${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}" -name '*.node' -exec codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" {} \;
