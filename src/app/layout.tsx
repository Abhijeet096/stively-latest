import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://stively-2-dcekzjhk2-abhijits-projects-843a77bf.vercel.app'),
  title: {
    default: 'Stively - Discover Stories That Inspire',
    template: '%s | Stively',
  },
  description: 'Your destination for insightful articles, expert analysis, and compelling stories across technology, lifestyle, and more.',
  keywords: ['blog', 'articles', 'technology', 'lifestyle', 'insights', 'stories'],
  authors: [{ name: 'Stively Team' }],
  creator: 'Stively',
  publisher: 'Stively',
  icons: {
    icon: [
      { url: '/stively-fevicon.png' },
      { url: '/stively-fevicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/stively-fevicon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stively-2-dcekzjhk2-abhijits-projects-843a77bf.vercel.app',
    siteName: 'Stively',
    title: 'Stively - Discover Stories That Inspire',
    description: 'Your destination for insightful articles, expert analysis, and compelling stories.',
    images: [
      {
        url: 'https://ik.imagekit.io/stivelyimages/Stively-images/stively-fevicon.png?updatedAt=1760326946261',
        width: 1200,
        height: 630,
        alt: 'Stively - Discover Stories That Inspire',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stively - Discover Stories That Inspire',
    description: 'Your destination for insightful articles, expert analysis, and compelling stories.',
    images: ['https://ik.imagekit.io/stivelyimages/Stively-images/stively-fevicon.png?updatedAt=1760326946261'],
    creator: '@stively',
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
  verification: {
    google: 'your-google-verification-code', // Add after Google Search Console setup
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1688587815359544"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          {/* Google AdSense Display Ad */}
          <div className="ad-container" style={{ textAlign: 'center', margin: '20px 0' }}>
            <ins 
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-1688587815359544"
              data-ad-slot="9303208781"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `(adsbygoogle = window.adsbygoogle || []).push({});`
              }}
            />
          </div>
          
          {children}
        </SessionProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}