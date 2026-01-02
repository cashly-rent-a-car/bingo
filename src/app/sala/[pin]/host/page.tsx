'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePartySocket } from '@/hooks/usePartySocket';
import { useGameStore } from '@/stores/game-store';
import { useSound } from '@/hooks/useSound';
import { Card } from '@/components/ui/Card';
import { GlobeSpinner } from '@/components/game/GlobeSpinner';
import { DrawnNumbers } from '@/components/game/DrawnNumbers';
import { Ranking } from '@/components/game/Ranking';
import { LineComplete } from '@/components/celebrations/LineComplete';
import { BingoWin } from '@/components/celebrations/BingoWin';
import { toast } from '@/components/ui/Toast';
import type { ServerMessage } from '@/types/messages';

interface CelebrationState {
  type: 'line' | 'bingo' | null;
  playerName: string;
  avatarId: string;
  lineType?: 'row' | 'column' | 'diagonal';
  points?: number;
  isFirstWinner?: boolean;
  completedCount?: number;
  totalPlayers?: number;
}

export default function HostPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pin = params.pin as string;

  // Verifica se veio como host via URL (evita problema de nova conexão WebSocket)
  const isHostParam = searchParams.get('isHost') === 'true';

  // Store
  const {
    drawnBalls,
    currentBall,
    ranking,
    gamePhase,
    roomState,
    currentPlayerId,
  } = useGameStore();

  // Sons
  const { playBallDraw, playLineComplete, playBingoWin, playPlayerJoined } = useSound();

  // Celebração
  const [celebration, setCelebration] = useState<CelebrationState>({
    type: null,
    playerName: '',
    avatarId: '',
  });

  // Host identificação via IDENTIFY automático (isHost=true vem via sessão)
  const [isHostReady, setIsHostReady] = useState(false);

  // WebSocket - passa isHost=true se veio via URL param
  const { send, isConnected } = usePartySocket({
    roomId: pin,
    onMessage: handleMessage,
    isHost: isHostParam,
  });

  function handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'IDENTITY_CONFIRMED':
        // Host identificado via IDENTIFY automático
        if (message.payload.isHost) {
          setIsHostReady(true);
        }
        break;

      case 'RETURNED_TO_LOBBY':
        // Servidor resetou para nova rodada
        router.push(`/sala/${pin}`);
        break;

      case 'PLAYER_JOINED':
        // Notificação especial para jogador atrasado
        if (message.payload.isLateJoin) {
          playPlayerJoined();
          toast(`${message.payload.player.name} entrou ATRASADO!`, 'warning');
        }
        break;

      case 'PLAYER_DISCONNECTED':
        // Notificação quando jogador desconecta (pode ser temporário - reconexão)
        toast(`${message.payload.playerName} desconectou`, 'warning');
        break;

      case 'BALL_DRAWN':
        playBallDraw();
        break;

      case 'LINE_COMPLETED':
        playLineComplete();
        setCelebration({
          type: 'line',
          playerName: message.payload.playerName,
          avatarId: message.payload.avatarId,
          lineType: message.payload.lineType,
          points: 5,
        });
        break;

      case 'BINGO_WON':
        playBingoWin();
        setCelebration({
          type: 'bingo',
          playerName: message.payload.winnerName,
          avatarId: message.payload.winnerAvatarId,
          isFirstWinner: message.payload.isFirstWinner,
          completedCount: message.payload.completedCount,
          totalPlayers: message.payload.totalPlayers,
        });
        break;

      case 'GAME_ENDED':
        // Jogo terminou - volta para o lobby após 3 segundos
        toast('Jogo finalizado! Todos completaram suas cartelas.', 'info');
        setTimeout(() => {
          router.push(`/sala/${pin}`);
        }, 3000);
        break;

      case 'ERROR':
        if (message.payload.message) {
          toast(message.payload.message, 'error');
        }
        break;
    }
  }

  // Usa roomState.gamePhase diretamente para evitar race conditions com a store
  const serverGamePhase = roomState?.gamePhase;

  // Verifica se é o host - usa isHostParam como autoridade (nova conexão tem ID diferente)
  useEffect(() => {
    // Se veio com isHostParam=true, confia que é o host (já enviou IDENTIFY com isHost=true)
    // Só redireciona se conectado E NÃO veio com isHostParam E servidor confirma que não é host
    if (isConnected && !isHostParam && roomState && serverGamePhase === 'playing' && currentPlayerId) {
      if (currentPlayerId !== roomState.hostId) {
        router.replace(`/sala/${pin}/jogar`);
      }
    }
  }, [isConnected, isHostParam, roomState, serverGamePhase, currentPlayerId, router, pin]);

  // Se o jogo terminou e voltou para lobby (após ter começado)
  useEffect(() => {
    // Se veio como host (isHostParam), não redireciona imediatamente
    // Espera o IDENTIFY ser processado e o estado ser atualizado
    // Só redireciona se conectado E NÃO é isHostParam E servidor confirma que está em lobby
    if (isConnected && !isHostParam && roomState && serverGamePhase === 'lobby') {
      router.replace(`/sala/${pin}`);
    }
  }, [isConnected, isHostParam, serverGamePhase, roomState, router, pin]);

  const handleSpin = () => {
    send({ type: 'DRAW_BALL' });
  };

  const remainingBalls = roomState?.game?.remainingBalls.length ?? 75;

  return (
    <main className="h-screen flex flex-col p-3 sm:p-4 lg:p-5 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-3 lg:gap-4 flex-1 min-h-0">
        {/* Header compacto inline */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Bingo - Host
            </h1>
            <span className="text-white/40 text-sm font-mono">PIN: {pin}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white font-bold">
              {drawnBalls.length}<span className="text-white/40 text-sm font-normal">/75</span>
            </span>
          </div>
        </div>

        {/* Progress Bar compacto */}
        <div className="flex-shrink-0">
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            {/* Glow effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-sm"
              style={{ width: `${(drawnBalls.length / 75) * 100}%` }}
            />
            {/* Progress bar */}
            <motion.div
              className="relative h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(drawnBalls.length / 75) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>
        </div>

        {/* Conteúdo principal - Layout responsivo */}
        <div className="grid lg:grid-cols-12 gap-3 lg:gap-4 flex-1 min-h-0 overflow-hidden lg:overflow-visible">
          {/* Coluna esquerda - Globo */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <Card className="p-4 lg:p-5 w-full h-full flex items-center justify-center">
              <GlobeSpinner
                currentBall={currentBall}
                onSpin={handleSpin}
                remainingBalls={remainingBalls}
                disabled={gamePhase === 'ended' || !isHostReady}
              />
            </Card>
          </div>

          {/* Coluna central - Gabarito */}
          <div className="lg:col-span-5 min-h-0">
            {/* Gabarito - Desktop */}
            <Card className="p-4 hidden lg:flex flex-col h-full">
              <h3 className="text-base font-bold text-white mb-3 flex-shrink-0">Números Sorteados</h3>
              <div className="flex-1 overflow-auto">
                <DrawnNumbers drawnBalls={drawnBalls} currentBall={currentBall} />
              </div>
            </Card>

            {/* Gabarito - Mobile (compacto) */}
            <Card className="p-3 lg:hidden">
              <h3 className="text-sm font-bold text-white mb-2">Números Sorteados</h3>
              <DrawnNumbers drawnBalls={drawnBalls} currentBall={currentBall} compact />
            </Card>
          </div>

          {/* Coluna direita - Ranking */}
          <Card className="lg:col-span-4 p-4 min-h-0 flex flex-col">
            <Ranking ranking={ranking} currentPlayerId={currentPlayerId || undefined} />
          </Card>
        </div>
      </div>

      {/* Celebração de Linha */}
      <LineComplete
        isVisible={celebration.type === 'line'}
        playerName={celebration.playerName}
        avatarId={celebration.avatarId}
        lineType={celebration.lineType || 'row'}
        points={celebration.points || 10}
        onComplete={() => setCelebration({ type: null, playerName: '', avatarId: '' })}
      />

      {/* Celebração de BINGO */}
      <BingoWin
        isVisible={celebration.type === 'bingo'}
        winnerName={celebration.playerName}
        winnerAvatarId={celebration.avatarId}
        finalScores={ranking}
        onClose={() => {
          setCelebration({ type: null, playerName: '', avatarId: '' });
          // Não redireciona mais - jogo continua até todos terminarem
        }}
        onPlayAgain={() => {
          // Volta para o lobby para iniciar novo jogo
          router.push(`/sala/${pin}`);
        }}
      />
    </main>
  );
}
