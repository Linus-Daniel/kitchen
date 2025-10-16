import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/providers/Providers";
import Head from "next/head";



export const metadata: Metadata = {
  title: "KitchenMode - Food Delivery",
  description: "Order delicious food online with KitchenMode",
  manifest: "/manifest.json",
  themeColor: "#D97706",
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KitchenMode",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "KitchenMode",
    title: "KitchenMode - Food Delivery",
    description: "Order delicious food online with KitchenMode",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "KitchenMode Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "KitchenMode - Food Delivery",
    description: "Order delicious food online with KitchenMode",
    images: "/icons/icon-512x512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html >
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}