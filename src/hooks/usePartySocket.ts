'use client';

import { useEffect, useRef, useCallback } from 'react';
import PartySocket from 'partysocket';
import { useGameStore } from '@/stores/game-store';
import type { ClientMessage, ServerMessage } from '@/types/messages';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

interface UsePartySocketOptions {
  roomId: string;
  onMessage?: (message: ServerMessage) => void;
}

export function usePartySocket({ roomId, onMessage }: UsePartySocketOptions) {
  const socketRef = useRef<PartySocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const isMountedRef = useRef(true);

  // Atualiza ref quando onMessage muda (sem causar re-render do useEffect)
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Selectors estáveis do Zustand (funções são estáveis por natureza)
  const setRoomState = useGameStore((s) => s.setRoomState);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updatePlayerAvatar = useGameStore((s) => s.updatePlayerAvatar);
  const setMyCard = useGameStore((s) => s.setMyCard);
  const addDrawnBall = useGameStore((s) => s.addDrawnBall);
  const setDrawnBalls = useGameStore((s) => s.setDrawnBalls);
  const setRanking = useGameStore((s) => s.setRanking);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const setIsConnected = useGameStore((s) => s.setIsConnected);
  const setCurrentPlayerId = useGameStore((s) => s.setCurrentPlayerId);
  const isConnected = useGameStore((s) => s.isConnected);

  const send = useCallback((message: ClientMessage): boolean => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      console.log('[SOCKET] Message sent:', message.type);
      return true;
    }
    console.log('[SOCKET] Cannot send - socket not ready. readyState:', socketRef.current?.readyState);
    return false;
  }, []);

  // Conexão única com roomId como dependência
  useEffect(() => {
    isMountedRef.current = true;

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId,
    });

    socket.addEventListener('open', () => {
      if (!isMountedRef.current) return;
      setIsConnected(true);
      setCurrentPlayerId(socket.id);
    });

    socket.addEventListener('message', (event) => {
      if (!isMountedRef.current) return;

      try {
        const message: ServerMessage = JSON.parse(event.data);

        // Handle message internamente
        switch (message.type) {
          case 'ROOM_STATE':
            setRoomState(message.payload);
            break;

          case 'PLAYER_JOINED':
            addPlayer(message.payload.player);
            break;

          case 'PLAYER_LEFT':
            removePlayer(message.payload.playerId);
            break;

          case 'AVATAR_CHANGED':
            updatePlayerAvatar(message.payload.playerId, message.payload.avatarId);
            break;

          case 'GAME_STARTED':
            setGamePhase('playing');
            if (socket.id && message.payload.cards[socket.id]) {
              setMyCard(message.payload.cards[socket.id]);
              // Salva playerId no localStorage para reconexão após navegação
              try {
                localStorage.setItem(`bingo_player_${roomId}`, socket.id);
                console.log('[SOCKET] Stored playerId:', socket.id, 'for room:', roomId);
              } catch (e) {
                console.error('[SOCKET] Failed to store playerId:', e);
              }
            }
            break;

          case 'BALL_DRAWN':
            addDrawnBall(message.payload.ball);
            setDrawnBalls(message.payload.drawnBalls);
            break;

          case 'RANKING_UPDATE':
            setRanking(message.payload.ranking);
            break;

          case 'BINGO_WON':
            // Não encerra mais o jogo - apenas atualiza ranking
            // Jogo continua até todos completarem ou GAME_ENDED ser recebido
            setRanking(message.payload.finalScores);
            break;

          case 'GAME_ENDED':
            // Agora sim o jogo termina
            setGamePhase('ended');
            setRanking(message.payload.finalScores);
            break;

          case 'REJOIN_SUCCESS':
            // Reconexão bem-sucedida - atualiza playerId, cartela e bolas sorteadas
            setCurrentPlayerId(message.payload.playerId);
            setMyCard(message.payload.card);
            setDrawnBalls(message.payload.drawnBalls);
            break;

          case 'LATE_JOIN_SUCCESS':
            // Entrada tardia - jogador entrou após jogo iniciar
            setMyCard(message.payload.card);
            setDrawnBalls(message.payload.drawnBalls);
            setRanking(message.payload.ranking);
            setGamePhase('playing');
            // Salva playerId no localStorage para reconexão
            try {
              localStorage.setItem(`bingo_player_${roomId}`, socket.id);
              console.log('[SOCKET] Late join - stored playerId:', socket.id, 'for room:', roomId);
            } catch (e) {
              console.error('[SOCKET] Failed to store playerId:', e);
            }
            break;

          case 'HOST_CONNECTED':
            // Host conectou/reconectou - atualiza hostId no state
            break;

          case 'ERROR':
            console.error('Server error:', message.payload);
            break;
        }

        // Callback externo via ref (não causa re-render)
        onMessageRef.current?.(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    socket.addEventListener('close', () => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
    });

    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socketRef.current = socket;

    // Cleanup - NÃO chamar setIsConnected aqui para evitar loop
    return () => {
      isMountedRef.current = false;
      socket.close();
      socketRef.current = null;
    };
  }, [roomId, setRoomState, addPlayer, removePlayer, updatePlayerAvatar, setMyCard, addDrawnBall, setDrawnBalls, setRanking, setGamePhase, setIsConnected, setCurrentPlayerId]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    // O useEffect vai reconectar automaticamente quando roomId mudar
    // Para forçar reconexão manual, podemos usar um state separado se necessário
  }, []);

  return {
    socket: socketRef.current,
    send,
    isConnected,
    reconnect,
  };
}
