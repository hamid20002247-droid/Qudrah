import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Tajawal } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ClientBody } from "@/components/ClientBody";
import { BottomNav, SiteFooter, TopBar } from "@/components/layout/Chrome";
import { RegisterSW } from "@/components/RegisterSW";
import { JsonLd } from "@/components/seo/JsonLd";
import { PostHogPageView } from "@/components/analytics/PostHogPageView";
import { PRODUCTION_SITE_URL } from "@/lib/publicConfig";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  INDEXABLE_ROBOTS,
  SITE_KEYWORDS,
  SITE_NAME,
} from "@/lib/seo";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: PRODUCTION_SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  keywords: [...SITE_KEYWORDS],
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: PRODUCTION_SITE_URL,
    languages: {
      "ar-SA": PRODUCTION_SITE_URL,
      ar: PRODUCTION_SITE_URL,
    },
  },
  robots: INDEXABLE_ROBOTS,
  icons: {
    icon: [
      { url: "/icons/icon.svg?v=4", type: "image/svg+xml" },
      { url: "/icons/icon-32.png?v=4", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16.png?v=4", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-48.png?v=4", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico?v=4", sizes: "48x48" },
      { url: "/icons/icon-192.png?v=4", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=4", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png?v=4", sizes: "180x180" }],
    shortcut: ["/icons/icon-192.png?v=4"],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: PRODUCTION_SITE_URL,
    siteName: SITE_NAME,
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png?v=4",
        width: 1200,
        height: 630,
        alt: "قُدرة — اختبار القدرات الكمي مجاناً · 20 اختباراً وتأسيس تفاعلي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/opengraph-image.png?v=4"],
  },
  other: {
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full max-w-[100vw] flex-col overflow-x-hidden bg-[#F8FAFC] font-sans text-ink antialiased"
        suppressHydrationWarning
      >
        <JsonLd />
        <Providers>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <ClientBody>
            <RegisterSW />
            <TopBar />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <BottomNav />
          </ClientBody>
        </Providers>
      </body>
    </html>
  );
}
