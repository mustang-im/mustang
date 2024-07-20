# Called from release.sh
# Run from app/ directory
cd build/
VERSION=$1
#wget https://www.mustang.im/download/0.0.0.html

scp ben@fire3.beonex.com:/data/www/mustang/www/download/0.0.0.html 0.0.0.html
sed -i -e "s|0.0.0|$VERSION|g" 0.0.0.html
scp 0.0.0.html ben@fire3.beonex.com:/data/www/mustang/www/download/$VERSION.html
scp 0.0.0.html ben@fire3.beonex.com:/data/www/mustang/www/download/index.html
rm 0.0.0.html

scp ben@fire3.beonex.com:/data/www/beonex/parula/download/0.0.0.html 0.0.0.html
sed -i -e "s|0.0.0|$VERSION|g" 0.0.0.html
scp 0.0.0.html ben@fire3.beonex.com:/data/www/beonex/parula/download/$VERSION.html
scp 0.0.0.html ben@fire3.beonex.com:/data/www/beonex/parula/download/index.html
rm 0.0.0.html
