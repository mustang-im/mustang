#!/bin/bash
set -e

# Check if build native modules preference is set
PREF_FILE=$CODESIGNING_FOLDER_PATH/nodejs/NODEJS_MOBILE_BUILD_NATIVE_MODULES_VALUE.txt
if [ -z "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ] && [ -f "$PREF_FILE" ]; then
  NODEJS_MOBILE_BUILD_NATIVE_MODULES=$(cat "$PREF_FILE" | xargs)
fi

# Check for .node files or .gyp files if preference not set
if [ -z "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" ]; then
  if find "$CODESIGNING_FOLDER_PATH/public/nodejs/node_modules" -name "*.node" -type f 2>/dev/null | grep -q . || find "$CODESIGNING_FOLDER_PATH/nodejs/node_modules" -name "*.node" -type f 2>/dev/null | grep -q .; then
    NODEJS_MOBILE_BUILD_NATIVE_MODULES=1
  elif find "$CODESIGNING_FOLDER_PATH/public/nodejs/" -type f -name "*.gyp" 2>/dev/null | grep -q . || find "$CODESIGNING_FOLDER_PATH/nodejs/" -type f -name "*.gyp" 2>/dev/null | grep -q .; then
    NODEJS_MOBILE_BUILD_NATIVE_MODULES=1
  else
    NODEJS_MOBILE_BUILD_NATIVE_MODULES=0
  fi
fi

if [ "$NODEJS_MOBILE_BUILD_NATIVE_MODULES" != "1" ]; then exit 0; fi

# Determine platform-arch
PLATFORM_ARCH=""
if [ "$PLATFORM_NAME" = "iphoneos" ]; then
  PLATFORM_ARCH="ios-arm64"
elif [ "$PLATFORM_NAME" = "macosx" ]; then
  PLATFORM_ARCH="ios-arm64"
elif [ "$PLATFORM_NAME" = "iphonesimulator" ]; then
  if echo "$ARCHS" | grep -q "arm64"; then
    PLATFORM_ARCH="ios-arm64-simulator"
  else
    PLATFORM_ARCH="ios-x64"
  fi
else
  PLATFORM_ARCH="ios-x64"
fi

# Organize .node files
SCRIPT_PATH=$PROJECT_DIR/../build/organize-node-files.ts
if [ ! -f "$SCRIPT_PATH" ]; then
  SCRIPT_PATH=$SRCROOT/../build/organize-node-files.ts
fi
if [ ! -f "$SCRIPT_PATH" ]; then
  echo Warning: organize-node-files.ts not found, skipping organization
  exit 0
fi

NODEJS_DIR=$CODESIGNING_FOLDER_PATH/public/nodejs
if [ ! -d "$NODEJS_DIR" ]; then
  NODEJS_DIR=$CODESIGNING_FOLDER_PATH/nodejs
fi

node --experimental-strip-types "$SCRIPT_PATH" "$NODEJS_DIR" "$PLATFORM_ARCH" || true

