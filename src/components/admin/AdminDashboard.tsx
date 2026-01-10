'use client';

import { motion } from 'framer-motion';
import type { AdminStats, RoomStats } from '@/types/admin';

interface AdminDashboardProps {
  stats: AdminStats;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getPhaseInfo(phase: RoomStats['gamePhase']): { icon: string; label: string; color: string } {
  switch (phase) {
    case 'lobby':
      return { icon: '⏳', label: 'Aguardando', color: 'text-yellow-400' };
    case 'playing':
      return { icon: '🎮', label: 'Jogando', color: 'text-green-400' };
    case 'ended':
      return { icon: '🏆', label: 'Finalizado', color: 'text-purple-400' };
  }
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const rooms = Object.values(stats.rooms).sort((a, b) => b.lastActivity - a.lastActivity);

  // Salas com pelo menos 1 pessoa conectada (realmente online)
  const onlineRooms = rooms.filter(r => r.connectedCount > 0);
  // Salas sem ninguém conectado (dormentes - regra 24h)
  const dormantRooms = rooms.filter(r => r.connectedCount === 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center"
        >
          <div className="text-3xl font-bold text-green-400 mb-1">
            {onlineRooms.length}
          </div>
          <div className="text-white/60 text-xs">Salas Online</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center"
        >
          <div className="text-3xl font-bold text-white/40 mb-1">
            {dormantRooms.length}
          </div>
          <div className="text-white/60 text-xs">Dormentes (24h)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center"
        >
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalPlayers}
          </div>
          <div className="text-white/60 text-xs">Jogadores Online</div>
        </motion.div>
      </div>

      {/* Rooms Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Salas</h2>
        </div>

        {rooms.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            Nenhuma sala ativa no momento
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/60 text-sm border-b border-white/10">
                  <th className="px-4 py-3 font-medium">PIN</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-center">Jogadores</th>
                  <th className="px-4 py-3 font-medium text-right">Atividade</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, index) => {
                  const phase = getPhaseInfo(room.gamePhase);
                  const isOnline = room.connectedCount > 0;
                  return (
                    <motion.tr
                      key={room.pin}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!isOnline ? 'opacity-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Indicador online/offline */}
                          <span
                            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-white/30'}`}
                            title={isOnline ? 'Online' : 'Dormante (regra 24h)'}
                          />
                          <span className="font-mono text-white font-medium">
                            {room.pin}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 ${phase.color}`}>
                          <span>{phase.icon}</span>
                          <span className="text-sm">{phase.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className={isOnline ? 'text-white' : 'text-white/40'}>
                            {room.connectedCount}
                            <span className="text-white/40">/{room.playerCount}</span>
                          </span>
                          {room.connectedCount === 0 && room.playerCount > 0 && (
                            <span className="text-[10px] text-white/30">offline</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-white/60 text-sm">
                        {formatTimeAgo(room.lastActivity)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Last Update */}
      <div className="text-center text-white/40 text-sm">
        Atualizado em {formatTime(stats.lastUpdate)}
      </div>
    </div>
  );
}
