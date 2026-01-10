'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ComoJogarPage() {
  const steps = [
    {
      number: 1,
      title: 'Crie uma Sala',
      description: 'Clique em "Criar Sala", escolha seu avatar e nome. Um PIN exclusivo será gerado automaticamente.',
      icon: '🎯',
    },
    {
      number: 2,
      title: 'Compartilhe o PIN',
      description: 'Envie o PIN de 4 dígitos para seus amigos via WhatsApp, Telegram ou qualquer mensageiro.',
      icon: '📤',
    },
    {
      number: 3,
      title: 'Aguarde os Jogadores',
      description: 'Seus amigos entram com o PIN e escolhem seus avatares. Todos aparecem no lobby.',
      icon: '👥',
    },
    {
      number: 4,
      title: 'Inicie o Jogo',
      description: 'O host clica em "Iniciar Jogo". Cada jogador recebe uma cartela única automaticamente.',
      icon: '🎮',
    },
    {
      number: 5,
      title: 'Sorteie as Bolas',
      description: 'O host gira o globo para sortear números. Todos veem o número em tempo real.',
      icon: '🎱',
    },
    {
      number: 6,
      title: 'Marque sua Cartela',
      description: 'Clique nos números da sua cartela conforme são sorteados. O sistema valida automaticamente.',
      icon: '✅',
    },
    {
      number: 7,
      title: 'Complete e Ganhe!',
      description: 'Complete linhas para ganhar pontos. Complete a cartela toda para fazer BINGO e vencer!',
      icon: '🏆',
    },
  ];

  const faqs = [
    {
      question: 'O que é o Bingou?',
      answer: 'Bingou é uma plataforma gratuita de Bingo online multiplayer. Você pode criar salas privadas e jogar com amigos, família ou colegas em tempo real, direto no navegador.',
    },
    {
      question: 'Preciso criar conta para jogar?',
      answer: 'Não! O Bingou não exige cadastro. Basta escolher um nome e avatar para começar a jogar imediatamente.',
    },
    {
      question: 'Quantos jogadores podem participar?',
      answer: 'Não há limite de jogadores! Você pode jogar com 2 pessoas ou com dezenas de amigos na mesma sala.',
    },
    {
      question: 'O Bingou é gratuito?',
      answer: 'Sim, 100% gratuito! Não há taxas, assinaturas ou compras dentro do jogo.',
    },
    {
      question: 'Funciona no celular?',
      answer: 'Sim! O Bingou é responsivo e funciona perfeitamente em celulares, tablets e computadores.',
    },
    {
      question: 'Como funciona a pontuação?',
      answer: 'Você ganha pontos ao completar linhas (horizontal, vertical ou diagonal). Quanto mais linhas completar, mais pontos acumula. O BINGO completo dá a maior pontuação!',
    },
    {
      question: 'O que acontece se eu perder a conexão?',
      answer: 'Se você desconectar temporariamente, pode voltar à sala usando o mesmo PIN. Seu progresso é mantido por alguns minutos.',
    },
    {
      question: 'Posso jogar em reuniões ou eventos?',
      answer: 'Sim! O Bingou é perfeito para confraternizações, reuniões de trabalho, festas de aniversário, chás de bebê e qualquer evento que precise de uma atividade divertida.',
    },
  ];

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <span className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Bingou!
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Como Jogar Bingo Online
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Aprenda a jogar Bingo com seus amigos em minutos.
            Sem downloads, sem cadastro, 100% gratuito.
          </p>
        </div>

        {/* Steps */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Passo a Passo
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {step.number}. {step.title}
                      </h3>
                      <p className="text-white/60">{step.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-white/60">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Pronto para jogar?
            </h2>
            <p className="text-white/60 mb-6">
              Crie uma sala agora e convide seus amigos!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/criar">
                <Button size="lg" className="w-full sm:w-auto">
                  Criar Sala
                </Button>
              </Link>
              <Link href="/entrar">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Entrar com PIN
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-white/40 text-sm">
          <p>
            Bingou! - Bingo Online Multiplayer Gratuito
          </p>
          <p className="mt-2">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Voltar ao Início
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
