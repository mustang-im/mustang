### Environment

1. Node.js v18, `node-gyp` will have issues with anything above


### Android

1. Install [Android NDK](https://developer.android.com/ndk/index.html)
2. Set `$ export ANDROID_NDK_HOME=/Users/username/Library/Android/sdk/ndk-bundle`
3. Make sure have python2 installed with the paths set, [pyenv](https://github.com/pyenv/pyenv) can help with that
4. Set `$ export MOBILE_ARCH=[architecture]`, archicture can be `android-arm`, `android-arm64`, `android-x64`
5. Run `yarn build`

### iOS

1. Run `yarn setup:ios`
4. Set `$ export MOBILE_ARCH=[architecture]`, archicture can be `ios-arm64-simulator`, `ios-arm64`, `ios-x64`
5. Run `yarn build`
