# Run from app/ directory
[ ! -e build/version.sh ] && echo "Please run from app/ directory" 1>&2 && exit 1
VERSION=$1
[ -z $VERSION ] && echo "Please provide the new version number" 1>&2 && exit 1

perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|;" \
  package.json
perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|;" \
  ../e2/package.json
perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$VERSION\"|;" \
  ../mobile/package.json
perl -p -i \
  -e "s|appVersion: .*|appVersion: string = '$VERSION';|;" \
  ./logic/build.ts
