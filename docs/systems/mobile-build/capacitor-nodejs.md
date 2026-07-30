# [Capacitor-NodeJS](https://github.com/mustang-im/capacitor-nodejs)

This plugin is a wrapper around Node.js Mobile that starts Node.js Mobile library but we're using a fork of the original [Capacitor-NodeJS](https://github.com/hampoelz/Capacitor-NodeJS) plugin. The current build uses the version on branch [`update-libnode`](https://github.com/mustang-im/capacitor-nodejs/tree/update-libnode). The plugin only supports Android. We have custom code in `mobile/ios` for iOS instead of this.

## Why did we choose this?

- It provides APIs to manage the Node.js Mobile shared library like how to start it with arguments.
- The Node.js Mobile shared library only provides a C++ API and the only way to communicate with it is via JNI.
- It deals with copying the files from the APK to a directory that can be accessed by the Node.js Mobile shared library.
- It provides the "bridge" which allows us to communicate with the Node.js Mobile shared library from the frontend JS code. The bridge consists of:
  - JS code that sends messages to the native code layer via Capacitor channels. Located at `bridge/`.
  - Java code that receives messages from the JS code and communicates with the Node.js Mobile shared library via JNI. Located at `android/src/main/java/net/hampoelz/capacitor/nodejs`.
- It also includes the CMake configuration to package the Node.js Mobile shared library into the APK properly. The configuration is at `android/CMakeLists.txt`. The order and arguments of `add_library`, `include_directories`, `set_target_properties`, `find_library` and `target_link_libraries` need to be set correctly otherwise libraries maybe missing from the final APK or build errors may occur.
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

#### Why did we implement `NodeRunner.swift` directly in our project?

- At that time, we only needed to start Node.js Mobile on iOS and implementing an entire Capacitor plugin was very complex. To implement it, you would have to understand how the Capacitor Plugin API works.
- We also needed to code sign and package the `.node` files into `.framework` files for uploading to TestFlight. We didn't have any reliable way to add a Build Phase to our Xcode project, our attempts to build a custom script resulted in duplicate steps, not adding the build step or a corrupted Xcode project file. The [`xcode` package](https://github.com/apache/cordova-node-xcode) for parsing and modifying Xcode project files used by [`nodejs-mobile-cordova`](https://github.com/nodejs-mobile/nodejs-mobile-cordova) was no longer being maintained.

#### How does `NodeRunner.swift` work?

1. When you start the app it runs `mobile/ios/App/App/AppDelegate.swift` and runs `NodeRunner.startNode()`
from `mobile/ios/App/App/NodeRunner.swift`.
2. Checks if the variable `nodeStarted` is `false` and if not, it returns early to avoid starting Node.js Mobile more than once.
3. Sets `nodeStarted` to `true` and continues to start Node.js Mobile.
4. Starts a background thread with the `.default` priority because anything that is higher priority would block the UI and stay on the Splash Screen frozen or for a longer time. Anything that was lower priority would load the backend later which caused the `JPC: not connected` error.
5. `mobile/ios/App/App/NodeRunner.swift` checks if `nodejs-project/override-dlopen-paths-preload.js` is present in the `Mustang.app`.
6. Starts Node.js Mobile with `override-dlopen-paths-preload.js` as the preload script.
7. The preload script is executed before the main backend script starts.
8. The preload script overrides the `dlopen` paths to load from paths from the `nodejs-project/override-dlopen-paths-data.json` file. `override-dlopen-paths-data.json` is generated JSON file that maps `.node` files to `.framework` files. This is because of the code signing requirements and packaging requirements to upload to TestFlight otherwise it works locally without mapping and with `.node` files directly.
9. The `.node` files are loaded from `Frameworks` directory of the `Mustang.app` as a `node-[hash].framework` directory with a `node-[hash]` executable file inside.

See `docs/systems/mobile-build/overview.md` the `Building for iOS` section for how the `.node` files are packaged on iOS.
