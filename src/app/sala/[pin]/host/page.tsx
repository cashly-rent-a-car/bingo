'use client';

import { useEffect, useState, useRef } from 'react';
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
  const { playBallDraw, playLineComplete, playBingoWin } = useSound();

  // Celebração
  const [celebration, setCelebration] = useState<CelebrationState>({
    type: null,
    playerName: '',
    avatarId: '',
  });

  // Track se já enviou CLAIM_HOST (usando ref para evitar re-renders)
  const hasClaimedHostRef = useRef(false);
  const [isHostReady, setIsHostReady] = useState(false);

  // WebSocket - send será definido abaixo
  const { send, isConnected } = usePartySocket({
    roomId: pin,
    onMessage: handleMessage,
  });

  function handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'ROOM_STATE':
        // Quando recebe ROOM_STATE e é host, envia CLAIM_HOST imediatamente
        if (isHostParam && !hasClaimedHostRef.current) {
          hasClaimedHostRef.current = true;
          // Envia CLAIM_HOST para atualizar hostId no servidor
          send({ type: 'CLAIM_HOST' });
          // Não seta isHostReady ainda - espera confirmação do servidor
        } else if (hasClaimedHostRef.current) {
          // Este é um ROOM_STATE subsequente após CLAIM_HOST ter sido enviado
          // O servidor já processou e atualizou o hostId
          setIsHostReady(true);
        }
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
    // Se veio com isHostParam=true, confia que é o host (já enviou CLAIM_HOST)
    // Só redireciona se NÃO veio com isHostParam E servidor confirma que não é host
    if (!isHostParam && roomState && serverGamePhase === 'playing' && currentPlayerId) {
      if (currentPlayerId !== roomState.hostId) {
        router.replace(`/sala/${pin}/jogar`);
      }
    }
  }, [isHostParam, roomState, serverGamePhase, currentPlayerId, router, pin]);

  // Se o jogo terminou e voltou para lobby (após ter começado)
  useEffect(() => {
    // Se veio como host (isHostParam), não redireciona imediatamente
    // Espera o CLAIM_HOST ser processado e o estado ser atualizado
    // Só redireciona se NÃO é isHostParam E servidor confirma que está em lobby
    if (!isHostParam && roomState && serverGamePhase === 'lobby') {
      router.replace(`/sala/${pin}`);
    }
  }, [isHostParam, serverGamePhase, roomState, router, pin]);

  const handleSpin = () => {
    send({ type: 'DRAW_BALL' });
  };

  const remainingBalls = roomState?.game?.remainingBalls.length ?? 75;

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-6">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col gap-6 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Bingo - Host
            </h1>
            <p className="text-white/60">PIN: {pin}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white/60 text-sm hidden sm:inline">
              {drawnBalls.length}/75 bolas
            </span>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="grid lg:grid-cols-3 gap-6 flex-1">
          {/* Coluna esquerda - Globo e Gabarito */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Globo */}
            <Card className="p-6 flex items-center justify-center">
              <GlobeSpinner
                currentBall={currentBall}
                onSpin={handleSpin}
                remainingBalls={remainingBalls}
                disabled={gamePhase === 'ended' || !isHostReady}
              />
            </Card>

            {/* Gabarito - Desktop */}
            <Card className="p-6 hidden lg:block">
              <h3 className="text-lg font-bold text-white mb-4">Números Sorteados</h3>
              <DrawnNumbers drawnBalls={drawnBalls} currentBall={currentBall} />
            </Card>

            {/* Gabarito - Mobile (compacto) */}
            <Card className="p-4 lg:hidden">
              <h3 className="text-sm font-bold text-white mb-2">Números Sorteados</h3>
              <DrawnNumbers drawnBalls={drawnBalls} currentBall={currentBall} compact />
            </Card>
          </div>

          {/* Coluna direita - Ranking */}
          <Card className="p-6">
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
