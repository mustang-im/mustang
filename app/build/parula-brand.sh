# Run from app/build/ directory
VERSION=`grep "\"version\"" ../package.json | sed -e "s|^.*\"version\": \"||" -e "s|\",$||"`
sed -i \
  -e "s|production = false|production = true|" \
  -e "s|'Mustang'|'Parula'|" \
  -e "s|'https://mustang.im'|'https://parula.beonex.com'|" \
  -e "s|appVersion: string = '.*';$|appVersion: string = '$VERSION';|" \
  ../logic/build.ts
sed -i \
  -e "s|Mustang|Parula|g" \
  -e "s|https://mustang.im|https://parula.beonex.com|g" \
  -e "s|\"name\": \"mustang\"|\"name\": \"parula\"|" \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|" \
  ../../e2/package.json
