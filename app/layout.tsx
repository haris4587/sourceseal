import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SourceSeal — Consensus-backed recheck protocol",
  description:
    "Verify public claims, challenge verdicts with counter-evidence, and preserve an append-only consensus history on GenLayer.",
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
