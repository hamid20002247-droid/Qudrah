import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ClientBody } from "@/components/ClientBody";
import { BottomNav, SiteFooter, TopBar } from "@/components/layout/Chrome";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "قُدرة — تدريب القسم الكمي",
    template: "%s | قُدرة",
  },
  description:
    "تدريب على القسم الكمي في اختبار القدرات: 60 مهارة، بنك أسئلة داخل كل مهارة، وتصوّر واختصار وتدريب موقوت — مع محاكاة 60 سؤالاً.",
  applicationName: "قُدرة",
  manifest: "/manifest.webmanifest",
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
    title: "قُدرة — تدريب القسم الكمي",
    description:
      "60 مهارة كمي · بنك أسئلة داخل المهارات · محاكاة موقوتة 60 دقيقة.",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "قُدرة",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "قُدرة — تدريب القسم الكمي",
    description: "مسار كمي منظم: تصوّر، اختصار، تدريب، ومحاكاة.",
    images: ["/icons/icon-512.png"],
  },
  other: {
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-[#F8FAFC] font-sans text-ink antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <ClientBody>
            <RegisterSW />
            <TopBar />
            <main className="flex-1 pb-4">{children}</main>
            <SiteFooter />
            <BottomNav />
          </ClientBody>
        </Providers>
      </body>
    </html>
  );
}
