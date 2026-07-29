# Overview

The mobile build system provides the frontend and backend runtimes, rebuilds the node native modules, provides native APIs and packages the app for mobile distribution.

## Components

The mobile build system consists of the following components:
- Capacitor.js: a cross-platform mobile runtime that provides native APIs for the app.
- [Capacitor-NodeJS](https://github.com/hampoelz/Capacitor-NodeJS): a capacitor plugin that provides a wrapper around Node.js Mobile for use with Capacitor.js.
- [Node.js Mobile](https://github.com/nodejs-mobile/nodejs-mobile): the toolkit for building Node.js binaries for mobile use.
- [prebuild-for-nodejs-mobile](https://github.com/nodejs-mobile/prebuild-for-nodejs-mobile): a tool for rebuilding Node.js Native Modules for mobile use.

## How does it work?

1. Build the Node.js Mobile library using the Node.js Mobile toolkit.
2. The library is then placed in the Capacitor-NodeJS plugin and prebuild-for-nodejs-mobile.
3. Build the HTML, CSS, JS with Vite as you would for the desktop app.
4. Rebuild the Node.js Native Modules for mobile use using prebuild-for-nodejs-mobile. The commands in this project go directly into the `node_modules/[package_name]` directory.
5. Capacitor packages the app for mobile distribution.
6. When you start the app, Capacitor provides the frontend runtime and starts the Node.js Mobile runtime.

### Building for Android

1. Find compatible version of Android SDK and NDK.
2. Build the Node.js Mobile library for Android using the Node.js Mobile toolkit and compatible versions of the SDK and NDK.
3. Package the library into the Capacitor-NodeJS plugin and prebuild-for-nodejs-mobile.
4. Build the HTML, CSS, JS with Vite as you would for the desktop app.
5. Rebuild the Node.js Native Modules for mobile use using prebuild-for-nodejs-mobile.
6. Copy the `.node` files to `mobile/android/app/src/main/assets/public/nodejs/node_modules/[package_name]`.

### Starting the Android App

1. Capacitor starts the Webview and loads the files specified in the `webDir` property of the `capacitor.config.json` file.
2. Capacitor starts loading the Capacitor plugins.
3. After plugins are loaded, the Capacitor-NodeJS plugin copies the `backend` files to a directory outside of the APK.
4. Capacitor-NodeJS plugin starts the Node.js Mobile from the new location.

### Building for iOS

1. Find compatible version of Xcode.
2. Build the Node.js Mobile library for iOS using the Node.js Mobile toolkit and compatible versions of Xcode.
3. Package the library into the Capacitor-NodeJS plugin and prebuild-for-nodejs-mobile.
4. Build the HTML, CSS, JS with Vite as you would for the desktop app.
5. Rebuild the Node.js Native Modules for mobile use using prebuild-for-nodejs-mobile.
6. Copy the `.node` files to `mobile/ios/app/src/main/assets/public/nodejs/node_modules/[package_name]`.
7. Install an Apple certificate and mobile provisioning profile.
8. `yarn cap sync ios` to copy the HTML, CSS, JS assets to the iOS app and install the Capacitor plugin CocoaPods.
9. Start the iOS app build process using Xcode in the CLI.
10. Builds the iOS and the CocoaPods dependencies.
11. Runs `mobile/ios/build/xcode-embed-node-native.sh` to embed the Node.js Native Modules into the iOS app.
12. Locates the nodejs project directory and finds the `.node` files.
13. Generates new `node-[hash].framework` file names from the `[package_name].node` file names and target file target path.
14. Fills in the `Info.plist` from the `mobile/ios/build/plisttemplate.xml` template.
15. Generates a file path mapping JSON file because the path before build is in the `node_modules` directory and as a `.node` file. However, iOS requires a `.framework` file and the `.node` is wrapped in a `.framework` file. Furthermore, Node.js Mobile expects a `.node` file and `.framework` files are placed in the `Frameworks` directory instead of `public/` directory of the iOS app bundle.

### Starting the iOS App

1. Capacitor starts the Webview and loads the files specified in the `webDir` property of the `capacitor.config.json` file.
2. `mobile/ios/App/App/NodeRunner.swift` runs and checks if Node.js Mobile is loaded yet.
3. Capacitor starts loading the Capacitor plugins. This is placed in this order because of the timing.
4. `mobile/ios/App/App/NodeRunner.swift` checks if `override-dlopen-paths-preload.js` is present.
5. Starts Node.js Mobile with `override-dlopen-paths-preload.js` as the preload script.
6. The preload script is executed before the main backend script starts.
7. The preload script overrides the `dlopen` paths to load from paths from the `override-dlopen-paths-data.json` file. `override-dlopen-paths-data.json` is generated JSON file that maps `.node` files to `.framework` files. This is because of the code signing requirements and packaging requirements to upload to TestFlight otherwise it works locally without mapping and with `.node` files directly.

## Dependencies

### [Node.js Mobile](https://github.com/nodejs-mobile/nodejs-mobile)
The toolkit for building Node.js libraries for mobile use.

### [Capacitor-NodeJS](https://github.com/hampoelz/Capacitor-NodeJS)
A capacitor plugin that provides a wrapper around Node.js Mobile for use with Capacitor.js.

### [prebuild-for-nodejs-mobile](https://github.com/nodejs-mobile/prebuild-for-nodejs-mobile)
A tool for rebuilding Node.js Native Modules for mobile use.

### Android SDK, NDK and CMake

The Android SDK, NDK and CMake are required for building the Node.js Mobile library and the Node Native modules for Android. Android Studio makes it easier to debug.

### Xcode
The Xcode is required for building the Node.js Mobile library and the Node Native modules for iOS.

### CocoaPods

CocoaPods is used for managing the native dependencies of the Capacitor plugins.

## Debugging

### Installing SDK for Android

1. Go to `Settings`
2. Go to `Languages & Frameworks`
3. Check the `Show Package` checkbox for more precise versions.
3. Go to `SDK Platforms` for Android SDKs.
4. Go to `SDK Tools` and scroll down for Android NDKs and CMake.

### Debugging Android startup crashes

#### Node.js Mobile binary incompatible with Android SDK and NDK

1. Go to the Node.js Mobile repository and find the version you are using.
2. Check which version of the Android SDK and NDK it was build with.
3. Make sure you are using the same version of the Android SDK and NDK as the one it was built with.

#### Node Native Modules built with an incompatible Node.js Mobile version or Android SDK

1. Follow the step about to check the Android SDK and NDK for the Node.js Mobile version.
2. When you do `yarn prebuild-for-nodejs-mobile android-arm64 --sdk28`, make sure the SDK version matches the Node.js Mobile version.
3. Verify the SDK version is supported by Capacitor also.

### Debug for Android

1. Go to `app/build`.
2. Run `./mustang-brand.sh`. Because there's no assets for `@capacitor/assets` in `mobile/` not even default assets for it to generate icons and splash screens and it will throw an error preventing the app from building. `@capacitor/assets` generates icons and splash screens from `mobile/assets`.
3. Go to `mobile/`.
4. Run `export MOBILE_ARCH=android-arm64`.
5. Run `yarn build`. Check the log and verify that the Node Native Modules were built and copied to `mobile/dist/`.
6. Run `yarn cap sync android`. Installs the Capacitor Plugin native dependencies and copies the `mobile/dist` to the Android project. `mobile/dist` includes the frontend, backend and Node Native Modules.
7. Run `yarn cap open android` to open the Android project in Android Studio.
8. Click the Elephant Icon or `Sync project with Gradle files` button on the top right.
9. On the bottom left, click the Hammer Icon or `Build` button to see the build/sync log. You will see the progress of the project installing native dependencies.
10. After the build/sync is complete, there should be a dropdown on the top bar with the available simulator devices and a Play button.
11. Click the Play button to run the app on the selected simulator.
12. On the bottom left, click the cat icon or logcat button to see the app log.
13. Download the `.apk` file from CI.
14. Start Android Studio.
15. Go to Build -> Analyze APK.
16. Check if there's `/lib/[arch]/libnode.so` in the APK.
17. Check that in `/assets/public/` all frontend, backend and Node Native module files are present.
18. On the Alignment column, check that there no files with alignment errors.

### Debugging iOS startup crashes

#### Incompatible Node.js Mobile or iOS SDK version

1. Go to `mobile/hooks/ios/variables.sh`
2. Go to the link specified for the `IOS_LIBNODE` variable and check which iOS SDK version it was built with.

#### .node files left over in Xcode causes crash at startup

1. Go to `mobile/`
2. Do `yarn cap open ios` to open the Xcode project for the app.
3. On the left sidebar, click `App` which is the project.
4. On the right, go to the `General` tab.
5. Inside the right side, go to TARGETS -> App.
6. Scroll down to `Frameworks, Libraries, and Embedded Content`.
7. Select and remove any `.node` files. Click [-] to remove the selected files.

Why does it crash? Because when it appears there Xcode lists it in the files to be loaded when the app starts. And when the app starts, it will either not find the file or it will crash trying to load it because `.node` files are not supported on iOS.

#### Framework not built or signed properly

1. Go to `mobile/`
2. Do `yarn cap open ios` to open the Xcode project for the app.
3. On the left sidebar, select the last icon tab. It should be a paper with list items. This is the build log.
4. Select `Local`.
5. On the center, there's a long pill-shaped bar and inside it says `App -> Any iOS Device(arm64)`, click that and select `My Mac (Designed for iPad)` for faster builds or any iOS device under `iOS Simulators` for similar testing as a real device.
6. On the left side, expand `App`
7. Click the play button to build and run the app.
8. There should be a new log `Run`, expand that.
9. Select `Build`.
10. On the right side, on the top select the filters `All` and `All messages` for seeing the full log output.
11. Scroll to and find the step `Run custom shell script 'Embed Node.js Mobile Native Modules'`.
12. Check the log output for `Found [n] valid frameworks and 0 invalid frameworks after rebuilding the native modules for iOS.`. This step doesn't throw any error if there were no native modules to embed so you should check this step.
13. Check the `Installers for iOS` workflow and go to the `Upload app to TestFlight` step. Verify that all components are uploaded successfully.
14. Download the `.ipa` file from the workflow run.
15. Rename the `.ipa` file to `.zip`.
16. Extract the `.zip` file.
17. Go to `Payload/`.
18. Right-click and select `Show Package Contents`.
19. Go to the `Frameworks/` directory.
20. Find that there are the same number of `node**.framework` files as there are for Node Native Modules.
21. Verify that under `public/`, all frontend files are present.
22. Verify that under `nodejs-project/`, all backend files are present.
23. Verify that `override-dlopen-paths-preload.js` and `override-dlopen-paths-data.json` are present. Verify that `override-dlopen-paths-data.json` is correctly mapped.

Each of the `.node` files must be individually code signed and wrapped into a `.framework` bundle otherwise TestFlight will reject the build even if it works locally.

### Debug build for iOS

1. Go to `mobile/` and run `yarn install`.
2. Run `yarn setup:ios` to download the Node.js Mobile binaries into the Xcode project.
3. Go to `mobile/backend` and run `yarn install` to install the backend dependencies.
4. Go to `mobile/` and run `export MOBILE_ARCH=ios-arm64` for running the app directly on Mac without a simulator or `export MOBILE_ARCH=ios-arm64-simulator` for running the app on a simulator and `yarn build` to build the app.
5. Run `yarn cap sync ios` to copy the HTML, CSS, JS and `.node` files to the Xcode project.
6. Run `yarn cap open ios` to open the Xcode project.
7. On the left side, select the Folder Icon to see the project files.
8. Select the `App`.
9. Inside the right side, on the left navigation column, select TARGETS -> `App`. If there's no column, click the square icon with a vertical rectangle inside to open the navigation column. The icon is located on the top left of the right side.
10. Go to the `Signing & Capabilities` tab.
11. Select the `All` tab under `Signing & Capabilities`.
12. Go to Signing (Debug) and Signing (Release).
13. Check the `Automatically manage signing` checkbox for both Debug and Release.
14. Select your own account as `Team`.
15. Input any bundle identifier that's not already in use.
16. On the center, there's a long pill-shaped bar and inside it says `App -> Any iOS Device(arm64)`, click that and select `My Mac (Designed for iPad)` for faster builds or any iOS device under `iOS Simulators` for similar testing as a real device.
17. On the left side click the play button to build and run the app.
18. If there's an error, the right side will show the error message.
19. If it is an error with the `.node` files, the error message will be `dyld__abort_with_payload` and there will be a memory address in the error message. At the bottom right there will be log output. `Library not loaded` will be the message there. That means the `.node` file was still left over in the Xcode project.
20. If it successfully builds, you'll see the app or simulator window open. On the bottom right, there will be a log output window.
21. On the left sidebar, select the last icon tab. It should be a paper with list items. This is the build log.
22. Select `Local`.
23. Expand the latest `Run`.
24. Select `Build` for the build log or `Console` for the running app log output.
25. On the right side, on the top select the filters `All` and `All messages` for full log output.

#### App not uploaded to TestFlight

1. Go to the `Installers for iOS` workflow
2. Find the latest run, normally an successful upload doesn't display as a failed run on GitHub Actions.
3. Expand the `Upload to TestFlight` step to see if there are any error messages.
4. Check if the `CURRENT_PROJECT_VERSION` is doesn't conflict with any existing versions in TestFlight.
5. Check if there's any error messages in the `Upload to TestFlight` step.
6. Check if there's any messages sent via email regarding the upload. Or check the App Store Connect website for any errors.

## Future improvements

### Fetch Node.js Mobile binaries from package registry instead of using `curl`

For security reasons, it is recommended to fetch Node.js Mobile binaries from the package registry instead of using `curl`. This needs to done for `capacitor-nodejs`, `prebuild-for-nodejs-mobile`, and in our `mobile/hooks/ios/setup.sh`.
