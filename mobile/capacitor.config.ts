import type { CapacitorConfig } from '@capacitor/cli';
import { production } from '../app/logic/build.ts';
import { env } from 'node:process';

function config(): CapacitorConfig {
  return {
    appId: "im.mustang.capa",
    appName: "Mustang",
    webDir: "./dist",
    plugins: {
      CapacitorNodeJS: {
        nodeDir: "nodejs",
        androidLibNode: "https://github.com/mustang-im/nodejs-mobile/releases/download/v22.9.0/nodejs-mobile-v22.9.0-android.zip",
        androidArchitectures: ["arm64"],
      },
      SplashScreen: {
        "launchAutoHide": true
      },
      EdgeToEdge: {
        backgroundColor: "#494558", // --appbar-bg, see app.css
      },
    },
    ios: {
      buildOptions: {
        signingStyle: production ? 'manual' : 'automatic',
        exportMethod: production ? 'app-store-connect' : 'debugging',
        signingCertificate: env.IOS_SIGNING_CERTIFICATE,
        provisioningProfile: env.IOS_PROVISIONING_PROFILE,
      },
    }
  }
}

export default config();
