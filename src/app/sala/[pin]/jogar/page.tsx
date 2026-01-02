'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartySocket } from '@/hooks/usePartySocket';
import { useGameStore } from '@/stores/game-store';
import { useSound } from '@/hooks/useSound';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BingoCard } from '@/components/game/BingoCard';
import { DrawnNumbers, CurrentBall } from '@/components/game/DrawnNumbers';
import { Ranking } from '@/components/game/Ranking';
import { LineComplete } from '@/components/celebrations/LineComplete';
import { BingoWin } from '@/components/celebrations/BingoWin';
import { toast } from '@/components/ui/Toast';
import type { ServerMessage } from '@/types/messages';
import type { BingoCard as BingoCardType } from '@/types/game';

type ViewMode = 'card' | 'globe' | 'ranking';

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

export default function JogarPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;
  const hasRejoinedRef = useRef(false);

  // Store
  const {
    drawnBalls,
    currentBall,
    ranking,
    gamePhase,
    myCard,
    setMyCard,
    roomState,
    currentPlayerId,
  } = useGameStore();

  // Estado local
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [localCard, setLocalCard] = useState<BingoCardType | null>(null);
  const [myBingoCompleted, setMyBingoCompleted] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationState>({
    type: null,
    playerName: '',
    avatarId: '',
  });

  // Sons
  const { playBallDraw, playNumberMarked, playErrorShake, playLineComplete, playBingoWin } = useSound();

  // WebSocket
  const { send, isConnected } = usePartySocket({
    roomId: pin,
    onMessage: handleMessage,
  });

  function handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'REJOIN_SUCCESS':
        // Reconexão bem-sucedida - atualiza a cartela
        const rejoinedCard = message.payload.card;
        setMyCard(rejoinedCard);
        setLocalCard(rejoinedCard);
        // Atualiza o playerId no localStorage com o novo ID
        localStorage.setItem(`bingo_player_${pin}`, message.payload.playerId);
        break;

      case 'GAME_STARTED':
        if (currentPlayerId && message.payload.cards[currentPlayerId]) {
          const card = message.payload.cards[currentPlayerId];
          setMyCard(card);
          setLocalCard(card);
        }
        break;

      case 'BALL_DRAWN':
        playBallDraw();
        break;

      case 'NUMBER_MARKED':
        if (message.payload.playerId === currentPlayerId) {
          if (message.payload.valid) {
            // Atualiza a cartela local
            if (localCard) {
              const updatedCard = { ...localCard };
              for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                  if (updatedCard.cells[row][col].number === message.payload.number) {
                    updatedCard.cells[row][col] = {
                      ...updatedCard.cells[row][col],
                      isMarked: true,
                    };
                  }
                }
              }
              setLocalCard(updatedCard);
            }
          } else {
            playErrorShake();
          }
        }
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
        // Se sou eu que completei, marca como completado
        if (message.payload.winnerId === currentPlayerId) {
          setMyBingoCompleted(true);
        }
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
        toast(message.payload.message, 'error');
        break;
    }
  }

  // Inicializa a cartela local com a do store
  useEffect(() => {
    if (myCard && !localCard) {
      setLocalCard(myCard);
    }
  }, [myCard]);

  // Envia REJOIN_GAME quando conectar para recuperar dados do jogador
  useEffect(() => {
    console.log('[JOGAR] useEffect triggered. isConnected:', isConnected, 'hasRejoined:', hasRejoinedRef.current);

    if (isConnected && !hasRejoinedRef.current) {
      const storedPlayerId = localStorage.getItem(`bingo_player_${pin}`);
      console.log('[JOGAR] localStorage key:', `bingo_player_${pin}`);
      console.log('[JOGAR] localStorage playerId:', storedPlayerId);
      console.log('[JOGAR] Current connection playerId:', currentPlayerId);

      // Debug: mostrar todas as chaves do localStorage que contêm 'bingo'
      const bingoKeys = Object.keys(localStorage).filter(k => k.includes('bingo'));
      console.log('[JOGAR] All bingo localStorage keys:', bingoKeys);

      if (storedPlayerId) {
        console.log('[JOGAR] Attempting to send REJOIN_GAME...');
        const sent = send({
          type: 'REJOIN_GAME',
          payload: { oldPlayerId: storedPlayerId },
        });

        if (sent) {
          hasRejoinedRef.current = true;
          console.log('[JOGAR] ✅ REJOIN_GAME sent successfully');
        } else {
          // Socket não está pronto - não marcar hasRejoinedRef
          // O useEffect vai rodar de novo quando isConnected mudar
          console.log('[JOGAR] ⚠️ Socket not ready - will retry on next render');
        }
      } else {
        console.log('[JOGAR] ⚠️ No stored playerId found - REJOIN will fail!');
      }
    }
  }, [isConnected, pin, send, currentPlayerId]);

  // Se o jogo não começou, volta para o lobby
  useEffect(() => {
    if (gamePhase === 'lobby') {
      router.replace(`/sala/${pin}`);
    }
  }, [gamePhase]);

  const handleMarkNumber = (number: number, position: { row: number; col: number }) => {
    send({
      type: 'MARK_NUMBER',
      payload: { number, position },
    });
  };

  const handleClaimBingo = () => {
    send({ type: 'CLAIM_BINGO' });
  };

  // Verifica se pode clamar bingo (só se ainda não claimou)
  const canClaimBingo = !myBingoCompleted && localCard?.cells.every((row) =>
    row.every((cell) => cell.isMarked)
  );

  const myScore = ranking.find((r) => r.playerId === currentPlayerId)?.score ?? 0;
  const myPosition = ranking.findIndex((r) => r.playerId === currentPlayerId) + 1;

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-6">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto w-full flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Bingo</h1>
            <p className="text-white/60 text-sm">PIN: {pin}</p>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className="text-2xl font-black text-white">{myScore} pts</div>
            <div className="text-white/60 text-sm">
              {myPosition > 0 ? `${myPosition}º lugar` : '-'}
            </div>
          </div>
        </div>

        {/* Toggle de visualização (mobile) */}
        <div className="flex gap-2 bg-white/10 rounded-xl p-1">
          {[
            { mode: 'card' as ViewMode, label: 'Cartela', icon: '🎯' },
            { mode: 'globe' as ViewMode, label: 'Globo', icon: '🎱' },
            { mode: 'ranking' as ViewMode, label: 'Ranking', icon: '🏆' },
          ].map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Conteúdo principal */}
        <AnimatePresence mode="wait">
          {viewMode === 'card' && localCard && (
            <motion.div
              key="card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="p-4">
                <BingoCard
                  card={localCard}
                  drawnBalls={drawnBalls}
                  onMarkNumber={handleMarkNumber}
                  disabled={gamePhase === 'ended' || myBingoCompleted}
                />

                {/* Botão BINGO */}
                {canClaimBingo && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4"
                  >
                    <Button
                      variant="primary"
                      size="xl"
                      className="w-full animate-pulse"
                      onClick={handleClaimBingo}
                    >
                      🎉 BINGO! 🎉
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {viewMode === 'globe' && (
            <motion.div
              key="globe"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Bola atual */}
              <Card className="p-6 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-4">Último número</p>
                  <CurrentBall ball={currentBall} />
                </div>
              </Card>

              {/* Números sorteados */}
              <Card className="p-4">
                <h3 className="text-sm font-bold text-white mb-2">Números Sorteados</h3>
                <DrawnNumbers drawnBalls={drawnBalls} currentBall={currentBall} compact />
              </Card>
            </motion.div>
          )}

          {viewMode === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="p-4">
                <Ranking ranking={ranking} currentPlayerId={currentPlayerId || undefined} />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status bar fixa */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-white/10 p-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white/60 text-sm">
                {drawnBalls.length}/75 bolas
              </span>
            </div>

            {currentBall && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Última:</span>
                <span className="font-bold text-white">
                  {currentBall.column}-{currentBall.number}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Espaço para a status bar */}
        <div className="h-16" />
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
          // Só volta ao lobby quando receber GAME_ENDED
        }}
      />
    </main>
  );
}
