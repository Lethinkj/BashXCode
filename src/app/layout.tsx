import type { Metadata } from "next";
import { Inter, Poppins, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const firaCode = Fira_Code({ 
  subsets: ["latin"],
  variable: '--font-fira-code',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Aura-7F Contest Platform",
  description: "Modern competitive programming contest platform powered by Aura-7F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${firaCode.variable}`}>
      <head>
        {/* Pyodide for client-side Python execution */}
        <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js" async></script>
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
