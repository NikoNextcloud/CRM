import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrintPilot AI CRM",
  description: "Премиум CRM за печатници, рекламни агенции и производители на рекламни материали."
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
