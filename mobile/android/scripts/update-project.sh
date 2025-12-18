#!/bin/bash

# 1. Setup Paths and Variables
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE}")/../../" && pwd)"

# Extract values from local config files
VERSION=$(jq -r '.version' "$ROOT_DIR/package.json")
APP_ID=$(grep "appId:" "$ROOT_DIR/capacitor.config.ts" | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")
APP_NAME=$(grep "appName:" "$ROOT_DIR/capacitor.config.ts" | sed -E "s/.*['\"]([^'\"]+)['\"].*/\1/")

# Convert dot notation (com.app.id) to JNI path (com/app/id) for C++
JNI_PATH=$(echo "$APP_ID" | tr '.' '/')

ANDROID_DIR="$ROOT_DIR/android/app"
MAIN_DIR="$ANDROID_DIR/src/main"
JAVA_SRC_DIR="$MAIN_DIR/java"
CPP_SRC_DIR="$MAIN_DIR/cpp"

echo "Updating Android project for $APP_ID..."

# 2. Update build.gradle (In-place)
update_build_gradle() {
    local gradle_file="$ANDROID_DIR/build.gradle"
    if [ -f "$gradle_file" ]; then
        sed -i "s/applicationId \"[^\"]*\"/applicationId \"$APP_ID\"/g" "$gradle_file"
        sed -i "s/versionName \"[^\"]*\"/versionName \"$VERSION\"/g" "$gradle_file"
        sed -i "s/namespace \"[^\"]*\"/namespace \"$APP_ID\"/g" "$gradle_file"
        sed -i "s/def appName = \"[^\"]*\"/def appName = \"$APP_NAME\"/g" "$gradle_file"
        echo "✓ Updated build.gradle"
    fi
}

# 3. Update all Kotlin files in src/main/java
update_kotlin_files() {
    if [ -d "$JAVA_SRC_DIR" ]; then
        # Recursively update package declarations in .kt files
        find "$JAVA_SRC_DIR" -name "*.kt" -type f -exec sed -i "s/^package [^;]*/package $APP_ID/" {} +
        echo "✓ Updated package declarations in .kt files"
    fi
}

# 4. Update C++ files (Updating JNI FindClass paths)
update_cpp_files() {
    if [ -d "$CPP_SRC_DIR" ]; then
        # Replaces paths inside FindClass("old/path/Class") with the new JNI_PATH
        # The regex looks for patterns like "something/something/something/ClassName"
        # It updates the path prefix while preserving the specific ClassName
        find "$CPP_SRC_DIR" -type f \( -name "*.cpp" -o -name "*.h" \) -exec \
            sed -i -E "s|([a-zA-Z0-9_]+/)+([a-zA-Z0-9_]+)|$JNI_PATH/\2|g" {} +

        echo "✓ Updated JNI paths in C++ files to $JNI_PATH"
    fi
}

# 5. Update strings.xml
update_strings_xml() {
    local target_strings="$MAIN_DIR/res/values/strings.xml"
    if [ -f "$target_strings" ]; then
        sed -i "s/name=\"app_name\">[^<]*/name=\"app_name\">$APP_NAME/g" "$target_strings"
        sed -i "s/name=\"title_activity_main\">[^<]*/name=\"title_activity_main\">$APP_NAME/g" "$target_strings"
        sed -i "s/com.getcapacitor.myapp/$APP_ID/g" "$target_strings"
        echo "✓ Updated strings.xml"
    fi
}

# Execute
update_build_gradle
update_kotlin_files
update_cpp_files
update_strings_xml

echo "Project successfully updated to version $VERSION."
