import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart";
import { ChatWidget } from "@/components/chat/chat-widget";
import { AuthProvider } from "@/store/authStore";
import { WishlistProvider } from "@/store/wishlistStore";
import { CollectionsProvider } from "@/store/collectionsStore";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NØRD — AI-Powered Fashion Store",
  description: "Your personal AI stylist. Discover outfits tailored to your needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CollectionsProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <ChatWidget />
              </CollectionsProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
