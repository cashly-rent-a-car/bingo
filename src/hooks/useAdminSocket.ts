'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import PartySocket from 'partysocket';
import type { AdminStats, AdminClientMessage, AdminServerMessage } from '@/types/admin';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

interface UseAdminSocketReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  stats: AdminStats | null;
  authenticate: (password: string) => void;
}

export function useAdminSocket(): UseAdminSocketReturn {
  const socketRef = useRef<PartySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const send = useCallback((message: AdminClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const authenticate = useCallback((password: string) => {
    setAuthError(null);
    send({ type: 'AUTHENTICATE', payload: { password } });
  }, [send]);

  useEffect(() => {
    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: '__admin__',
      party: 'admin',
    });

    socket.addEventListener('open', () => {
      setIsConnected(true);
      console.log('[ADMIN] Connected to admin room');
    });

    socket.addEventListener('close', () => {
      setIsConnected(false);
      setIsAuthenticated(false);
      console.log('[ADMIN] Disconnected from admin room');
    });

    socket.addEventListener('message', (event) => {
      try {
        const message: AdminServerMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'AUTH_SUCCESS':
            setIsAuthenticated(true);
            setAuthError(null);
            break;

          case 'AUTH_FAILED':
            setIsAuthenticated(false);
            setAuthError(message.payload.message);
            break;

          case 'STATS_UPDATE':
            setStats(message.payload);
            break;

          case 'ROOM_REGISTERED':
          case 'ROOM_UPDATED':
            setStats((prev) => {
              if (!prev) return prev;
              const rooms = { ...prev.rooms, [message.payload.pin]: message.payload };
              const roomList = Object.values(rooms);
              return {
                rooms,
                totalRooms: roomList.length,
                totalPlayers: roomList.reduce((sum, r) => sum + r.connectedCount, 0),
                lastUpdate: Date.now(),
              };
            });
            break;

          case 'ROOM_REMOVED':
            setStats((prev) => {
              if (!prev) return prev;
              const rooms = { ...prev.rooms };
              delete rooms[message.payload.pin];
              const roomList = Object.values(rooms);
              return {
                rooms,
                totalRooms: roomList.length,
                totalPlayers: roomList.reduce((sum, r) => sum + r.connectedCount, 0),
                lastUpdate: Date.now(),
              };
            });
            break;
        }
      } catch (error) {
        console.error('[ADMIN] Error parsing message:', error);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  return {
    isConnected,
    isAuthenticated,
    authError,
    stats,
    authenticate,
  };
}
