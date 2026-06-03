import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fitcoach.app",
  appName: "FitCoach",
  webDir: "out",
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0D9488", // teal-600
      showSpinner: false,
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT", // white icons on teal background
      backgroundColor: "#0D9488",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true, // disable before app store release
  },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
  },
};

export default config;
