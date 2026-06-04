import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { AuthGuard } from "@/components/AuthGuard";
import { CapacitorInit } from "@/components/CapacitorInit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitCoach — Coaching dashboard",
  description: "WhatsApp-native coaching platform for online fitness trainers",
  appleWebApp: {
    capable: true,
    title: "FitCoach",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#FAFAF9] text-stone-900" suppressHydrationWarning>
        <AppProvider>
          <CapacitorInit />
          <AuthGuard>{children}</AuthGuard>
        </AppProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
