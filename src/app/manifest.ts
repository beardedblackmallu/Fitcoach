import type { MetadataRoute } from "next";

// force-static required for Next.js static export (Capacitor build)
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitCoach",
    short_name: "FitCoach",
    description:
      "WhatsApp-native coaching platform for independent online fitness trainers",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F4F2",
    theme_color: "#1C1C1C",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icon1",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon2",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon2",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["health", "fitness", "lifestyle", "productivity"],
  };
}
