import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrintPilot AI CRM",
  description: "Премиум CRM за печатници, рекламни агенции и производители на рекламни материали.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrintPilot"
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png"
  }
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
