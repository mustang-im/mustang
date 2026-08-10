# macOS

## Node Native Modules

- The Node Native Modules are built for two architectures: `x64` and `arm64` because we're building for universal.
- There are some conflicts for packages that don't add the architecture to the `.node` file. That's why the `x64ArchFiles` field was used in the `electron-builder.yml`.
- The `npmRebuild` field in the `electron-builder.yml` is set to `true` to rebuild the node native modules for x64 and arm64.

## Code signing

### DMG code signing

1. Create a Certificate Signing Request: `openssl req -newkey rsa:2048 -keyout [name].key -out [name].csr` or other commands you know of.
2. Go to: https://developer.apple.com/account/resources
3. On the top left, click the add button (+).
4. Under Software, select Developer ID Application, then click Continue. Make sure it is Developer ID Application and not Developer ID Installer because they are different.
5. Click Choose File.
6. In the dialog that appears, select the certificate request file, then click Choose.
7. Click Continue.
8. Click Download.
9. Install the certificate.
10. Export the certificate. Make sure to use OpenSSL legacy mode because you may get an `MAC verification failed during PKCS12 import (wrong password?)`.
11. Encode to base64: `base64 -i certificate.p12 | pbcopy`
12. Add copied content as `CSC_LINK` secret
13. Add the certificate password to the `CSC_KEY_PASSWORD` secret

### PKG code signing

1. Create a Certificate Signing Request: `openssl req -newkey rsa:2048 -keyout [name].key -out [name].csr` or other commands you know of.
2. Go to: https://developer.apple.com/account/resources
3. On the top left, click the add button (+).
4. Under Software, select Developer ID Installer, then click Continue. Make sure it is Developer ID Installer and not Developer ID Application because they are different.
5. Click Choose File.
6. In the dialog that appears, select the certificate request file, then click Choose.
7. Click Continue.
8. Click Download.
9. Install the certificate.
10. Export the certificate. Make sure to use OpenSSL legacy mode because you may get an `MAC verification failed during PKCS12 import (wrong password?)`.
11. Encode to base64: `base64 -i certificate.p12 | pbcopy`
12. Add copied content as `CSC_INSTALLER_LINK` secret
13. Add the certificate password to the `CSC_INSTALLER_KEY_PASSWORD` secret

## Notarization

Notarization is a process where you submit your app to Apple for review and marking your app as a trusted app. If your app is not notarized, you will get a warning and you will need to go to your system settings and accept the warning to run your app for the first time.

### Create API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select Users and Access, and then select the Integrations tab.
3. Select App Store Connect API in the left column.
4. Make sure the Team Keys tab is selected.
5. Click Generate API Key or the Add (+) button.
6. Enter a name for the key. The name is for your reference only and isn't part of the key itself.
7. Under Access, select the role for the key.
8. Click Generate.
9. Copy the key ID and API issuer.
10. Click Download and a `.p8` file will be downloaded. The API key can only be downloaded once so make sure to keep it safe.

See [Creating API Keys for App Store Connect API](https://developer.apple.com/documentation/AppStoreConnectAPI/creating-api-keys-for-app-store-connect-api) documentation for any updates to the steps.

### Configure secrets for CI

1. Go to the repository
2. Go to the Settings tab
3. Go to Secrets and variables > Actions
4. Go to Repository secrets
5. Click New repository secret
6. Add `APPLE_API_KEY_ID` with the key ID for the App Store Connect API key
7. Add `APPLE_API_ISSUER` with the API issuer for the App Store Connect API key
8. Add `APPLE_API_KEY` with the direct contents of the `.p8` file downloaded from App Store Connect. Don't encode the contents of the file to base64 because it's already in plain text format.

## Auto-update

- Auto-update only works for the DMG target but the ZIP target is what is downloaded by the auto-updater.
- ZIP target must be set explicitly now because adding the PKG target removes the default ZIP target.
- `electron-updater` downloads the file specified in the `.yml` file to `~/Library/Caches/[appID].ShipIt`.

## Debugging

### Debugging the build outputs on CI

1. Set `mac.indentity` to `null` in `electron-builder.yml`
2. `export CSC_IDENTITY_AUTO_DISCOVERY=false`
3. Set `mac.notarize` to `false` in `electron-builder.yml`
4. Run `yarn build:mac`
5. Check the `desktop/dist` directory for the build outputs.
