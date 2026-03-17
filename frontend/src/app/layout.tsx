import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProvider } from "@/providers/appProvider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Coach OS | Gestão Premium para Personal Trainers",
    template: "%s | Coach OS",
  },
  description:
    "A plataforma completa para Personal Trainers que desejam profissionalismo, agilidade na montagem de treinos e uma gestão financeira impecável.",
  keywords: [
    "personal trainer",
    "gestão de alunos",
    "planilha de treinos",
    "app para personal trainer",
    "consultoria fitness online",
    "agenda personal trainer",
  ],
  authors: [{ name: "Coach OS Team" }],
  creator: "Coach OS",
  publisher: "Coach OS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "Coach OS",
    title: "Coach OS | Gestão Premium para Personal Trainers",
    description:
      "Domine sua agenda, escale seus treinos e profissionalize sua consultoria com a Coach OS.",
    images: [
      {
        url: "/og-image.jpg", // Precisaremos garantir que esta imagem exista ou usar uma placeholder
        width: 1200,
        height: 630,
        alt: "Coach OS - Gestão para Personal Trainers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coach OS | Gestão Premium para Personal Trainers",
    description:
      "A plataforma completa para Personal Trainers que desejam escalar sua consultoria.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
