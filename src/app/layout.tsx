import type { Metadata } from "next";
import { Poppins, Source_Sans_3 } from "next/font/google";
import { CartProvider } from "@/components/cart";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ToastProvider } from "@/components/state/toast-provider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-heading",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Handcrafted Haven",
    template: "%s | Handcrafted Haven",
  },
  description:
    "A marketplace where artisans showcase and sell handcrafted products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${sourceSans.variable}`}>
      <body>
        <ToastProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
