'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { BingoCardDecoration } from '@/components/home/BingoCardDecoration';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-12 sm:pt-0 sm:justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full flex flex-col items-center gap-3 sm:gap-6">
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-6xl sm:text-8xl font-black mb-1 sm:mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              BINGO
            </span>
          </h1>
          <p className="text-lg sm:text-2xl text-white/60 font-light">
            Online
          </p>
        </motion.div>

        {/* Cartela decorativa - menor para caber na tela */}
        <div className="w-full max-w-[160px] sm:max-w-[240px]">
          <BingoCardDecoration />
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/70 text-sm sm:text-lg"
        >
          Crie salas privadas e jogue com seus amigos!
        </motion.p>

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full"
        >
          <Button
            variant="primary"
            size="xl"
            className="flex-1"
            onClick={() => router.push('/criar')}
          >
            <span className="mr-2">🎮</span>
            COMEÇAR
          </Button>

          <Button
            variant="ghost"
            size="xl"
            className="flex-1 border-2 border-white/20"
            onClick={() => router.push('/entrar')}
          >
            <span className="mr-2">🔑</span>
            DIGITAR PIN
          </Button>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-white/40 text-sm"
        >
          <p>Gratuito para até 5 jogadores por sala</p>
        </motion.div>
      </div>
    </main>
  );
}
