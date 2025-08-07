import { CapacitorConfig } from '@capacitor/cli';
import { env } from 'node:process';

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
      keystorePath: env.KEYSTORE_PATH,
      keystorePassword: env.KEYSTORE_PASS,
      keystoreAlias: env.KEYSTORE_ALIAS,
      keystoreAliasPassword: env.KEYSTORE_ALIAS_PASS,
    }
  }
}

export default config;
