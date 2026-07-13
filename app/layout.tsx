import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrintPilot AI CRM",
  description: "Premium CRM for print shops, sign makers and advertising production teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
