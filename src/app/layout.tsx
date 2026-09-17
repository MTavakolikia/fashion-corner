import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { auth } from "@clerk/nextjs/server";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import { BodyCleanup } from "@/components/BodyCleanup";
import Navbar from "@/components/root/Navbar";
import { Footer } from "@/components/root/Footer";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fashion Corner",
  description: "Your go-to destination for trendy, timeless, and unique fashion. Discover curated styles that define you. Elevate your wardrobe effortlessly.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>
              <BodyCleanup />
              <ScrollProgress className="fixed top-0 z-[70] h-0.5 bg-gradient-to-r from-orange-400 via-purple-500 to-pink-500" />
              <Navbar userId={userId} />
              <main className="flex-grow pt-[92px] md:pt-20 pb-16 md:pb-0">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
