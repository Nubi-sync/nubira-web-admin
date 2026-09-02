import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Public_Sans, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://zigza.in'),
  title: {
    default: "Zigza MES | Apparel Manufacturing & Floor Execution Platform",
    template: "%s | Zigza MES"
  },
  description: "Zigza is India's premier Manufacturing Execution System (MES) built for modern garment factories. Eliminate manual paper logs, automate cutting lot matrices, track live bundle allotments, and calculate lineman piece rates with zero ghost pieces.",
  keywords: [
    "Zigza",
    "Zigza MES",
    "garment manufacturing software",
    "apparel MES India",
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
    title: "Zigza MES | The Operating System for Apparel Factories",
    description: "Replace paper registers with real-time floor synchronization from fabric store to carton dispatch. Designed for modern garment manufacturers.",
    url: "https://zigza.in",
    siteName: "Zigza MES",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://zigza.in/icon.png",
        width: 512,
        height: 512,
        type: "image/png",
        alt: "Zigza MES Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Zigza MES | Modern Apparel Manufacturing",
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
      "name": "Zigza MES",
      "operatingSystem": "Web, Android, iOS",
      "applicationCategory": "BusinessApplication",
      "url": "https://zigza.in",
      "description": "Manufacturing Execution System engineered for modern apparel factories. Eliminating paper registers with synchronized floor intelligence.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${publicSans.variable} ${jetbrainsMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
