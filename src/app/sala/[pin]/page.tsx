'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartySocket } from '@/hooks/usePartySocket';
import { useGameStore } from '@/stores/game-store';
import { useSound } from '@/hooks/useSound';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PlayerList } from '@/components/lobby/PlayerList';
import { AvatarPicker } from '@/components/lobby/AvatarPicker';
import { ShareRoom } from '@/components/lobby/ShareRoom';
import { toast } from '@/components/ui/Toast';
import { getRandomAvatar, Avatar, AVATARS } from '@/lib/constants/avatars';
import { generateMagicLink } from '@/lib/utils/magic-link';
import { getStoredSession, getOrCreateTabId } from '@/lib/utils/session';
import type { ServerMessage } from '@/types/messages';

export default function SalaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pin = params.pin as string;

  // Query params
  const isHostParam = searchParams.get('host') === 'true';
  const nameParam = searchParams.get('name') || '';
  const avatarParam = searchParams.get('avatar') || '';

  // Estado local
  const [hasJoined, setHasJoined] = useState(false);
  const [name, setName] = useState(nameParam);
  // Usa avatar do param ou primeiro avatar como default para evitar hydration mismatch
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
    AVATARS.find(a => a.id === avatarParam) || AVATARS[0]
  );

  // Define avatar aleatório apenas no cliente (se não veio por param)
  useEffect(() => {
    if (!avatarParam && !isHostParam) {
      setSelectedAvatar(getRandomAvatar());
    }
  }, [avatarParam, isHostParam]);
  const [isJoining, setIsJoining] = useState(false);

  // Store
  const { players, gamePhase, isConnected, currentPlayerId, setIsHost } = useGameStore();
  const hostId = useGameStore((s) => s.roomState?.hostId || '');

  // Sons
  const { playPlayerJoined } = useSound();

  // Verifica se já tem sessão (reconexão) - memoizado para evitar loops infinitos
  const storedSession = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getStoredSession(pin);
  }, [pin]);

  // Conexão WebSocket - passa dados para IDENTIFY automatico
  const { send, isConnected: socketConnected } = usePartySocket({
    roomId: pin,
    onMessage: handleMessage,
    // Se é host, passa isHost=true para IDENTIFY
    // Se já tem sessão, os dados vêm do servidor
    // Se é jogador novo, passa name/avatar após formulário
    playerName: hasJoined ? name : storedSession?.playerName,
    avatarId: hasJoined ? selectedAvatar.id : storedSession?.avatarId,
    isHost: isHostParam,
  });

  function handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'PLAYER_JOINED':
        if (message.payload.player.id !== currentPlayerId) {
          playPlayerJoined();
          toast(`${message.payload.player.name} entrou na sala!`, 'info');
        }
        break;

      case 'PLAYER_LEFT':
        toast(`${message.payload.playerName} saiu da sala`, 'info');
        break;

      case 'GAME_STARTED': {
        // Redireciona para a página correta
        // Usa isHostParam como fallback confiável (veio da URL ao criar sala)
        const isHostPlayer = isHostParam || currentPlayerId === hostId;

        if (isHostPlayer) {
          // Passa flag de host na URL para manter identidade na nova conexão
          router.push(`/sala/${pin}/host?isHost=true`);
        } else {
          // localStorage já foi setado pelo usePartySocket no handler GAME_STARTED
          // usando socket.id diretamente (sempre correto, sem stale closure)
          router.push(`/sala/${pin}/jogar`);
        }
        break;
      }

      case 'LATE_JOIN_SUCCESS':
        // Jogador entrou após o jogo ter iniciado
        toast('O jogo ja comecou! Voce entrou atrasado.', 'warning');
        router.push(`/sala/${pin}/jogar?late=true`);
        break;

      case 'IDENTITY_CONFIRMED':
        // Sessão confirmada - marca como joined
        if (message.payload.playerName || message.payload.isHost) {
          setHasJoined(true);
        }
        // Detecta entrada tardia: se gamePhase é 'playing' e não é host, é late join
        if (message.payload.gamePhase === 'playing' && !message.payload.isHost && message.payload.card) {
          toast('O jogo ja comecou! Voce entrou atrasado.', 'warning');
          router.push(`/sala/${pin}/jogar?late=true`);
        }
        break;

      case 'IDENTITY_REJECTED':
        // Sessão rejeitada - mostra erro
        toast(message.payload.message, 'error');
        break;

      case 'RETURNED_TO_LOBBY':
        // Voltou ao lobby para nova rodada
        toast(message.payload.message, 'info');
        break;

      case 'ERROR':
        toast(message.payload.message, 'error');
        break;
    }
  }

  // Atualiza isHost na store quando confirmado
  useEffect(() => {
    if (currentPlayerId && hostId) {
      setIsHost(currentPlayerId === hostId);
    }
  }, [currentPlayerId, hostId, setIsHost]);

  // Auto-join para host (IDENTIFY já foi enviado com isHost=true)
  useEffect(() => {
    if (isHostParam && socketConnected) {
      setHasJoined(true);
      setIsHost(true);
    }
  }, [isHostParam, socketConnected, setIsHost]);

  // Auto-join se tem sessão válida
  // Usa sessionToken como dependência (primitivo) para evitar loops
  const sessionToken = storedSession?.sessionToken;
  useEffect(() => {
    if (sessionToken && socketConnected && !hasJoined) {
      setHasJoined(true);
      if (storedSession?.isHost) {
        setIsHost(true);
      }
    }
  }, [sessionToken, socketConnected, hasJoined, storedSession?.isHost, setIsHost]);

  // Jogador normal entra com nome e avatar
  const handleJoin = () => {
    if (!name.trim()) return;

    setIsJoining(true);

    // Envia IDENTIFY com dados do novo jogador
    // O hook vai enviar quando reconectar com os novos dados
    send({
      type: 'IDENTIFY',
      payload: {
        sessionToken: null,
        tabId: getOrCreateTabId(pin),
        playerName: name.trim(),
        avatarId: selectedAvatar.id,
        isHost: false,
      },
    });

    setHasJoined(true);
    setIsJoining(false);
  };

  const handleStartGame = () => {
    send({ type: 'START_GAME' });
  };

  const playersList = Object.values(players);
  // Usa isHostParam como fallback enquanto o servidor não confirma
  const isHost = isHostParam || (currentPlayerId !== '' && currentPlayerId === hostId);
  const canStart = playersList.length >= 1 && isHost;

  // Loading state - mostra enquanto não conectou
  if (!socketConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60">Conectando à sala...</p>
        </div>
      </main>
    );
  }

  // Form para entrar (apenas jogadores normais, host pula direto para lobby)
  if (!hasJoined && !isHostParam) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Entrar na Sala</h1>
            <p className="text-white/60">PIN: <span className="font-mono font-bold">{pin}</span></p>
          </div>

          <Card className="p-6 space-y-6">
            <Input
              label="Seu nome"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
            />

            <AvatarPicker
              selectedId={selectedAvatar.id}
              onSelect={setSelectedAvatar}
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleJoin}
              disabled={!name.trim()}
              isLoading={isJoining}
            >
              Entrar
            </Button>
          </Card>
        </motion.div>
      </main>
    );
  }

  // Lobby
  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto w-full flex flex-col gap-4 flex-1">
        {/* Header compacto */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Sala de Bingo
            </h1>
            <p className="text-white/60 text-sm">
              {gamePhase === 'lobby' ? 'Aguardando jogadores...' : 'Jogo em andamento'}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white/60 text-xs">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* PIN e compartilhamento - compacto */}
        <Card className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
          {isHost ? (
            <ShareRoom pin={pin} magicLink={generateMagicLink(pin)} />
          ) : (
            <div className="text-center">
              <div className="text-xs text-white/60 uppercase tracking-wider mb-1">PIN da Sala</div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-[0.3em]">
                {pin}
              </div>
            </div>
          )}
        </Card>

        {/* Lista de jogadores - área principal expandida */}
        <Card className="p-4 flex-1 min-h-[300px]">
          <PlayerList
            players={playersList}
            hostId={hostId}
            currentPlayerId={currentPlayerId || undefined}
          />
        </Card>

        {/* Rodapé com ações */}
        <div className="mt-auto">
          {isHost ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                variant="primary"
                size="xl"
                className="w-full"
                onClick={handleStartGame}
                disabled={!canStart}
              >
                🎲 INICIAR JOGO {playersList.length > 0 && `(${playersList.length} jogador${playersList.length > 1 ? 'es' : ''})`}
              </Button>
              {playersList.length < 1 && (
                <p className="text-center text-white/40 text-sm mt-2">
                  Aguarde jogadores entrarem...
                </p>
              )}
            </motion.div>
          ) : (
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <p className="text-white/60 text-sm">
                Aguardando o host iniciar o jogo...
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
