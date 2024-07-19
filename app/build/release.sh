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
git commit package.json ../e2/package.json -m "Version $VERSION"
git tag -s "v$VERSION" -m $VERSION

NEXTVERSION=$VERSION.1a1
perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$NEXTVERSION\"|;" \
  package.json
perl -p -i \
  -e "s|\"version\": \".*\"|\"version\": \"$NEXTVERSION\"|;" \
  ../e2/package.json
git commit package.json ../e2/package.json -m "Starting version $NEXTVERSION"

git push
git push --tags
# Build will be kicked off by GitHub Actions triggering on the git tag push
