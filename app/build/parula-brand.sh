# Run from app/build/ directory
VERSION=`grep "\"version\"" ../package.json | sed -e "s|^.*\"version\": \"||" -e "s|\",$||"`
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
  -e "s|Mustang GmbH|Beonex GmbH|g;" \
  -e "s|Mustang|Parula|g;" \
  -e "s|mustang|parula|g;" \
  ../../e2/electron-builder.yml
