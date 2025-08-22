
## Android

### Building with Android Studio

1. `cd app; yarn install`
2. `cd lib; yarn install`
3. `cd backend; yarn install`
4. `cd mobile; yarn install`
5. `cd mobile/backend; yarn install`
6. `export MOBILE_ARCH=android-arm64`
7. `cd mobile; yarn build`
8. `cd mobile; npx cap sync android`
9. `npx cap open android` in `/mobile`
10. Wait for the project to be fully loaded and Gradle Sync to finish running
11. Go to `Build > Generate Signed App Bundle or APK` and follow the steps

### Building with CI

1. Open Android Studio
2. Follow this guide and record the values: https://developer.android.com/studio/publish/app-signing#generate-key
3. Locate the `.jks` file
4. Do `base64 -i <file> -o _` and get the value
5. Go to the repository
6. Go to the setting tab
7. Go Secrets and variables > Actions
8. Go to Repository secrets
9. Click New repository secret
10. Create a secret with the value from step 4. and the name `KEYSTORE`
11. Create a secret with `KEYSTORE_PASS` with the keystore password
12. Create a secret with `KEYSTORE_ALIAS` with the keystore alias
13. Create a secret with `KEYSTORE_ALIAS_PASS` with the keystore alias password
14. Start the workflow by mannually triggering it or pushing with a tag
15. The `tag_name` is retrieved from `mobile/package.json`. This was done because the release step
fails when there's no tag for the commit which fails when you manually trigger it.

### Building with command line

1. Install Android NDK v28+ and set `ANDROID_NDK_HOME` env e.g. `/usr/local/lib/android/sdk/ndk/28.2.13676358`
2. `cd app; yarn install`
3. `cd lib; yarn install`
4. `cd backend; yarn install`
5. `cd mobile; yarn install`
6. `cd mobile/backend; yarn install`
7. `export MOBILE_ARCH=android-arm64`
8. `cd mobile; yarn build`
9. Set the envs `KEYSTORE_PATH`, `KEYSTORE_PASS`, `KEYSTORE_ALIAS`, `KEYSTORE_ALIAS_PASS`
10. `cd mobile; yarn build:android`
