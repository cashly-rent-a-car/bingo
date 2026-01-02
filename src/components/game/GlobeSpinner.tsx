'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CurrentBall } from './DrawnNumbers';
import type { BingoBall } from '@/types/game';

interface GlobeSpinnerProps {
  currentBall: BingoBall | null;
  onSpin: () => void;
  isSpinning?: boolean;
  disabled?: boolean;
  remainingBalls: number;
}

export function GlobeSpinner({
  currentBall,
  onSpin,
  isSpinning = false,
  disabled = false,
  remainingBalls,
}: GlobeSpinnerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSpin = () => {
    if (isAnimating || disabled) return;

    setIsAnimating(true);
    setTimeout(() => {
      onSpin();
      setTimeout(() => setIsAnimating(false), 500);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Globo */}
      <div className="relative">
        {/* Efeito de brilho */}
        <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-full blur-2xl animate-pulse" />

        {/* Container do globo */}
        <motion.div
          animate={isAnimating ? { rotate: 360 * 3 } : {}}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Globo externo */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border-4 border-gray-600 shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Grade do globo */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 border border-white/30 rounded-full"
                  style={{ transform: `scale(${1 - i * 0.1})` }}
                />
              ))}
            </div>

            {/* Bolinhas decorativas */}
            <AnimatePresence>
              {isAnimating && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: 0,
                        y: 0,
                        scale: 0.5,
                      }}
                      animate={{
                        x: Math.cos((i * 30 * Math.PI) / 180) * 60,
                        y: Math.sin((i * 30 * Math.PI) / 180) * 60,
                        scale: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-white to-gray-300 shadow-md"
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Número atual */}
            <AnimatePresence mode="wait">
              {!isAnimating && currentBall && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CurrentBall ball={currentBall} />
                </motion.div>
              )}
              {!isAnimating && !currentBall && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/30 text-lg"
                >
                  Clique em GIRAR
                </motion.div>
              )}
              {isAnimating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-4xl"
                >
                  🎱
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Base do globo */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-full border-2 border-gray-600" />
        </motion.div>
      </div>

      {/* Botão girar */}
      <Button
        variant="primary"
        size="xl"
        onClick={handleSpin}
        disabled={disabled || isAnimating || remainingBalls === 0}
        isLoading={isAnimating}
        className="min-w-[200px]"
      >
        {isAnimating ? (
          'Girando...'
        ) : remainingBalls === 0 ? (
          'Fim das bolas!'
        ) : (
          <>
            🎱 GIRAR
          </>
        )}
      </Button>
    </div>
  );
}
