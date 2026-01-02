'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { BingoBall } from '@/types/game';

interface DrawnNumbersProps {
  drawnBalls: BingoBall[];
  currentBall?: BingoBall | null;
  compact?: boolean;
}

const COLUMNS = ['B', 'I', 'N', 'G', 'O'] as const;
const COLUMN_RANGES: Record<string, { min: number; max: number; color: string }> = {
  B: { min: 1, max: 15, color: 'bg-red-500' },
  I: { min: 16, max: 30, color: 'bg-orange-500' },
  N: { min: 31, max: 45, color: 'bg-yellow-500' },
  G: { min: 46, max: 60, color: 'bg-green-500' },
  O: { min: 61, max: 75, color: 'bg-blue-500' },
};

export function DrawnNumbers({ drawnBalls, currentBall, compact = false }: DrawnNumbersProps) {
  // Agrupa bolas por coluna
  const ballsByColumn: Record<string, number[]> = {
    B: [],
    I: [],
    N: [],
    G: [],
    O: [],
  };

  drawnBalls.forEach((ball) => {
    ballsByColumn[ball.column].push(ball.number);
  });

  // Ordena cada coluna
  Object.keys(ballsByColumn).forEach((col) => {
    ballsByColumn[col].sort((a, b) => a - b);
  });

  if (compact) {
    return (
      <div className="space-y-2">
        {COLUMNS.map((col) => (
          <div key={col} className="flex items-center gap-2">
            <span
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg text-white font-bold text-sm',
                COLUMN_RANGES[col].color
              )}
            >
              {col}
            </span>
            <div className="flex flex-wrap gap-1 flex-1">
              {ballsByColumn[col].length === 0 ? (
                <span className="text-white/30 text-sm">-</span>
              ) : (
                ballsByColumn[col].map((num) => (
                  <span
                    key={num}
                    className={cn(
                      'text-sm font-mono',
                      currentBall?.number === num
                        ? 'text-yellow-400 font-bold'
                        : 'text-white/70'
                    )}
                  >
                    {num}
                    {num !== ballsByColumn[col][ballsByColumn[col].length - 1] && ','}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-5 gap-1 mb-1">
        {COLUMNS.map((col) => (
          <div
            key={col}
            className={cn(
              'py-1 text-center rounded text-white font-bold text-sm',
              COLUMN_RANGES[col].color
            )}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Números - Grid compacto */}
      <div className="grid grid-cols-5 gap-1">
        {COLUMNS.map((col) => (
          <div key={col} className="flex flex-col gap-0.5">
            {Array.from({ length: 15 }, (_, i) => {
              const num = COLUMN_RANGES[col].min + i;
              const isDrawn = ballsByColumn[col].includes(num);
              const isCurrent = currentBall?.number === num;

              return (
                <motion.div
                  key={num}
                  initial={isCurrent ? { scale: 0 } : false}
                  animate={isCurrent ? { scale: 1 } : {}}
                  className={cn(
                    'h-6 flex items-center justify-center rounded text-xs font-bold transition-all',
                    isDrawn
                      ? isCurrent
                        ? 'bg-yellow-400 text-black ring-2 ring-yellow-300 shadow-lg shadow-yellow-400/50 animate-pulse scale-110'
                        : `${COLUMN_RANGES[col].color} text-white shadow-sm`
                      : 'bg-white/5 text-white/20'
                  )}
                >
                  {num}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para mostrar o número atual em destaque
export function CurrentBall({ ball }: { ball: BingoBall | null }) {
  if (!ball) {
    return (
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-white/30 text-lg">?</span>
      </div>
    );
  }

  return (
    <motion.div
      key={ball.number}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={cn(
        'w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center shadow-2xl',
        COLUMN_RANGES[ball.column].color
      )}
    >
      <span className="text-white/80 text-xl font-bold">{ball.column}</span>
      <span className="text-white text-5xl sm:text-6xl font-black">{ball.number}</span>
    </motion.div>
  );
}
