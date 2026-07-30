# [Capacitor-NodeJS](https://github.com/mustang-im/capacitor-nodejs)

This plugin is a wrapper around Node.js Mobile that starts Node.js Mobile library but we're using a fork of the original [Capacitor-NodeJS](https://github.com/hampoelz/Capacitor-NodeJS) plugin. The current build uses the version on branch [`update-libnode`](https://github.com/mustang-im/capacitor-nodejs/tree/update-libnode). The plugin only supports Android. We have custom code in `mobile/ios` for iOS instead of this.

## Why did we choose this?

- It provides APIs to manage the Node.js Mobile shared library like how to start it with arguments.
- The Node.js Mobile shared library only provides a C++ API and the only way to communicate with it is via JNI.
- It deals with copying the files from the APK to a directory that can be accessed by the Node.js Mobile shared library.
- It provides the "bridge" which allows us to communicate with the Node.js Mobile shared library from the frontend JS code. The bridge consists of:
  - JS code that sends messages to the native code layer via Capacitor channels. Located at `bridge/`.
  - Java code that receives messages from the JS code and communicates with the Node.js Mobile shared library via JNI. Located at `android/src/main/java/net/hampoelz/capacitor/nodejs`.
- It also includes the CMake configuration to package the Node.js Mobile shared library into the APK properly, improper configurations would cause a startup crash. Located at `android/cmake/`.
- It runs copying operations and starts Node.js Mobile on a separate thread so it doesn't block the UI or main thread.

#### Why did we fork this?

- Upstream includes Node.js Mobile v18 which has reached its end-of-life. We added the feature to use any version of Node.js Mobile based on setting the `androidLibNode` property in `capacitor.config.json` by just adding the URL of the shared library or a local path. `architecture` was also added to remove the files of the unused architecture.

## How does it work?

### Android

1. When the app starts, the plugin starts a new thread to run the Node.js Mobile shared library.
2. On the new thread, the plugin copies the backend JS files to the app data public directory because the Node.js Mobile shared library cannot read the files from the APK directly.
3. Determines the JS entry point from either `index.js` being present or the `main` field in `package.json`.
4. Starts the Node.js Mobile shared library with the JS entry point.

### iOS

There's no implementation for iOS. We're using `mobile/ios/App/App/NodeRunner.swift` to start Node.js Mobile.
