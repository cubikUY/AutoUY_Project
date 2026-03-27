import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutContent } from "@/components/LayoutContent";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "AutoUY Admin — Backoffice",
    template: "%s | AutoUY Admin",
  },
  description: "Panel de administración para automotoras — AutoUY.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased font-sans text-neutral-900 bg-neutral-50">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
