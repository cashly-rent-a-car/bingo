'use client';

import { motion } from 'framer-motion';

export function BingoCardDecoration() {
  const sampleNumbers = [
    [7, 22, 38, 51, 68],
    [3, 19, 44, 59, 72],
    [12, 28, null, 47, 65], // null = estrela central
    [1, 16, 33, 54, 70],
    [9, 25, 41, 48, 63],
  ];

  const columns = ['B', 'I', 'N', 'G', 'O'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-600/30 blur-2xl rounded-3xl" />

      {/* Card */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/10">
        {/* Header B-I-N-G-O */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {columns.map((letter, i) => (
            <motion.div
              key={letter}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="aspect-square flex items-center justify-center rounded-xl text-2xl sm:text-3xl font-black"
              style={{
                background: `linear-gradient(135deg, ${getHeaderColor(i)})`,
              }}
            >
              {letter}
            </motion.div>
          ))}
        </div>

        {/* Grid de números */}
        <div className="grid grid-cols-5 gap-2">
          {sampleNumbers.map((row, rowIndex) =>
            row.map((number, colIndex) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: (rowIndex * 5 + colIndex) * 0.03 + 0.5,
                  type: 'spring',
                  stiffness: 200,
                }}
                className={`
                  aspect-square flex items-center justify-center rounded-xl text-lg sm:text-xl font-bold
                  ${number === null
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }
                  transition-all duration-200
                `}
              >
                {number === null ? '⭐' : number}
              </motion.div>
            ))
          )}
        </div>

        {/* Bolas flutuantes decorativas */}
        <FloatingBalls />
      </div>
    </motion.div>
  );
}

function FloatingBalls() {
  const balls = [
    { number: 42, color: 'from-red-500 to-pink-500', position: '-top-6 -right-6', delay: 0 },
    { number: 17, color: 'from-blue-500 to-cyan-500', position: '-bottom-4 -left-4', delay: 0.5 },
    { number: 63, color: 'from-green-500 to-emerald-500', position: '-top-4 left-1/4', delay: 1 },
  ];

  return (
    <>
      {balls.map((ball, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1, y: [0, -8, 0] }}
          transition={{
            scale: { delay: 1 + ball.delay, duration: 0.5, type: 'spring' },
            y: { delay: 1.5 + ball.delay, duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`
            absolute ${ball.position} w-12 h-12 sm:w-14 sm:h-14
            rounded-full flex items-center justify-center
            bg-gradient-to-br ${ball.color}
            text-white font-bold text-lg shadow-lg
            border-2 border-white/30
          `}
        >
          {ball.number}
        </motion.div>
      ))}
    </>
  );
}

function getHeaderColor(index: number): string {
  const colors = [
    '#ef4444, #dc2626', // B - vermelho
    '#f97316, #ea580c', // I - laranja
    '#eab308, #ca8a04', // N - amarelo
    '#22c55e, #16a34a', // G - verde
    '#3b82f6, #2563eb', // O - azul
  ];
  return colors[index];
}
