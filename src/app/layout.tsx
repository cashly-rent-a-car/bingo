import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bingo Online - Jogue com seus amigos!",
  description: "Crie salas privadas de Bingo e jogue com seus amigos em tempo real. Divertido, interativo e gratuito!",
  keywords: ["bingo", "online", "multiplayer", "jogo", "amigos", "família"],
  authors: [{ name: "Bingo Online" }],
  openGraph: {
    title: "Bingo Online - Jogue com seus amigos!",
    description: "Crie salas privadas de Bingo e jogue com seus amigos em tempo real.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
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
