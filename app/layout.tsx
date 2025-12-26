import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReferrerProvider from "./ReffererProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kaspium wallet",
  description: "Kaspium is a non-custodial wallet for Kaspa network. You can create or import multiple wallets, send and receive funds, view wallet addresses and transactions and much more.",
  keywords: "kaspium wallet , kaspium",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReferrerProvider>  
{children}
        </ReferrerProvider>
      </body>
    </html>
  );
}
