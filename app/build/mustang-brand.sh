# Run from app/build/ directory
VERSION=`grep "\"version\"" ../../app/package.json | sed -e "s|^.*\"version\": \"||" -e "s|\",$||"`
echo Building version $VERSION
perl -p -i \
  -e "s|production = false|production = true|;" \
  -e "s|appVersion: string = '.*';$|appVersion: string = '$VERSION';|;" \
  ../logic/build.ts
perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|;" \
  ../../e2/package.json

MARKETING_VERSION=$(echo "$VERSION" | sed 's/-.*//')
MAJOR_MINOR=$(echo "$VERSION" | sed 's/^\([0-9]*\.[0-9]*\).*/\1/')
BUILD_VERSION="${MAJOR_MINOR}.$(date +%Y%m%d%H%M%S)"
echo Setting iOS Build Version to $BUILD_VERSION
perl -p -i \
  -e "s|MARKETING_VERSION = .*|MARKETING_VERSION = \"$MARKETING_VERSION\";|;" \
  -e "s|CURRENT_PROJECT_VERSION = .*|CURRENT_PROJECT_VERSION = $BUILD_VERSION;|;" \
  ../../mobile/ios/App/App.xcodeproj/project.pbxproj

# Dev build publishing
if [[ $VERSION == *"-dev" ]]; then
  perl -p -i \
  -e "s|releaseType: release|releaseType: prerelease|g;" \
  -e "s|publishAutoUpdate: true|publishAutoUpdate: false|g" \
  ../../e2/electron-builder.yml
fi

# Mobile Icons
perl -MFile::Path -e "mkpath('../../mobile/assets')"
perl -MFile::Copy -e "copy('../../e2/build/icon.png', '../../mobile/assets/icon.png')"
