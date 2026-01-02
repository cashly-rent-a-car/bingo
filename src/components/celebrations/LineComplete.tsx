'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDisplay } from '@/components/lobby/AvatarPicker';

interface LineCompleteProps {
  isVisible: boolean;
  playerName: string;
  avatarId: string;
  lineType: 'row' | 'column' | 'diagonal';
  points: number;
  onComplete: () => void;
}

export function LineComplete({
  isVisible,
  playerName,
  avatarId,
  lineType,
  points,
  onComplete,
}: LineCompleteProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const lineTypeText = {
    row: 'LINHA',
    column: 'COLUNA',
    diagonal: 'DIAGONAL',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Confetti simples */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: window.innerHeight + 20,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  delay: Math.random() * 0.5,
                  ease: 'linear',
                }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#f43f5e', '#8b5cf6', '#06b6d4', '#22c55e', '#eab308'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>

          {/* Card de celebração */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <AvatarDisplay avatarId={avatarId} size="xl" className="mx-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-white/80 text-lg mb-1">{playerName}</p>
              <h2 className="text-3xl font-black text-white mb-2">
                FEZ {lineTypeText[lineType]}!
              </h2>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="inline-block bg-yellow-400 text-black font-black text-xl px-4 py-2 rounded-full"
              >
                +{points} pts
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
