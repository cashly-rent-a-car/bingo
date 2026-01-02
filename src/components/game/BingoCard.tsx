'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useSound } from '@/hooks/useSound';
import { toast } from '@/components/ui/Toast';
import type { BingoCard as BingoCardType, BingoBall } from '@/types/game';

interface BingoCardProps {
  card: BingoCardType;
  drawnBalls: BingoBall[];
  onMarkNumber?: (number: number, position: { row: number; col: number }) => void;
  disabled?: boolean;
  showHeader?: boolean;
}

const COLUMNS = ['B', 'I', 'N', 'G', 'O'];
const HEADER_COLORS = [
  'from-red-500 to-red-600',
  'from-orange-500 to-orange-600',
  'from-yellow-500 to-yellow-600',
  'from-green-500 to-green-600',
  'from-blue-500 to-blue-600',
];

export function BingoCard({
  card,
  drawnBalls,
  onMarkNumber,
  disabled = false,
  showHeader = true,
}: BingoCardProps) {
  const [shakeCell, setShakeCell] = useState<string | null>(null);
  const { playNumberMarked, playErrorShake } = useSound();

  const drawnNumbers = new Set(drawnBalls.map((b) => b.number));

  const handleCellClick = (row: number, col: number) => {
    if (disabled) return;

    const cell = card.cells[row][col];
    if (cell.isFreeSpace || cell.isMarked) return;

    const number = cell.number;
    if (number === null) return;

    // Verifica se o número foi sorteado
    if (!drawnNumbers.has(number)) {
      // Erro! Número não foi sorteado
      playErrorShake();
      setShakeCell(`${row}-${col}`);
      toast(`O número ${number} ainda não foi sorteado!`, 'error');
      setTimeout(() => setShakeCell(null), 500);
      return;
    }

    // Marca o número
    playNumberMarked();
    onMarkNumber?.(number, { row, col });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header B-I-N-G-O */}
      {showHeader && (
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-1 sm:mb-2">
          {COLUMNS.map((letter, i) => (
            <div
              key={letter}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg sm:rounded-xl',
                'text-xl sm:text-2xl font-black text-white',
                `bg-gradient-to-br ${HEADER_COLORS[i]}`
              )}
            >
              {letter}
            </div>
          ))}
        </div>
      )}

      {/* Grid de células */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {card.cells.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <BingoCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              isDrawn={cell.number !== null && drawnNumbers.has(cell.number)}
              isShaking={shakeCell === `${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface BingoCellProps {
  cell: BingoCardType['cells'][0][0];
  isDrawn: boolean;
  isShaking: boolean;
  onClick: () => void;
  disabled: boolean;
}

function BingoCell({ cell, isDrawn, isShaking, onClick, disabled }: BingoCellProps) {
  const { isFreeSpace, isMarked, number } = cell;

  // Estados visuais:
  // - isFreeSpace: estrela amarela (já marcado)
  // - isMarked: roxo com check (jogador clicou e confirmou)
  // - default: cinza (jogador precisa acompanhar o sorteio ao vivo)

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isFreeSpace || isMarked}
      animate={isShaking ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
      className={cn(
        'aspect-square flex items-center justify-center rounded-lg sm:rounded-xl',
        'text-lg sm:text-xl font-bold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-purple-500',
        isShaking
          ? 'bg-red-500/30 text-white ring-2 ring-red-500'
          : isFreeSpace
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
          : isMarked
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-95'
          : 'bg-white/10 text-white hover:bg-white/20',
        !disabled && !isFreeSpace && !isMarked && 'cursor-pointer active:scale-95',
        disabled && 'cursor-default'
      )}
    >
      <AnimatePresence mode="wait">
        {isFreeSpace ? (
          <motion.span
            key="star"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl sm:text-3xl"
          >
            ⭐
          </motion.span>
        ) : isMarked ? (
          <motion.div
            key="marked"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="relative flex items-center justify-center"
          >
            <span>{number}</span>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-full h-full text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        ) : (
          <span key="number">{number}</span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
