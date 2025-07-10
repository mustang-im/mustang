### Android

The app config directory and files directory should be in `/data/data/im.mustang.capa` on the Android device. Writing files outside of this directory cause problems and requires extra permissions. Files directory could be outside but we need to find the API to get the specific path.

> All apps (root or not) have a default data directory, which is /data/data/<package_name>. By default, the apps databases, settings, and all other data go here. This directory is "private" to the app – which means no other app and not even the user can access data in it (without root permissions).

[link](https://android.stackexchange.com/a/47951)


### iOS

#### Node Native
Node native modules should not be included in the Frameworks section of `App/Target` setting in Xcode.

#### Debugging

`console.log` are printed to the debug console in Xcode therefore you must you Xcode to see it. Even the frontend `console.log` are printed to the debug console in Xcode.

#### Changes to make it work

- Node.js downgrade to v18
- Python downgrade to python2
- ~~Capacitor CLI downgrade to v6~~
