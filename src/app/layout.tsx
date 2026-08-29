import type { Metadata } from "next";
import { Tajawal, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Providers from "@/components/Providers";
import SiteChrome from "@/components/SiteChrome";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نَسَق NASAQ | Handmade Art & Craft Supplies",
  description:
    "منصة نَسَق للفن اليدوي ومستلزمات الحرف - اكتشف إبداعات حرفيينا أو اطلب قطعة مخصصة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${tajawal.variable} ${cormorant.variable} ${montserrat.variable} min-h-screen flex flex-col`}
      >
        <Providers>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
