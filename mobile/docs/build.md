
## Android

### Building with Android Studio

1. `cd app; yarn install`
2. `cd lib; yarn install`
3. `cd backend; yarn install`
4. `cd mobile; yarn install`
5. `cd mobile/backend; yarn install`
6. `cd lib; yarn add bufferutil` explicitly include bufferutil otherwise it might not be included
7. `mkdir ~/.gyp && echo "{'variables':{'android_ndk_path':''}}" > ~/.gyp/include.gypi`
8. `export NODE_OPTIONS="--max-old-space-size=32768"`
9. `export MOBILE_ARCH=android-arm64`
10. `cd mobile; yarn build`
11. `npx cap open android` in `/mobile`
12. Wait for the project to be fully loaded and Gradle Sync to finish running
13. Go to `Build > Generate Signed App Bundle or APK` and follow the steps
