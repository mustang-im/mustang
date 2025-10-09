
## Android

### Building with Android Studio

1. `cd app; yarn install`
2. `cd lib; yarn install`
3. `cd backend; yarn install`
4. `cd mobile; yarn install`
5. `cd mobile/backend; yarn install`
6. `cd mobile; yarn build`
7. `cd mobile; npx cap sync android`
8. `npx cap open android` in `/mobile`
9. Wait for the project to be fully loaded and Gradle Sync to finish running
10. Go to `Build > Generate Signed App Bundle or APK` and follow the steps

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
7. `cd mobile; yarn build`
8. Set the envs `KEYSTORE_PATH`, `KEYSTORE_PASS`, `KEYSTORE_ALIAS`, `KEYSTORE_ALIAS_PASS`
9. `cd mobile; yarn build:android`

### iOS

### Building with CI
1. Setup a create a Code Signing Certificate https://developer.apple.com/documentation/Xcode/sharing-your-teams-signing-certificates#Create-a-new-code-signing-identity
2. Export the Code Signing Certificate as a `.p12` file https://developer.apple.com/documentation/Xcode/sharing-your-teams-signing-certificates#Export-your-signing-identity-to-share-with-a-team-member
3. Create an App Store Connect provisioning profile https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile
4. Download the provisioning profile https://help.apple.com/xcode/mac/current/#/deva899b4fe5
5. Go to the repository
6. Go to the setting tab
7. Go Secrets and variables > Actions
8. Go to Repository secrets
9. Click New repository secret
10. Do `base64 -i <file.p12> -o _` and get the value
11. Create a secret with the value from step 10 and the name `IOS_CERTIFICATE`
12. Create a secret with `IOS_OWNER_NAME` with the name of the certificate you created in step 1
13. Create a secret with `IOS_CERTIFICATE_PASSWORD` with the password you used when exporting the certificate
14. Do `base64 -i <file.mobileprovision> -o _` and get the value
15. Create a secret with the value from step 14 and the name `IOS_PROVISION_PROFILE`
16. Create a secret with `IOS_PROVISION_PROFILE_NAME` with the name of the provisioning profile you created in step 3
17. Create a secret with `IOS_PROVISION_PROFILE_PASSWORD` with a random password
18. Start the workflow by mannually triggering it or pushing with a tag
19. The `tag_name` is retrieved from `mobile/package.json`. This was done because the release step
fails when there's no tag for the commit which fails when you manually trigger it.
20. The build artifacts will be available in the workflow run summary.
