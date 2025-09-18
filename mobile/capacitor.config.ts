import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "im.mustang.capa",
  appName: "Mustang",
  webDir: "./dist",
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
    EdgeToEdge: {
      backgroundColor: "#494558", // --appbar-bg, see app.css
    },
  },
}

export default config;
