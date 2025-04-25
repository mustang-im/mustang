# Run from app/ directory
[ ! -e build/release.sh ] && echo "Please run from app/ directory" 1>&2 && exit 1
[ ! -z "`git status --porcelain`" ] && echo "Source tree not clean" 1>&2 && exit 1
VERSION=$1
echo Building version $VERSION
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
git commit package.json ../e2/package.json ../mobile/package.json ./logic/build.ts -m "Version $VERSION"
git tag -s "v$VERSION" -m $VERSION

NEXTVERSION=`node -e "let v = process.argv[1].split('.'); let last = parseInt(v.pop()) + 1; console.log(v.join('.') + '.' + last);" $VERSION`-dev
perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$NEXTVERSION\"|;" \
  package.json
perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$NEXTVERSION\"|;" \
  ../e2/package.json
perl -p -i \
  -e "s|appVersion: .*|appVersion: string = '$NEXTVERSION';|;" \
  ./logic/build.ts
git commit package.json ../e2/package.json ./logic/build.ts -m "Starting version $NEXTVERSION"

git push
git push --tags
# Build will be kicked off by GitHub Actions triggering on the git tag push

bash build/webpage.sh $VERSION
