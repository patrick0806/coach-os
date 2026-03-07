import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { AppProvider } from "@/providers/app.provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coach OS",
  description: "Plataforma para personal trainers gerenciarem alunos e treinos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider>{children}</AppProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
