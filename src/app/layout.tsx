import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Stively - Discover Inspiring Stories",
  description: "Read curated articles across technology, lifestyle, business, and more",
  icons: {
    icon: [
      { url: 'https://ik.imagekit.io/stivelyimages/Stively-images/stively-fevicon.png?updatedAt=1760326946261' },
      { url: 'https://ik.imagekit.io/stivelyimages/Stively-images/stively-fevicon.png?updatedAt=1760326946261', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: 'https://ik.imagekit.io/stivelyimages/Stively-images/stively-fevicon.png?updatedAt=1760326946261', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
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