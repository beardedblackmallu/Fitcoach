import type { NextConfig } from "next";

// MOBILE_BUILD=true → static export for Capacitor (out/ directory)
// Default (web/Vercel) → normal Next.js with server features intact
const isMobileBuild = process.env.MOBILE_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isMobileBuild
    ? {
        output: "export",
        // Next.js image optimisation requires a server — disable for static export.
        // Capacitor uses the native device's image handling anyway.
        images: { unoptimized: true },
        // Trailing slash so Capacitor resolves routes from index.html correctly
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
