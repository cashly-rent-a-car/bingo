'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { generatePin } from '@/lib/utils/pin-generator';

export default function CriarPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);

    // Gera o PIN da sala
    const pin = generatePin();

    // Redireciona para a sala como host (sem nome/avatar - host só controla)
    router.push(`/sala/${pin}?host=true`);
  };

  return (
    <main className="h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 text-white/60 hover:text-white transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Criar Sala</h1>
          <p className="text-white/60 text-sm sm:text-base">Você será o controlador do jogo</p>
        </div>

        <Card className="p-4 sm:p-6 space-y-4">
          {/* Info do Host */}
          <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
            <div className="text-4xl mb-2">🎮</div>
            <h3 className="text-white font-bold text-lg mb-1">Modo Controlador</h3>
            <p className="text-white/60 text-sm">
              Como host, você irá sortear os números e controlar o ritmo do jogo.
              Os jogadores entrarão com o PIN da sala.
            </p>
          </div>

          {/* Botão criar */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleCreate}
            isLoading={isCreating}
          >
            🎲 Criar Sala
          </Button>
        </Card>
      </motion.div>
    </main>
  );
}
