# Capacitor-NodeJS

## Why choose this?

The Node.js Mobile binary cannot just run on mobile on it's own so this plugin is a wrapper that includes APIs that work with the Capacitor runtime.

## How does it work?

### Android

1. When the app starts, the plugin starts a new thread to run the Node.js Mobile binary.
2. On the new thread, the plugin copies the backend JS files to the app data public directory because the Node.js Mobile binary cannot read the files from the APK directly.
3. Determines the JS entry point from either `index.js` being present or the `main` field in `package.json`.
4. Starts the Node.js Mobile binary with the JS entry point.

### iOS

There's no implementation for iOS. We're using `mobile/ios/App/App/NodeRunner.swift` to start Node.js Mobile.
