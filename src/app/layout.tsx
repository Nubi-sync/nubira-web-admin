import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://zigza.in'),
  title: {
    default: "Zigza | Apparel Manufacturing & Floor Execution Platform",
    template: "%s | Zigza"
  },
  description: "Zigza is India's premier operations and floor execution platform built for modern garment factories. Eliminate manual paper logs, automate cutting lot matrices, track live bundle allotments, and calculate lineman piece rates with zero ghost pieces.",
  keywords: [
    "Zigza",
    "garment manufacturing software",
    "apparel software India",
    "garment factory ERP",
    "cutting lot matrix software",
    "apparel bundle tracking",
    "lineman piece rate ledger",
    "garment QC audit system",
    "textile manufacturing software",
    "apparel production planning"
  ],
  authors: [{ name: "Zigza Technologies", url: "https://zigza.in" }],
  creator: "Zigza Technologies",
  publisher: "Zigza Technologies",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://zigza.in",
  },
  openGraph: {
    title: "Zigza | The Operating System for Apparel Factories",
    description: "Replace paper registers with real-time floor synchronization from fabric store to carton dispatch. Designed for modern garment manufacturers.",
    url: "https://zigza.in",
    siteName: "Zigza",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://zigza.in/icon.png",
        width: 512,
        height: 512,
        type: "image/png",
        alt: "Zigza Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Zigza | Modern Apparel Manufacturing",
    description: "Streamline cutting tables, bundle allotments, 3-stage QC, and lineman wages with zero leakage.",
    images: ["https://zigza.in/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Zigza",
      "operatingSystem": "Web, Android, iOS",
      "applicationCategory": "BusinessApplication",
      "url": "https://zigza.in",
      "description": "Floor execution platform engineered for modern apparel factories. Eliminating paper registers with synchronized floor intelligence.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Zigza Technologies",
        "url": "https://zigza.in",
        "logo": "https://zigza.in/z%20i%20g%20z%20a%20(1)%20copy.png"
      }
    },
    {
      "@type": "Organization",
      "name": "Zigza",
      "url": "https://zigza.in",
      "logo": "https://zigza.in/z%20i%20g%20z%20a%20(1)%20copy.png"
    }
  ]
};

import { ReactQueryProvider } from "../lib/react-query-provider";
import { AuthSyncProvider } from "@/components/providers/AuthSyncProvider";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Public+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ReactQueryProvider>
          <AuthSyncProvider>
            <OfflineBanner />
            {children}
            <Toaster position="top-right" richColors closeButton />
          </AuthSyncProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
