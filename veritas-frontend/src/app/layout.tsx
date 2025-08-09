import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { NetworkStatus } from '@/components/ui/ErrorComponents';
import { BackendStatus } from '@/components/ui/BackendStatus';
import "./globals.css";

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
    default: "Veritas - Product Authenticity Verification",
    template: "%s | Veritas"
  },
  description: "Verify product authenticity using blockchain technology. Submit products for verification and generate QR codes for customer verification using the Hedera Consensus Service.",
  keywords: [
    "product verification",
    "authenticity",
    "blockchain",
    "QR codes", 
    "supply chain",
    "Hedera",
    "product authentication",
    "counterfeit protection",
    "trust",
    "transparency"
  ],
  authors: [{ name: "Veritas Team" }],
  creator: "Veritas Team",
  publisher: "Veritas",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'https://veritas.example.com'),
  alternates: {
    canonical: '/',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Veritas',
    title: 'Veritas - Product Authenticity Verification',
    description: 'Verify product authenticity using blockchain technology. Protect your brand and customers with our secure verification system.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Veritas - Product Authenticity Verification',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veritas - Product Authenticity Verification',
    description: 'Verify product authenticity using blockchain technology. Protect your brand and customers.',
    images: ['/og-image.png'],
    creator: '@veritas',
    site: '@veritas',
  },
  verification: {
    // google: 'your-google-site-verification',
    // yandex: 'your-yandex-verification',
    // yahoo: 'your-yahoo-site-verification',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Veritas" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <NetworkStatus />
          <BackendStatus />
          {children}
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
