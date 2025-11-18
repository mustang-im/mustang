# Run from app/build/ directory
VERSION=`grep "\"version\"" ../../app/package.json | sed -e "s|^.*\"version\": \"||" -e "s|\",$||"`
echo Building version $VERSION
perl -p -i \
  -e "s|production = false|production = true|;" \
  -e "s|'Mustang'|'Parula'|;" \
  -e "s|'https://mustang.im'|'https://parula.beonex.com'|;" \
  -e "s|appVersion: string = '.*';$|appVersion: string = '$VERSION';|;" \
  ../logic/build.ts
perl -p -i \
  -e "s|Mustang|Parula|g;" \
  -e "s|https://mustang.im|https://parula.beonex.com|g;" \
  -e "s|\"name\": \"mustang\"|\"name\": \"parula\"|;" \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|;" \
  ../../e2/package.json
perl -p -i \
  -e "s|Mustang|Parula|g;" \
  -e "s|https://mustang.im|https://parula.beonex.com|g;" \
  -e "s|\"name\": \"mustang\"|\"name\": \"parula\"|;" \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|;" \
  ../../mobile/package.json
perl -p -i \
  -e "s|Mustang|Parula|g;" \
  -e "s|https://mustang.im|https://parula.beonex.com|g;" \
  -e "s|\"name\": \"mustang\"|\"name\": \"parula\"|;" \
  ../package.json
perl -p -i \
  -e "s|Mustang GmbH|Beonex GmbH|g;" \
  -e "s|Mustang|Parula|g;" \
  -e "s|mustang-mail|parula|g;" \
  -e "s|mustang|parula|g;" \
  ../../e2/electron-builder.yml

perl -p -i \
  -e "s|im.mustang.capa|com.beonex.parula|;" \
  -e "s|"Mustang"|"Parula"|;" \
  ../../mobile/capacitor.config.ts

perl -p -i \
  -e "s|im.mustang.capa|com.beonex.parula|;" \
  ../../mobile/backend/backend.ts

MAJOR_MINOR=$(echo "$VERSION" | sed 's/^\([0-9]*\.[0-9]*\).*/\1/')
BUILD_VERSION="${MAJOR_MINOR}.$(date +%s)"
echo Setting iOS Build Version to $BUILD_VERSION
perl -p -i \
  -e "s|Mustang|Parula|;" \
  -e "s|im.mustang.mail|app.parula.mail|;" \
  -e "s|MARKETING_VERSION = .*|MARKETING_VERSION = \"$VERSION\";|;" \
  -e "s|CURRENT_PROJECT_VERSION = .*|CURRENT_PROJECT_VERSION = $BUILD_VERSION;|;" \
  ../../mobile/ios/App/App.xcodeproj/project.pbxproj

perl -p -i \
  -e "s|Mustang|Parula|;" \
  ../../mobile/ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme

perl -p -i \
  -e "s|Mustang|Parula|;" \
  -e "s|im.mustang.mail|app.parula.mail|;" \
  ../../mobile/ios/archive.plist

perl -MFile::Copy -e "copy('../frontend/asset/icon/general/logo-parula.svg', '../frontend/asset/icon/general/logo.svg')"
perl -MFile::Copy -e "copy('../../e2/build/icon-parula.png', '../../e2/build/icon.png')"

# Mobile Icons
perl -MFile::Path -e "mkpath('../../mobile/assets')"
perl -MFile::Copy -e "copy('../../e2/build/icon-parula.png', '../../mobile/assets/icon.png')"

perl -MFile::Copy -e "copy('../../mobile/parula/ios/apple-dist.mobileprovision', '../../mobile/ios/apple-dist.mobileprovision')"
