'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDisplay } from '@/components/lobby/AvatarPicker';
import { Ranking } from '@/components/game/Ranking';
import { Button } from '@/components/ui/Button';
import type { RankingEntry } from '@/types/game';

interface BingoWinProps {
  isVisible: boolean;
  winnerName: string;
  winnerAvatarId: string;
  finalScores: RankingEntry[];
  onClose: () => void;
  onPlayAgain?: () => void;
}

export function BingoWin({
  isVisible,
  winnerName,
  winnerAvatarId,
  finalScores,
  onClose,
  onPlayAgain,
}: BingoWinProps) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{id: number; x: number; color: string; delay: number; duration: number}>>([]);

  useEffect(() => {
    if (isVisible) {
      // Vibrar se disponível
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200, 100, 300]);
      }

      // Gera confetti
      const pieces = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#f43f5e', '#8b5cf6', '#06b6d4', '#22c55e', '#eab308', '#f97316', '#ec4899', '#14b8a6'][Math.floor(Math.random() * 8)],
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
      }));
      setConfettiPieces(pieces);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Background com gradiente animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-black/90 to-pink-900/95"
            animate={{
              background: [
                'linear-gradient(to bottom right, rgba(88, 28, 135, 0.95), rgba(0, 0, 0, 0.9), rgba(131, 24, 67, 0.95))',
                'linear-gradient(to bottom right, rgba(131, 24, 67, 0.95), rgba(0, 0, 0, 0.9), rgba(88, 28, 135, 0.95))',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Confetti caindo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                className="absolute w-3 h-3"
                style={{
                  left: `${piece.x}%`,
                  backgroundColor: piece.color,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
                initial={{ y: -20, rotate: 0, opacity: 1 }}
                animate={{
                  y: '110vh',
                  rotate: 720,
                  opacity: [1, 1, 0.5],
                }}
                transition={{
                  duration: piece.duration,
                  delay: piece.delay,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* Fogos de artifício grandes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <Firework key={i} delay={i * 0.4} />
            ))}
          </div>

          {/* Raios de luz do centro */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(255,215,0,0.3) 0%, transparent 50%)',
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0, y: 100, rotateX: 45 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            className="relative bg-gradient-to-br from-gray-900/90 via-purple-900/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto border border-yellow-500/30"
          >
            {/* Brilho dourado ao redor */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-3xl blur-lg opacity-50 animate-pulse" />

            <div className="relative">
              {/* Estrelas brilhantes */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${10 + (i % 4) * 25}%`,
                    top: i < 4 ? '-10px' : 'auto',
                    bottom: i >= 4 ? '-10px' : 'auto',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                >
                  ✨
                </motion.div>
              ))}

              {/* BINGO text com efeito épico */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-center mb-6"
              >
                <motion.h1
                  className="text-7xl sm:text-8xl font-black drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]"
                  animate={{
                    textShadow: [
                      '0 0 20px #ffd700, 0 0 40px #ff6b6b, 0 0 60px #ffd700',
                      '0 0 40px #ff6b6b, 0 0 60px #ffd700, 0 0 80px #ff6b6b',
                      '0 0 20px #ffd700, 0 0 40px #ff6b6b, 0 0 60px #ffd700',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="bg-gradient-to-r from-yellow-300 via-red-400 to-pink-400 bg-clip-text text-transparent">
                    BINGO!
                  </span>
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl mt-2"
                >
                  🎉🎊🎉
                </motion.div>
              </motion.div>

              {/* Vencedor com efeito de destaque */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-6"
              >
                <div className="relative inline-block mb-4">
                  {/* Glow pulsante atrás do avatar */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ transform: 'scale(1.5)' }}
                  />
                  <div className="relative">
                    <AvatarDisplay avatarId={winnerAvatarId} size="xl" />
                  </div>
                  {/* Coroa animada */}
                  <motion.div
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl"
                  >
                    <motion.span
                      animate={{
                        rotate: [-5, 5, -5],
                        y: [0, -3, 0],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      👑
                    </motion.span>
                  </motion.div>
                </div>
                <motion.h2
                  className="text-3xl font-bold text-white"
                  animate={{
                    textShadow: ['0 0 10px #fff', '0 0 20px #ffd700', '0 0 10px #fff'],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {winnerName}
                </motion.h2>
                <p className="text-yellow-400 font-semibold text-lg">🏆 VENCEDOR! 🏆</p>
              </motion.div>

              {/* Ranking final */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6 bg-black/30 rounded-xl p-4"
              >
                <h3 className="text-white/80 text-sm font-semibold mb-2 text-center">RANKING FINAL</h3>
                <Ranking ranking={finalScores} compact />
              </motion.div>

              {/* Botões */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-3"
              >
                <Button variant="ghost" className="flex-1" onClick={onClose}>
                  Fechar
                </Button>
                {onPlayAgain && (
                  <Button variant="primary" className="flex-1 bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-400 hover:to-pink-400" onClick={onPlayAgain}>
                    🎲 Jogar Novamente
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Firework({ delay }: { delay: number }) {
  const x = Math.random() * 100;
  const y = Math.random() * 40 + 5;
  const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#22c55e', '#eab308', '#f97316', '#ec4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 60 + Math.random() * 40; // Fogos maiores

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1.2, 0],
      }}
      transition={{
        delay,
        duration: 1.8,
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1
      }}
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Centro brilhante */}
      <motion.div
        className="absolute w-4 h-4 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
        }}
      />
      {/* Partículas explosivas */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0.5],
            x: Math.cos((i * 30 * Math.PI) / 180) * size,
            y: Math.sin((i * 30 * Math.PI) / 180) * size,
            opacity: [1, 1, 0],
          }}
          transition={{ delay: delay + 0.1, duration: 1 }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
      {/* Trail de partículas menores */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`trail-${i}`}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 0.5, 0],
            x: Math.cos(((i * 45 + 22.5) * Math.PI) / 180) * (size * 0.6),
            y: Math.sin(((i * 45 + 22.5) * Math.PI) / 180) * (size * 0.6),
            opacity: [0.8, 0.4, 0],
          }}
          transition={{ delay: delay + 0.2, duration: 0.8 }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </motion.div>
  );
}
