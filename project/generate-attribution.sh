yarn global add @metamask/oss-attribution-generator
echo modify e2/package.json to contain all packages from backend/package.json
cd ../e2/
~/.yarn/bin/generate-attribution
cd ../app/
~/.yarn/bin/generate-attribution
cat ../e2/oss-attribution/attribution.txt >> oss-attribution/attribution.txt
gzip oss-attribution/attribution.txt
mv oss-attribution/attribution.txt.gz public/attribution.txt.gz
