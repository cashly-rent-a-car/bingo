// Tipos para o painel admin

export interface RoomStats {
  pin: string;
  gamePhase: 'lobby' | 'playing' | 'ended';
  playerCount: number;
  connectedCount: number;
  createdAt: number;
  lastActivity: number;
}

export interface AdminStats {
  rooms: Record<string, RoomStats>;
  totalRooms: number;
  totalPlayers: number;
  lastUpdate: number;
}

// Mensagens do admin
export type AdminClientMessage =
  | { type: 'AUTHENTICATE'; payload: { password: string } }
  | { type: 'REQUEST_STATS' };

export type AdminServerMessage =
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_FAILED'; payload: { message: string } }
  | { type: 'STATS_UPDATE'; payload: AdminStats }
  | { type: 'ROOM_REGISTERED'; payload: RoomStats }
  | { type: 'ROOM_UPDATED'; payload: RoomStats }
  | { type: 'ROOM_REMOVED'; payload: { pin: string } };

// Mensagens que as salas de jogo enviam para o admin
export type GameToAdminMessage =
  | { type: 'REGISTER_ROOM'; payload: RoomStats }
  | { type: 'UPDATE_ROOM'; payload: RoomStats }
  | { type: 'REMOVE_ROOM'; payload: { pin: string } };
