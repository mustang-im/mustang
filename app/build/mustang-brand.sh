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

perl -MFile::Copy -e "copy('../../e2/build/icon.png', '../../mobile/assets/icon.png')"
