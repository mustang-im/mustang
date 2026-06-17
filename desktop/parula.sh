if git status --porcelain | grep -q '^M'; then
  echo "Source tree has modifications. Commit them first."
  exit 1
fi
if [ ! -d "./dist" ]; then
  echo "Must be in desktop/ dir"
  exit 1
fi
(cd ../app/build/; sh parula-brand.sh)
yarn build:linux
git delete-cur
rm -rf ../../mobile/dfhgdhgd
