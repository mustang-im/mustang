# Node.js Mobile

Node.js Mobile is the library and the app toolkit that builds the library. We have our own [fork](https://github.com/mustang-im/nodejs-mobile) and it uses different versions of Node.js for Android and iOS.
- Android: It uses our branch [`update-22-9-0`](https://github.com/mustang-im/nodejs-mobile/tree/update-22-9-0) which is based on PR [#151](https://github.com/mustang-im/nodejs-mobile/pull/151) from upstream Node.js Mobile.
- iOS: It uses our branch [`update24-5-0`](https://github.com/mustang-im/nodejs-mobile/tree/update24-5-0) which is based on PR [#134](https://github.com/mustang-im/nodejs-mobile/pull/134) from upstream Node.js Mobile.

## How does it work?

### Applying changes from the upstream [Node.js](https://github.com/nodejs/node) repository

To update the version of node.js used in this project, carefully follow these steps:

1. Suppose the current version in nodejs-mobile is `A.b.c` and the newer version in nodejs/node is `X.y.z`
2. Locally clone the Node.js repository
3. `cd` into the Node.js repository
4. Create a single commit that squashes all changes from git tag `vA.b.c` to `vX.y.z`
    4.1. `git checkout vX.y.z` to go to the newer version
    4.2. Delete the branch `nodejs-mobile-update` if it exists
    4.3. `git checkout -b nodejs-mobile-update` to create a branch at the newer version
    4.4. `git reset --soft vA.b.c` to reset the branch all the way to the older version
    4.5. `git commit -m "Update node.js to vX.y.z"` to create a single commit with all changes
5. `git format-patch -1 HEAD -o ../` which will create a patch file in the parent directory
6. `cd` into the nodejs-mobile repository
7. Apply the patch file with `git am --3way --ignore-space-change ../0001-Node.js-vA.b.c.patch` (sometimes it may be useful to use the flag `--reject`)
8. Manually resolve git conflicts that may arise

Steps maybe updated based on upstream steps [here](https://github.com/nodejs-mobile/nodejs-mobile/blob/main/doc_mobile/CONTRIBUTING.md#updating-nodejs-mobile-from-upstream-nodejsnode)

### Building for Android

1. Run `./tools/android_build.sh [path to Android NDK] [Android SDK two digit number] [optional architecture, if not it will build for all supported architectures]` to start the build. Supported architectures are `arm`, `arm64`, `x86`, and `x86_64`.
2. When the build starts, it runs `./android-configure.py`
3. Applies the patches from `./android-patches`
4. Determines the correct toolchain to use based on the architecture.
5. Set Node GYP environment variables.
6. Runs `./configure`. Make changes here for configuring features needed for the build. E.g. Including the Intl module.
7. Runs `make` in the root directory to build the Node.js Mobile shared library. Make uses the Android NDK toolchain to compile the shared library.
8. Runs `./tools/copy_libnode_headers.sh` to copy the headers and package it with the shared library.

### Building for iOS

1. Run `./tools/ios_framework_prepare.sh` to start the build.
2. When the build starts, it sets Node GYP environment variables.
3. Runs `./configure`. Make changes here for configuring features needed for the build. E.g. Including the Intl module.
4. Runs `make` in the root directory to build the Node.js Mobile library. Make uses the Xcode to compile the library.
5. After the library is built it wraps the library into a `.framework` bundle.
