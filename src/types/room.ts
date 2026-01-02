// Tipos da sala e jogadores

import type { BingoCard, CompletedLine, GameState, GamePhase } from './game';

export interface Player {
  id: string;
  name: string;
  avatarId: string;
  joinedAt: number;
  isHost: boolean;
  isConnected: boolean;
  card: BingoCard | null;
  markedNumbers: number[];
  score: number;
  completedLines: CompletedLine[];
  hasBingo: boolean;
  bingoCompletedAt?: number;  // Timestamp de quando completou a cartela
  bingoPosition?: number;     // Posição de conclusão (1 = primeiro, 2 = segundo, etc.)
}

export interface RoomState {
  pin: string;
  magicLink: string;
  createdAt: number;
  expiresAt: number;
  hostId: string;
  hostName: string;
  players: Record<string, Player>;
  gamePhase: GamePhase;
  game: GameState | null;
}

export interface RoomConfig {
  maxPlayers?: number;
  lineBonusPoints?: number;
}
