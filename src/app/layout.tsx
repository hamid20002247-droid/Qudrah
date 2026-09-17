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
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const TITLE = "قُدرة — تدريب القسم الكمي في القدرات";
const DESCRIPTION =
  "تدريب مستقل على القسم الكمي في اختبار القدرات: 60 مهارة بتصوّر تفاعلي، واختبار موقوت 60 سؤالاً. ليست تابعة لقياس.";

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_SITE_URL),
  title: {
    default: TITLE,
    template: "%s | قُدرة",
  },
  description: DESCRIPTION,
  applicationName: "قُدرة",
  keywords: [
    "قدرات",
    "كمي",
    "اختبار القدرات",
    "تدريب قدرات",
    "القسم الكمي",
    "محاكاة قدرات",
    "قياس كمي",
  ],
  manifest: "/manifest.webmanifest",
  alternates: { canonical: PRODUCTION_SITE_URL },
  robots: {
    index: true,
    follow: true,
  },
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
    title: "قُدرة",
    statusBarStyle: "default",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PRODUCTION_SITE_URL,
    siteName: "قُدرة",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
