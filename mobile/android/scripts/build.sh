cd "$(dirname "${BASH_SOURCE}")/../"

bash ./scripts/download-libnode.sh
node ./scripts/update-project.js

export MOBILE_ARCH=android-arm64

cd ../ && bash ./hooks/common/build.sh
npx cap sync android
npx @capacitor/assets generate --android
