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
  ../package.json
perl -p -i \
  -e "s|Mustang GmbH|Beonex GmbH|g;" \
  -e "s|Mustang|Parula|g;" \
  -e "s|mustang-mail|parula|g;" \
  -e "s|mustang|parula|g;" \
  ../../e2/electron-builder.yml
perl -MFile::Copy -e "copy('../frontend/asset/icon/general/logo-parula.svg', '../frontend/asset/icon/general/logo.svg')"
perl -MFile::Copy -e "copy('../../e2/build/icon-parula.png', '../../e2/build/icon.png')"
