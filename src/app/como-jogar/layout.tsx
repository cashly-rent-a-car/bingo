import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Como Jogar Bingo Online',
  description: 'Aprenda a jogar Bingo online com amigos. Guia completo passo a passo: criar sala, compartilhar PIN, sortear bolas e fazer BINGO! Gratuito e sem cadastro.',
  keywords: [
    'como jogar bingo',
    'regras do bingo',
    'bingo online tutorial',
    'aprender bingo',
    'jogar bingo com amigos',
    'bingo multiplayer como funciona',
  ],
  openGraph: {
    title: 'Como Jogar Bingo Online - Guia Completo',
    description: 'Aprenda a jogar Bingo online com amigos em 7 passos simples. Gratuito e sem cadastro!',
  },
  alternates: {
    canonical: 'https://bingou.me/como-jogar',
  },
};

export default function ComoJogarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
