import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitCoach — Coaching dashboard",
  description: "WhatsApp-native coaching platform for online fitness trainers",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#FAFAF9] text-stone-900">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
