import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import CompareActionBar from "@/components/CompareActionBar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "AutoUY — Marketplace de Vehículos Uruguay",
    template: "%s | AutoUY",
  },
  description:
    "Encontrá el auto, moto o camión ideal en AutoUY. El marketplace de vehículos más completo de Uruguay.",
  keywords: ["autos", "motos", "camiones", "venta", "Uruguay", "automotoras"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://autouuy.uy",
  ),
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: "https://autouuy.uy",
    siteName: "AutoUY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex flex-col min-h-dvh">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <CompareActionBar />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
