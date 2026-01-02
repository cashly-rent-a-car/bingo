'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { AvatarDisplay } from '@/components/lobby/AvatarPicker';
import type { RankingEntry } from '@/types/game';

interface RankingProps {
  ranking: RankingEntry[];
  currentPlayerId?: string;
  compact?: boolean;
}

export function Ranking({ ranking, currentPlayerId, compact = false }: RankingProps) {
  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${position}º`;
    }
  };

  const getPositionChange = (entry: RankingEntry) => {
    const change = entry.previousPosition - entry.position;
    if (change > 0) return { direction: 'up', amount: change };
    if (change < 0) return { direction: 'down', amount: Math.abs(change) };
    return null;
  };

  if (compact) {
    return (
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white/60 mb-2">Ranking</h4>
        {ranking.slice(0, 5).map((entry) => (
          <motion.div
            key={entry.playerId}
            layout
            className={cn(
              'flex items-center gap-2 py-1 px-2 rounded-lg text-sm',
              entry.playerId === currentPlayerId && 'bg-purple-500/20'
            )}
          >
            <span className="w-6">{getMedalEmoji(entry.position)}</span>
            <span className="flex-1 truncate text-white/80">{entry.playerName}</span>
            <span className="font-bold text-white">{entry.score}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🏆</span>
        <span>Ranking</span>
      </h3>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {ranking.map((entry) => {
            const positionChange = getPositionChange(entry);

            return (
              <motion.div
                key={entry.playerId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl',
                  'bg-white/10 backdrop-blur-sm',
                  entry.playerId === currentPlayerId && 'ring-2 ring-purple-500',
                  entry.position <= 3 && 'bg-gradient-to-r from-white/10 to-white/5'
                )}
              >
                {/* Posição */}
                <div className="w-10 text-center">
                  <span className="text-xl">{getMedalEmoji(entry.position)}</span>
                </div>

                {/* Avatar */}
                <AvatarDisplay avatarId={entry.avatarId} size="sm" />

                {/* Nome e info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">
                      {entry.playerName}
                    </span>
                    {entry.playerId === currentPlayerId && (
                      <span className="text-xs text-purple-400">(você)</span>
                    )}
                  </div>
                  {entry.linesCompleted > 0 && (
                    <div className="text-xs text-white/50">
                      {entry.linesCompleted} linha{entry.linesCompleted > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Mudança de posição */}
                {positionChange && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'text-xs font-bold',
                      positionChange.direction === 'up' ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {positionChange.direction === 'up' ? '↑' : '↓'}
                    {positionChange.amount}
                  </motion.div>
                )}

                {/* Pontuação */}
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{entry.score}</div>
                  <div className="text-xs text-white/50">pts</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {ranking.length === 0 && (
        <div className="text-center text-white/40 py-4">
          Aguardando jogadores marcarem números...
        </div>
      )}
    </div>
  );
}
