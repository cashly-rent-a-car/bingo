'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDisplay } from './AvatarPicker';
import { cn } from '@/lib/utils/cn';
import type { Player } from '@/types/room';

interface PlayerListProps {
  players: Player[];
  hostId: string;
  currentPlayerId?: string;
}

export function PlayerList({ players, hostId, currentPlayerId }: PlayerListProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>Jogadores</span>
        <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
          {players.length}
        </span>
      </h3>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl',
                'bg-white/10 backdrop-blur-sm',
                player.id === currentPlayerId && 'ring-2 ring-purple-500'
              )}
            >
              <AvatarDisplay avatarId={player.avatarId} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate">
                    {player.name}
                  </span>
                  {player.id === hostId && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      Host
                    </span>
                  )}
                  {player.id === currentPlayerId && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      Você
                    </span>
                  )}
                </div>
              </div>

              {/* Status de conexão */}
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  player.isConnected ? 'bg-green-500' : 'bg-gray-500'
                )}
                title={player.isConnected ? 'Online' : 'Offline'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {players.length === 0 && (
        <div className="text-center text-white/50 py-8">
          Aguardando jogadores...
        </div>
      )}
    </div>
  );
}
