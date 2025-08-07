import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "im.mustang.capa",
  appName: "Mustang",
  webDir: "./dist",
  plugins: {
    CapacitorNodeJS: {
      nodeDir: "nodejs",
    },
    SplashScreen: {
      "launchAutoHide": true
    }
  },
  android: {
    buildOptions: {
      keystorePath: process.env.KEYSTORE_PATH,
      keystorePassword: process.env.KEYSTORE_PASS,
      keystoreAlias: process.env.KEYSTORE_ALIAS,
      keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASS,
    }
  }
}

export default config;
