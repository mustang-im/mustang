### Android

The app config directory and files directory should be in `/data/data/im.mustang.capa` on the Android device. Writing files outside of this directory cause problems and requires extra permissions. Files directory could be outside but we need to find the API to get the specific path.

> All apps (root or not) have a default data directory, which is /data/data/<package_name>. By default, the apps databases, settings, and all other data go here. This directory is "private" to the app – which means no other app and not even the user can access data in it (without root permissions).

[link](https://android.stackexchange.com/a/47951)


### iOS

#### Libnode
The variable for libnode is set in `hooks/common/variables.sh` and used in `hooks/ios/setup.sh` and `backend/prebuild.sh`.

#### Node Native

Node native modules should not be included in the Frameworks section of `App/Target` setting in Xcode. Node native modules need to be converted to frameworks and embedded into the app using the script `ios/build/xcode-sign-native-modules.sh` which should be run in Xcode because it needs the environment variables set in Xcode. If the frameworks are not embedded in the app, the app will not be accepted by the App Store or TestFlight. However, when you embed the frameworks the path and the file name changes so you need to override the dlopen calls at runtime to load the correct framework.

The `ios/build/xcode-sign-native-modules.sh` script does:

- Create plists required for converting the native modules to frameworks
- Create a JSON file that has the original path and the new path for each framework
- Embed the frameworks into the app
- Sign the frameworks
- Delete the frameworks from the code signing folder


#### Debugging

`console.log` are printed to the debug console in Xcode therefore you must you Xcode to see it. Even the frontend `console.log` are printed to the debug console in Xcode.

#### WASM

> On iOS, WASM is unsupported because it requires Just-in-time (JIT) interpretation, which is forbidden by Apple's App Store guidelines.

[link](https://nodejs-mobile.github.io/docs/api/differences#webassembly)

#### Changes to make it work

- Node.js downgrade to v18
- Python downgrade to python2
- ~~Capacitor CLI downgrade to v6~~
