# Run from app/build/ directory
VERSION=`grep "\"version\"" ../../app/package.json | sed -e "s|^.*\"version\": \"||" -e "s|\",$||"`
echo Building version $VERSION
perl -p -i \
  -e "s|production = false|production = true|;" \
  -e "s|appVersion: string = '.*';$|appVersion: string = '$VERSION';|;" \
  ../logic/build.ts
perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|;" \
  ../../desktop/package.json

# Include arm in artifact name
#  Use Runner variables <https://docs.github.com/en/actions/reference/workflows-and-actions/variables>
if [ "$RUNNER_ARCH" = "ARM64" ] || [ "$RUNNER_ARCH" = "ARM" ]; then
  perl -p -i \
    -e 'if (/appImage:/ ... /artifactName:/) { s|(\$\{name\}-\$\{version\})\.(\$\{ext\})|$1-\${arch}.$2|g }' \
    -e 's|\$\{name\}-\$\{version\}-setup\.\$\{ext\}|\$\{name\}-\$\{version\}-\${arch}-setup.\$\{ext\}|g' \
    ../../desktop/electron-builder.yml

  # Change channel name for windows only
  if [ "$RUNNER_OS" = "Windows" ]; then
    perl -p -i \
      -e "s|(channel: mustang)|\$1-windows-arm64|g" \
      ../../desktop/electron-builder.yml
  fi
fi

perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|;" \
  ../../mobile/package.json

perl -p -i \
  -e "s|versionName \".*\"|versionName \"$VERSION\"|;" \
  ../../mobile/android/app/build.gradle

MARKETING_VERSION=$(echo "$VERSION" | sed 's/-.*//')
MAJOR_MINOR=$(echo "$VERSION" | sed 's/^\([0-9]*\.[0-9]*\).*/\1/')
BUILD_VERSION="${MAJOR_MINOR}.$(date +%Y%m%d%H%M%S)"
echo Setting iOS Build Version to $BUILD_VERSION
perl -p -i \
  -e "s|MARKETING_VERSION = .*|MARKETING_VERSION = \"$MARKETING_VERSION\";|;" \
  -e "s|CURRENT_PROJECT_VERSION = .*|CURRENT_PROJECT_VERSION = $BUILD_VERSION;|;" \
  ../../mobile/ios/App/App.xcodeproj/project.pbxproj

# Mobile Icons
perl -MFile::Path -e "mkpath('../../mobile/assets')"
perl -MFile::Copy -e "copy('../../desktop/build/icon.png', '../../mobile/assets/icon.png')"
