cd "$(dirname "${BASH_SOURCE}")/../"

bash ./scripts/download-libnode.sh
bash ./scripts/update-project.sh

export MOBILE_ARCH=android-arm64

cd ../ && bash ./hooks/common/build.sh
npx cap sync android
npx @capacitor/assets generate --android
