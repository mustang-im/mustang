# Run from /mobile
echo Setting UI to mobile
perl -p -i \
  -e "s|isMobile = false;$|isMobile = true;|;" \
  ../app/logic/build.ts
