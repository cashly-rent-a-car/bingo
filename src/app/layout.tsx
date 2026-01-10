import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";
import { JsonLdWebApplication, JsonLdFAQ, JsonLdOrganization } from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bingou.me'),
  title: {
    default: 'Bingou! - Bingo Online Multiplayer Gratuito',
    template: '%s | Bingou!',
  },
  description: 'Jogue Bingo online com amigos em tempo real. Crie salas privadas, compartilhe o PIN e divirta-se! Gratuito, sem cadastro, direto no navegador.',
  keywords: [
    'bingo online',
    'bingo multiplayer',
    'bingo com amigos',
    'jogo de bingo gratis',
    'bingo online gratis',
    'bingo em tempo real',
    'bingo virtual',
    'jogar bingo',
    'bingo party',
    'bingo game',
  ],
  authors: [{ name: 'Bingou!' }],
  creator: 'Bingou!',
  publisher: 'Bingou!',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://bingou.me',
    siteName: 'Bingou!',
    title: 'Bingou! - Bingo Online Multiplayer Gratuito',
    description: 'Jogue Bingo online com amigos em tempo real. Crie salas privadas, compartilhe o PIN e divirta-se!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bingou! - Bingo Online com Amigos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bingou! - Bingo Online Multiplayer Gratuito',
    description: 'Jogue Bingo online com amigos em tempo real. Gratuito e sem cadastro!',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://bingou.me',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <JsonLdWebApplication />
        <JsonLdFAQ />
        <JsonLdOrganization />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
        <ToastContainer />
        <Analytics />
      </body>
    </html>
  );
}
