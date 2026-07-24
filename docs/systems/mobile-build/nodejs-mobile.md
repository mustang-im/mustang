# Node.js Mobile

Node.js Mobile is the binary and the app toolkit that builds the toolkit. We are using a fork at the moment because upstream is not updated with Node.js v22+ yet.

## How does it work?

### Android

1. Update the repository with the changes of the specific version from upsteam. See the [link](https://github.com/nodejs-mobile/nodejs-mobile/blob/main/doc_mobile/CONTRIBUTING.md#updating-nodejs-mobile-from-upstream-nodejsnode) for more details.
2. When you start the build, it runs `./android-configure.py`
3. Applies the patches from `./android-patches`
4. Determines the correct toolchain to use based on the architecture.
5. Set Node GYP environment variables.
6. Runs `./configure`. Make changes here for configuring features needed for the build. E.g. Including the Intl module.
7. Runs `make` in the root directory to build the Node.js Mobile binary. Make uses the Android NDK toolchain to compile the binary.
8. Runs `./tools/copy_libnode_headers.sh` to copy the headers and package it with the binary.

### iOS

1. Update the repository with the changes of the specific version from upsteam. See the [link](https://github.com/nodejs-mobile/nodejs-mobile/blob/main/doc_mobile/CONTRIBUTING.md#updating-nodejs-mobile-from-upstream-nodejsnode) for more details.
2. When you start the build it sets Node GYP environment variables.
6. Runs `./configure`. Make changes here for configuring features needed for the build. E.g. Including the Intl module.
7. Runs `make` in the root directory to build the Node.js Mobile binary. Make uses the Xcode to compile the binary.
8. After the binary is built it wraps the binary into a `.framework` bundle.
