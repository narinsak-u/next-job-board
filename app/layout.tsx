import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mdxeditor/editor/style.css";
import { ClerkProvider } from "@/services/clerk/components/ClerkProvider";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { UploadThingSSR } from "@/services/uploadthing/components/UploadThingSSR";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Next Job Board",
    default: "Next Job Board",
  },
  description: "Find your next job opportunity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        >
          {children}
          <Toaster richColors />
          <Suspense><UploadThingSSR /></Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
