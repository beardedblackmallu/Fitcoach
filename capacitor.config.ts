import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fitcoach.app",
  appName: "FitCoach",
  webDir: "out",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#1C1C1C", // charcoal
      showSpinner: false,
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT", // white icons on charcoal background
      backgroundColor: "#1C1C1C",
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
