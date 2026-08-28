import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SourceSeal — Consensus-backed claim verification",
  description:
    "Verify public claims against web evidence using decentralized AI-validator consensus on GenLayer.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
