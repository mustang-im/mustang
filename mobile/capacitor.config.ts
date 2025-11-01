import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
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
      launchAutoHide: true,
    },
  },
  backgroundColor: "#00000000",
}

export default config;
