# prebuild-for-nodejs-mobile

## Why choose this?

prebuild-for-nodejs-mobile is the only reliable way to rebuild Node native modules for mobile. However, the upstream repository builds for Node.js v18 and older versions of Android hence we need our own fork.

## How does it work?

1. Sets the Android NDK toolchain path or iOS toolchain path.
2. Sets the Node GYP environment variables.
3. Backup the original package.json file.
4. Patch the package.json file to use Node GYP Mobile to build Node native modules.
5. Copies the original package.json file to package directory.

## Dependencies

### Node.js Mobile

It needs the Node.js Mobile binary and headers to build for the specific Node.js binary.

### Android SDK and NDK

The toolchain for building Android binaries.

### [node-gyp](https://github.com/nodejs/node-gyp)

The tool for compiling Node Native modules. But this package is using Node.js Mobile specific package [here](https://github.com/nodejs-mobile/nodejs-mobile-gyp).
