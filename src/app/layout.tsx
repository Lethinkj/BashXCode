import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clan Contest Platform",
  description: "A competitive programming contest hosting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Pyodide for client-side Python execution */}
        <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js" async></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
