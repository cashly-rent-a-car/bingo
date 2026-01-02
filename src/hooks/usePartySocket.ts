'use client';

import { useEffect, useRef, useCallback } from 'react';
import PartySocket from 'partysocket';
import { useGameStore } from '@/stores/game-store';
import {
  getStoredSession,
  storeSession,
  clearSession,
  getOrCreateTabId,
  cleanExpiredSessions,
} from '@/lib/utils/session';
import type { ClientMessage, ServerMessage } from '@/types/messages';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

interface UsePartySocketOptions {
  roomId: string;
  onMessage?: (message: ServerMessage) => void;
  // Dados para identificação (novo jogador/host)
  playerName?: string;
  avatarId?: string;
  isHost?: boolean;
}

export function usePartySocket({
  roomId,
  onMessage,
  playerName,
  avatarId,
  isHost,
}: UsePartySocketOptions) {
  const socketRef = useRef<PartySocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const isMountedRef = useRef(true);

  // Refs para dados de identificação (evita dependências no useEffect)
  const playerNameRef = useRef(playerName);
  const avatarIdRef = useRef(avatarId);
  const isHostRef = useRef(isHost);

  // Atualiza refs quando props mudam
  useEffect(() => {
    onMessageRef.current = onMessage;
    playerNameRef.current = playerName;
    avatarIdRef.current = avatarId;
    isHostRef.current = isHost;
  }, [onMessage, playerName, avatarId, isHost]);

  // Limpa sessões expiradas na montagem
  useEffect(() => {
    cleanExpiredSessions();
  }, []);

  // Selectors estáveis do Zustand
  const setRoomState = useGameStore((s) => s.setRoomState);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updatePlayerAvatar = useGameStore((s) => s.updatePlayerAvatar);
  const setPlayerConnected = useGameStore((s) => s.setPlayerConnected);
  const setMyCard = useGameStore((s) => s.setMyCard);
  const addDrawnBall = useGameStore((s) => s.addDrawnBall);
  const setDrawnBalls = useGameStore((s) => s.setDrawnBalls);
  const setRanking = useGameStore((s) => s.setRanking);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const setIsConnected = useGameStore((s) => s.setIsConnected);
  const setCurrentPlayerId = useGameStore((s) => s.setCurrentPlayerId);
  const reset = useGameStore((s) => s.reset);
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

      // Recupera sessão existente
      const storedSession = getStoredSession(roomId);
      const tabId = getOrCreateTabId(roomId);

      console.log('[SOCKET] Connected. Sending IDENTIFY...', {
        hasSession: !!storedSession,
        playerName: playerNameRef.current,
        isHost: isHostRef.current,
      });

      // Envia IDENTIFY para o servidor
      socket.send(JSON.stringify({
        type: 'IDENTIFY',
        payload: {
          sessionToken: storedSession?.sessionToken || null,
          tabId,
          playerName: playerNameRef.current,
          avatarId: avatarIdRef.current,
          isHost: isHostRef.current,
        },
      }));
    });

    socket.addEventListener('message', (event) => {
      if (!isMountedRef.current) return;

      try {
        const message: ServerMessage = JSON.parse(event.data);

        // Handle message internamente
        switch (message.type) {
          case 'IDENTITY_CONFIRMED': {
            console.log('[SOCKET] Identity confirmed:', {
              playerId: message.payload.playerId,
              isReconnection: message.payload.isReconnection,
              isHost: message.payload.isHost,
            });

            setCurrentPlayerId(message.payload.playerId);
            setIsConnected(true);

            // Salva sessão no localStorage
            storeSession(roomId, {
              sessionToken: message.payload.sessionToken,
              playerName: message.payload.playerName,
              avatarId: message.payload.avatarId,
              isHost: message.payload.isHost,
              createdAt: Date.now(),
              lastActiveAt: Date.now(),
            });

            // Restaura estado se reconectando durante jogo
            if (message.payload.isReconnection) {
              if (message.payload.card) {
                setMyCard(message.payload.card);
              }
              if (message.payload.drawnBalls) {
                setDrawnBalls(message.payload.drawnBalls);
              }
              if (message.payload.ranking) {
                setRanking(message.payload.ranking);
              }
            }

            setGamePhase(message.payload.gamePhase);
            break;
          }

          case 'IDENTITY_REJECTED': {
            console.log('[SOCKET] Identity rejected:', message.payload.reason);
            // Limpa sessão inválida
            clearSession(roomId);
            // Callback para UI mostrar erro
            break;
          }

          case 'RETURNED_TO_LOBBY': {
            console.log('[SOCKET] Returned to lobby - resetting state');
            // Reset completo do estado
            reset();
            // Limpa sessão para forçar nova identificação
            clearSession(roomId);
            setGamePhase('lobby');
            break;
          }

          case 'ROOM_STATE':
            setRoomState(message.payload);
            break;

          case 'PLAYER_JOINED':
            addPlayer(message.payload.player);
            break;

          case 'PLAYER_LEFT':
            removePlayer(message.payload.playerId);
            break;

          case 'PLAYER_DISCONNECTED':
            // Marca jogador como offline (não remove)
            setPlayerConnected(message.payload.playerId, false);
            break;

          case 'AVATAR_CHANGED':
            updatePlayerAvatar(message.payload.playerId, message.payload.avatarId);
            break;

          case 'GAME_STARTED':
            setGamePhase('playing');
            if (socket.id && message.payload.cards[socket.id]) {
              setMyCard(message.payload.cards[socket.id]);
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
            // Não encerra o jogo - apenas atualiza ranking
            setRanking(message.payload.finalScores);
            break;

          case 'GAME_ENDED':
            setGamePhase('ended');
            setRanking(message.payload.finalScores);
            break;

          case 'REJOIN_SUCCESS':
            // Fallback para sistema antigo (será removido depois)
            setCurrentPlayerId(message.payload.playerId);
            setMyCard(message.payload.card);
            setDrawnBalls(message.payload.drawnBalls);
            break;

          case 'LATE_JOIN_SUCCESS':
            // Fallback para sistema antigo
            setMyCard(message.payload.card);
            setDrawnBalls(message.payload.drawnBalls);
            setRanking(message.payload.ranking);
            setGamePhase('playing');
            break;

          case 'HOST_CONNECTED':
            // Host conectou/reconectou
            break;

          case 'ERROR':
            console.error('Server error:', message.payload);
            break;
        }

        // Callback externo via ref
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

    // Cleanup
    return () => {
      isMountedRef.current = false;
      socket.close();
      socketRef.current = null;
    };
  }, [roomId, setRoomState, addPlayer, removePlayer, updatePlayerAvatar, setPlayerConnected, setMyCard, addDrawnBall, setDrawnBalls, setRanking, setGamePhase, setIsConnected, setCurrentPlayerId, reset]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  return {
    socket: socketRef.current,
    send,
    isConnected,
    reconnect,
  };
}
