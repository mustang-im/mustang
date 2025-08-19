import type { CapacitorConfig } from '@capacitor/cli';
import { env } from 'node:process';

const config: CapacitorConfig = {
  appId: "im.mustang.capa",
  appName: "Mustang",
  webDir: "./dist",
  plugins: {
    CapacitorNodeJS: {
      nodeDir: "nodejs",
      androidLibNode: "https://github.com/mustang-im/nodejs-mobile/releases/download/v22.9.0/nodejs-mobile-v22.9.0-android.zip",
    },
    SplashScreen: {
      "launchAutoHide": true
    }
  },
  android: {
    buildOptions: {
      keystorePath: env.KEYSTORE_PATH,
      keystorePassword: env.KEYSTORE_PASS,
      keystoreAlias: env.KEYSTORE_ALIAS,
      keystoreAliasPassword: env.KEYSTORE_ALIAS_PASS,
      releaseType: "APK",
    }
  }
}

export default config;
