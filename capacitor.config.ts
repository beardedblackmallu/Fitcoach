import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fitcoach.trainer",
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
    // Capgo social-login: client IDs come from env vars set in .env.local.
    // These are passed again at runtime in SocialLogin.initialize() inside
    // CapacitorInit — the config here is for reference/tooling only.
    SocialLogin: {
      google: {
        webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
      },
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
